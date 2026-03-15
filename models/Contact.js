const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  email: { type: String, required: true },
  education: { type: String, default: '' },
  github: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  twitter: { type: String, default: '' },
  instagram: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
