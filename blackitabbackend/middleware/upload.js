const multer = require('multer');
const path = require('path');
const fs = require('fs');

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/banners';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'banner-' + uniqueSuffix + ext);
  }
});

const bannerUpload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isExtAllowed = allowedExtensions.includes(ext);
    const isMimeAllowed = allowedMimeTypes.includes(file.mimetype);

    if (isExtAllowed && isMimeAllowed) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type! Only JPG, PNG, and WEBP images are allowed.'), false);
    }
  }
});

const handleBannerUpload = (req, res, next) => {
  bannerUpload.single('bannerImage')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File size should be less than 5MB' });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

module.exports = { bannerUpload, handleBannerUpload };
