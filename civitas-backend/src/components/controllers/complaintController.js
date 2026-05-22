const Complaint = require('../../models/Complaint');
const User = require('../../models/user');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// FIX: controllers/ is at src/components/controllers, go up 4 levels to backend root then uploads
const uploadsDir = path.join(__dirname, '..', '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`),
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'), false);
  }
};

const uploadNGOResolutionPhoto = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

exports.createComplaint = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Photo is required for the complaint.' });
    }
    const { category, subType, description, address, latitude, longitude, severity } = req.body;
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not found.' });
    }
    const complaint = new Complaint({
      category, subType, description, address,
      location: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
      photo: `uploads/${req.file.filename}`,
      severity,
      submittedBy: req.user.id,
    });
    await complaint.save();
    res.status(201).json({ success: true, message: 'Complaint submitted successfully!', complaint });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('createComplaint error:', error);
    res.status(500).json({ success: false, message: 'Server error during complaint submission.' });
  }
};

exports.getMyComplaints = async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ success: false, message: 'Not authorized.' });
    const complaints = await Complaint.find({ submittedBy: req.user.id }).sort({ submittedAt: -1 });
    res.status(200).json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching your complaints.' });
  }
};

exports.reraiseComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user || !req.user.id) return res.status(401).json({ success: false, message: 'Not authorized.' });
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });
    if (complaint.submittedBy.toString() !== req.user.id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized to reraise this complaint.' });
    if (complaint.status === 'Resolved' || complaint.status === 'Rejected')
      return res.status(400).json({ success: false, message: `Cannot reraise. Status: ${complaint.status}.` });
    complaint.reraisedCount += 1;
    complaint.updates.push({ date: new Date(), text: `Complaint reraised by user (Count: ${complaint.reraisedCount}).`, updatedBy: req.user.id });
    await complaint.save();
    res.status(200).json({ success: true, message: 'Complaint reraised successfully!', complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during complaint reraise.' });
  }
};

exports.getCityComplaintStats = async (req, res) => {
  try {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const stats = await Complaint.aggregate([
      { $match: { submittedAt: { $gte: twoWeeksAgo } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { _id: 0, category: '$_id', count: 1 } },
      { $sort: { count: -1 } }
    ]);
    res.status(200).json({ success: true, stats: { labels: stats.map(s => s.category), data: stats.map(s => s.count) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching city statistics.' });
  }
};

exports.getLocalComplaints = async (req, res) => {
  try {
    const { lat, lon, radius = 5 } = req.query;
    if (!lat || !lon) return res.status(400).json({ success: false, message: 'Latitude and longitude are required.' });
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const complaints = await Complaint.find({
      location: { $nearSphere: { $geometry: { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] }, $maxDistance: parseFloat(radius) * 1000 } },
      submittedAt: { $gte: twoWeeksAgo }
    }).sort({ submittedAt: -1 });
    return res.status(200).json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error fetching local complaints.' });
  }
};

exports.supportComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });
    if (complaint.supportedBy.includes(req.user.id))
      return res.status(400).json({ success: false, message: 'You have already supported this complaint.' });
    complaint.supportedBy.push(req.user.id);
    await complaint.save();
    res.status(200).json({ success: true, message: 'Complaint supported successfully.', supportCount: complaint.supportedBy.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while supporting complaint.' });
  }
};

exports.getSimilarComplaints = async (req, res) => {
  try {
    const { lat, lon, category, description } = req.query;
    const userId = req.user && req.user.id;
    if (!lat || !lon || !category || !description)
      return res.status(400).json({ success: false, message: 'Location, category, and description are required.' });
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const keywords = description.split(' ').map(word => new RegExp(word, 'i'));
    const similarComplaints = await Complaint.find({
      location: { $nearSphere: { $geometry: { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] }, $maxDistance: 200 } },
      status: { $nin: ['Resolved', 'Rejected'] },
      submittedAt: { $gte: twoWeeksAgo },
      submittedBy: { $ne: userId },
      category,
      description: { $in: keywords }
    }).sort({ supportedBy: -1, submittedAt: -1 }).limit(5).select('category subType description status supportedBy submittedAt');

    const formatted = similarComplaints.map(c => ({
      _id: c._id, category: c.category, subType: c.subType, description: c.description,
      status: c.status, supportedCount: c.supportedBy.length, userSupported: c.supportedBy.includes(userId), submittedAt: c.submittedAt,
    }));
    res.status(200).json({ success: true, count: formatted.length, similarComplaints: formatted, similar: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching similar complaints.' });
  }
};

exports.ngoResolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNote } = req.body;
    if (!req.user || req.user.role !== 'ngo') return res.status(403).json({ success: false, message: 'Forbidden' });
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });
    if (!complaint.assignedTo || complaint.assignedTo.toString() !== req.user.id.toString())
      return res.status(403).json({ success: false, message: 'Forbidden' });
    if (complaint.status === 'Resolved' || complaint.status === 'Rejected')
      return res.status(400).json({ success: false, message: `Complaint is already ${complaint.status}.` });
    if (req.file) {
      complaint.beforeAfterPhotos.push({ url: req.file.filename, uploadedBy: req.user.id, uploadedAt: new Date() });
    }
    if (resolutionNote && resolutionNote.trim()) {
      complaint.updates.push({ date: new Date(), text: `NGO Report: ${resolutionNote.trim()}`, updatedBy: req.user.id });
    } else if (!req.file) {
      return res.status(400).json({ success: false, message: 'Resolution update requires a photo or a note.' });
    }
    complaint.status = 'Process Ongoing';
    await complaint.save();
    res.status(200).json({ success: true, message: 'Resolution update submitted successfully!', complaint: { _id: complaint._id, status: complaint.status, beforeAfterPhotos: complaint.beforeAfterPhotos, updates: complaint.updates } });
  } catch (error) {
    if (error instanceof multer.MulterError) return res.status(400).json({ success: false, message: error.message });
    if (error.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid complaint ID format.' });
    res.status(500).json({ success: false, message: 'Server error during NGO resolution update.' });
  }
};

exports.getSingleComplaintForNgo = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .select('category subType description address photo severity status submittedAt assignedTo')
      .populate('submittedBy', 'firstName lastName')
      .populate('assignedTo', 'firstName lastName email');
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });
    res.status(200).json({ success: true, complaint });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid complaint ID format.' });
    res.status(500).json({ success: false, message: 'Server error fetching complaint details.' });
  }
};

exports.uploadMiddlewareNGOResolutionPhoto = uploadNGOResolutionPhoto.single('resolutionPhoto');