const mongoose = require('mongoose');

const ProposalLineItemSchema = new mongoose.Schema({
  proposalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal' },
  itemName: String,
  pricePerUnit: Number,
  totalPrice: Number
});

module.exports = mongoose.model('ProposalLineItem', ProposalLineItemSchema);