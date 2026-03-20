const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  passkey1: { type: String, required: true, default: '1358549' },
  passkey2: { type: String, required: true, default: '2283' },
  themeColor: { type: String, default: '#5eead4' },
  resumeUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
