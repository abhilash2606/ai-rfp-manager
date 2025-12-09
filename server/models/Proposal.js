const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  rfpId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFP',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  proposalText: {
    type: String,
    required: true
  },
  price: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  // AI-generated structured data from proposal text
  parsedData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  // AI analysis of the proposal
  analysis: {
    score: Number, // 1-10 rating
    summary: String,
    strengths: [String],
    weaknesses: [String],
    riskAssessment: String
  },
  status: {
    type: String,
    enum: ['received', 'under_review', 'accepted', 'rejected'],
    default: 'received'
  },
  notes: [{
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdBy: String // Could be a user ID or 'AI'
  }],
  attachments: [{
    filename: String,
    url: String,
    mimeType: String
  }]
}, {
  timestamps: true
});

// Index for faster lookups
proposalSchema.index({ rfpId: 1, vendorId: 1 }, { unique: true });

module.exports = mongoose.model('Proposal', proposalSchema);
