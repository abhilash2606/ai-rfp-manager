const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  expertise: [String], // e.g., ["IT", "Construction"]
  rating: { type: Number, default: 0 }
});

module.exports = mongoose.model('Vendor', VendorSchema);