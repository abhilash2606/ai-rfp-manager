const mongoose = require('mongoose');

const RfpSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number },
  status: { type: String, enum: ['Open', 'Closed', 'Draft'], default: 'Open' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rfp', RfpSchema);