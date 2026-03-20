const mongoose = require('mongoose');

const techStackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  category: { type: String, enum: ['automation', 'extra'], default: 'automation' },
  highlighted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('TechStack', techStackSchema);
