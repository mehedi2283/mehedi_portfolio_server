const mongoose = require('mongoose');

const aboutBlockSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['headline', 'body', 'note'],
    default: 'body',
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
}, { _id: false });

const aboutSchema = new mongoose.Schema({
  bio: { type: String, required: true, default: '' },
  aboutBlocks: {
    type: [aboutBlockSchema],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('About', aboutSchema);
