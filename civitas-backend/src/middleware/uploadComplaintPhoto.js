const multer = require('multer');
const path = require('path');
const fs = require('fs');

// FIX: Consistent path - server root /uploads
// middleware/ is at src/middleware/, so go up 3 levels: middleware -> src -> backend root, then uploads
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const finalName = uniqueSuffix + path.extname(file.originalname);
    cb(null, finalName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'video/mp4'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images (jpeg, png, jpg, webp) and mp4 videos are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadComplaintPhoto = upload.single('photo');

module.exports = uploadComplaintPhoto;