const express = require('express');
const router = express.Router();
const fs = require('fs');
const cloudinary = require('../utils/cloudinary');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'catchup',
    });

    res.json({ imageUrl: result.secure_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    fs.unlink(req.file.path, () => {});
  }
});

module.exports = router;
