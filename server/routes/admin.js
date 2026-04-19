const express = require('express');
const router = express.Router();
const Meme = require('../models/Meme');
const adminAuth = require('../middleware/adminAuth');

// All admin routes require the admin key header
router.use(adminAuth);

// GET /api/admin/memes — all memes grouped by status
router.get('/memes', async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const query = status === 'all' ? {} : { status };
    const memes = await Meme.find(query).sort({ createdAt: -1 });
    const total = await Meme.countDocuments({ status: 'pending' });
    res.json({ memes, pendingCount: total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/memes/:id/approve
router.patch('/memes/:id/approve', async (req, res) => {
  try {
    const meme = await Meme.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!meme) return res.status(404).json({ error: 'Meme not found.' });
    res.json(meme);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/memes/:id — reject + remove
router.delete('/memes/:id', async (req, res) => {
  try {
    await Meme.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
