const mongoose = require('mongoose');

const landingSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role1: { type: String, required: true },
  role2: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Landing', landingSchema);
