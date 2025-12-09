const mongoose = require('mongoose');

const RfpLineItemSchema = new mongoose.Schema({
  rfpId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rfp' },
  itemName: String,
  quantity: Number,
  unit: String,
  specifications: String
});

module.exports = mongoose.model('RfpLineItem', RfpLineItemSchema);