const mongoose = require('mongoose');

const CareerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  dateRange: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Career', CareerSchema);
