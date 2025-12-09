const mongoose = require('mongoose');

const rfpSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'in_review', 'evaluating', 'awarded', 'completed', 'cancelled'],
    default: 'draft'
  },
  deadline: {
    type: Date,
    required: true
  },
  budget: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  requirements: [{
    description: String,
    isRequired: {
      type: Boolean,
      default: true
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    }
  }],
  // Natural language input that was used to generate this RFP
  naturalLanguageInput: {
    type: String,
    required: false
  },
  // AI-generated fields
  aiMetadata: {
    generatedTitle: String,
    generatedDescription: String,
    extractedRequirements: [String],
    suggestedVendors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor'
    }],
    evaluationCriteria: [{
      criterion: String,
      weight: Number
    }]
  },
  // Selected vendors for this RFP
  vendors: [{
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'viewed', 'working', 'submitted', 'declined'],
      default: 'pending'
    },
    sentAt: Date,
    viewedAt: Date,
    submittedAt: Date
  }],
  // Email tracking
  emailTemplate: {
    subject: String,
    body: String,
    sentAt: Date,
    sentBy: String // User ID
  },
  // Timeline
  timeline: [{
    event: String,
    description: String,
    date: {
      type: Date,
      default: Date.now
    },
    user: String // User ID or 'system'
  }],
  // Attachments
  attachments: [{
    filename: String,
    url: String,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: String // User ID
  }],
  // Access control
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamMembers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'viewer'],
      default: 'member'
    }
  }]
}, {
  timestamps: true
});

// Indexes for faster queries
rfpSchema.index({ status: 1, deadline: 1 });
rfpSchema.index({ createdBy: 1, status: 1 });
rfpSchema.index({ 'vendors.vendor': 1 });

// Add a pre-save hook to update the timeline
rfpSchema.pre('save', function(next) {
  if (this.isNew) {
    this.timeline.push({
      event: 'created',
      description: 'RFP created',
      user: this.createdBy
    });
  } else if (this.isModified('status')) {
    this.timeline.push({
      event: 'status_update',
      description: `Status changed to ${this.status}`,
      user: 'system'
    });
  }
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('RFP', rfpSchema);
