const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
  bio: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('About', aboutSchema);
