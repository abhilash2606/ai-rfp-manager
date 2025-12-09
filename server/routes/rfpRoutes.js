const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { 
  parseRfp, 
  createFromNaturalLanguage, 
  sendToVendors, 
  getUserRFPs, 
  getRFP, 
  submitProposal, 
  compareProposals,
  createRFP
} = require('../controllers/rfpController');

// Test endpoint to verify API is working (no auth required)
router.get('/test', (req, res) => {
  res.json({ 
    status: 'API is working', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Apply auth middleware to all routes below
router.use(auth);

// RFP CRUD Routes
router.post('/', createRFP);  
router.get('/', getUserRFPs);
router.get('/:id', getRFP);

// AI Routes
router.post('/parse', parseRfp); 
router.post('/natural', createFromNaturalLanguage);

// RFP Actions
router.post('/:rfpId/send', sendToVendors);
router.post('/:rfpId/proposals', submitProposal);
router.get('/:rfpId/compare', compareProposals);

module.exports = router;