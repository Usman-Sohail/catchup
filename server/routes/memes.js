const express = require('express');
const router = express.Router();
const Meme = require('../models/Meme');

// GET /api/memes
// Query params: search, tag, page (default 1), limit (default 25, 0 = all)
router.get('/', async (req, res) => {
  try {
    const { tag, search, page = '1', limit = '25' } = req.query;

    const query = { status: 'approved' };

    if (tag) {
      query.tags = tag;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: regex },
        { meaning: regex },
        { tags: regex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = parseInt(limit) || 0;
    const fetchAll = limitNum === 0;

    const total = await Meme.countDocuments(query);
    const totalPages = fetchAll ? 1 : Math.ceil(total / limitNum) || 1;

    let dbQuery = Meme.find(query).sort({ createdAt: -1 });

    if (!fetchAll) {
      dbQuery = dbQuery.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const memes = await dbQuery;

    res.json({ memes, total, page: pageNum, totalPages });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/memes/:id — suggest an edit, resets to pending for re-approval
router.patch('/:id', async (req, res) => {
  try {
    const { title, imageUrl, meaning, example, tags } = req.body;
    const meme = await Meme.findByIdAndUpdate(
      req.params.id,
      { title, imageUrl, meaning, example, tags, status: 'pending' },
      { new: true, runValidators: true }
    );
    if (!meme) return res.status(404).json({ message: 'Meme not found.' });
    res.json(meme);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/memes
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
