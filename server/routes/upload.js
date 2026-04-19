const express = require('express');
const router = express.Router();
const fs = require('fs');
const cloudinary = require('../utils/cloudinary');
const multer = require('multer');

const MAX_SIZE_BYTES = 500 * 1024; // 500 KB

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter(_req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }
    cb(null, true);
  },
});

// Cloudinary quota/storage errors come back with specific messages
function isQuotaError(err) {
  const msg = (err.message || '').toLowerCase();
  return (
    err.http_code === 420 ||
    msg.includes('storage exceeded') ||
    msg.includes('plan limit') ||
    msg.includes('quota') ||
    msg.includes('storage limit')
  );
}

router.post('/', (req, res) => {
  upload.single('image')(req, res, async (err) => {
    // Multer errors (size, type)
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Image must be under 500 KB. Try compressing it first.' });
      }
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) return res.status(400).json({ error: 'No file provided.' });

    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'catchup',
      });

      res.json({ imageUrl: result.secure_url });
    } catch (uploadErr) {
      if (isQuotaError(uploadErr)) {
        return res.status(507).json({
          error: 'Image storage is full. Paste an image URL instead — Cloudinary free tier has been reached.',
        });
      }
      res.status(500).json({ error: uploadErr.message });
    } finally {
      if (req.file) fs.unlink(req.file.path, () => {});
    }
  });
});

module.exports = router;
