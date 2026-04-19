const mongoose = require('mongoose');

const memeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  meaning: { type: String, required: true },
  example: { type: String, required: true },
  tags: [{ type: String }],
  status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Meme', memeSchema);
