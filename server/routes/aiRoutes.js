const express = require('express');
const router = express.Router();
const { 
    parseRFP, 
    analyzeProposal, 
    compareProposals, 
    generateExecutiveSummary,
    extractDocumentData
} = require('../controllers/aiController');
const { auth } = require('../middleware/auth');
const fileUpload = require('express-fileupload');

// Apply auth middleware to all routes
router.use(auth);

// Enable file uploads
router.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    abortOnLimit: true,
    createParentPath: true
}));

// AI RFP Processing
router.post('/parse-rfp', parseRFP);

// AI Proposal Analysis
router.post('/analyze-proposal/:rfpId', analyzeProposal);
router.get('/compare-proposals/:rfpId', compareProposals);
router.get('/executive-summary/:rfpId', generateExecutiveSummary);

// Document Processing
router.post('/extract-document', extractDocumentData);

module.exports = router;
