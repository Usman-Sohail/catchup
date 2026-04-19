const express = require('express');
const router = express.Router();
const Meme = require('../models/Meme');

// GET /api/memes — return all memes, newest first, optional ?tag= filter
router.get('/', async (req, res) => {
  try {
    const { tag } = req.query;
    const query = tag ? { tags: tag } : {};
    const memes = await Meme.find(query).sort({ createdAt: -1 });
    res.json(memes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/memes — add a new meme
router.post('/', async (req, res) => {
  try {
    const meme = new Meme(req.body);
    const saved = await meme.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: 'Validation error', error: err.message });
  }
});

module.exports = router;
