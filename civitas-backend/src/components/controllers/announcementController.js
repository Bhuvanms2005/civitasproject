const Announcement = require('../../models/Announcement');
const User = require('../../models/user');

// ─── Helper: cutoff for 48 hours ago ──────────────────
const get48hCutoff = () => new Date(Date.now() - 48 * 60 * 60 * 1000);

// ─── Auto-purge expired (>48h) announcements ──────────
const purgeExpiredAnnouncements = async () => {
  try {
    const cutoff = get48hCutoff();
    const result = await Announcement.deleteMany({ publishedAt: { $lt: cutoff } });
    if (result.deletedCount > 0) {
      console.log(`[Announcements] Auto-purged ${result.deletedCount} expired announcement(s) older than 48h.`);
    }
  } catch (err) {
    console.error('[Announcements] Error purging expired announcements:', err);
  }
};

// @desc    Get announcements (only last 48 hours)
// @route   GET /api/announcements
// @access  Private
exports.getAnnouncements = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized, please log in.' });
    }

    // Auto-purge stale announcements on every fetch (lightweight)
    await purgeExpiredAnnouncements();

    const { locality, type, limit = 50 } = req.query;

    // Always restrict to last 48 hours
    const cutoff = get48hCutoff();
    let query = { publishedAt: { $gte: cutoff } };

    if (locality) {
      query.locality = locality;
    } else {
      // Fetch city-wide + unset locality announcements
      query.$or = [
        { locality: { $exists: false } },
        { locality: null },
        { locality: '' },
        { region: 'Bengaluru' },
      ];
    }

    if (type) {
      query.type = type;
    }

    const announcements = await Announcement.find(query)
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
      message: 'Announcements fetched successfully.',
    });

  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, message: 'Server error fetching announcements.' });
  }
};

// @desc    Create announcement
// @route   POST /api/admin/announcements
// @access  Private (Admin)
exports.createAnnouncement = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can create announcements.' });
    }

    const { title, content, type, locality, region } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required for an announcement.' });
    }

    const newAnnouncement = new Announcement({
      title,
      content,
      type:        type     || 'general',
      locality:    locality || '',
      region:      region   || 'Bengaluru',
      publishedBy: req.user.id,
      publishedAt: new Date(),
    });

    await newAnnouncement.save();

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully! It will be auto-deleted after 48 hours.',
      announcement: newAnnouncement,
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('Error creating announcement:', error);
    res.status(500).json({ success: false, message: 'Server error creating announcement.' });
  }
};

// @desc    Update announcement
// @route   PUT /api/admin/announcements/:id
// @access  Private (Admin)
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, locality, region } = req.body;

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can update announcements.' });
    }

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    if (title)    announcement.title    = title;
    if (content)  announcement.content  = content;
    if (type)     announcement.type     = type;
    announcement.locality = locality !== undefined ? locality : announcement.locality;
    announcement.region   = region   !== undefined ? region   : announcement.region;

    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully!',
      announcement,
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid announcement ID format.' });
    }
    console.error('Error updating announcement:', error);
    res.status(500).json({ success: false, message: 'Server error updating announcement.' });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/admin/announcements/:id
// @access  Private (Admin)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can delete announcements.' });
    }

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    await announcement.deleteOne();

    res.status(200).json({ success: true, message: 'Announcement deleted successfully!' });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid announcement ID format.' });
    }
    console.error('Error deleting announcement:', error);
    res.status(500).json({ success: false, message: 'Server error deleting announcement.' });
  }
};

// @desc    Get single announcement (admin)
// @route   GET /api/admin/announcements/:id
// @access  Private (Admin)
exports.getSingleAnnouncementForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can view announcement details.' });
    }

    const announcement = await Announcement.findById(id).populate('publishedBy', 'firstName lastName email');
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    res.status(200).json({
      success: true,
      announcement,
      message: 'Announcement details fetched successfully.',
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid announcement ID format.' });
    }
    console.error('Error fetching single announcement for admin:', error);
    res.status(500).json({ success: false, message: 'Server error fetching announcement details.' });
  }
};

// @desc    Manual purge endpoint (admin use / cron job)
// @route   DELETE /api/admin/announcements/purge-expired
// @access  Private (Admin)
exports.purgeExpiredAnnouncements = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    const cutoff = get48hCutoff();
    const result = await Announcement.deleteMany({ publishedAt: { $lt: cutoff } });

    res.status(200).json({
      success: true,
      message: `Purged ${result.deletedCount} expired announcement(s).`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error purging announcements:', error);
    res.status(500).json({ success: false, message: 'Server error purging announcements.' });
  }
};