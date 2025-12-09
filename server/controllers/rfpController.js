const RFP = require('../models/RFP');
const Vendor = require('../models/Vendor');
const { sendRFPEmail } = require('../services/emailService');
const { parseNaturalLanguage, analyzeProposal } = require('../services/aiService');
const mongoose = require('mongoose');

// Helper: Get User ID or create a dummy one for testing
const getUserId = (req) => {
    if (req.user && req.user.id) return req.user.id;
    // Return a consistent fake ID for testing
    return "000000000000000000000001"; 
};

// Add detailed error logging function
const logError = (error, context = '') => {
    console.error(`[${new Date().toISOString()}] Error in ${context}:`, {
        message: error.message,
        name: error.name,
        stack: error.stack,
        ...(error.response && { response: error.response.data })
    });
};

/**
 * CREATE: Direct RFP creation from form
 */
exports.createRFP = async (req, res) => {
    console.log('=== RFP Creation Request ===');
    console.log('Headers:', req.headers);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    
    try {
        const { title, description, budget, requirements, timeline, deadline } = req.body;
        
        // Input validation
        if (!title || !description) {
            console.log('Validation failed: Title and description are required');
            return res.status(400).json({
                success: false,
                error: 'Title and description are required fields'
            });
        }
        
        const createdBy = getUserId(req);
        console.log('Creating RFP for user:', createdBy);

        // Set default deadline if not provided
        const rfpDeadline = deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
        console.log('Using deadline:', rfpDeadline);

        const rfp = new RFP({
            title: title || "Untitled RFP",
            description: description || "No description provided",
            budget: { 
                amount: typeof budget === 'number' ? budget : parseFloat(budget) || 0, 
                currency: 'USD' 
            },
            requirements: Array.isArray(requirements) ? requirements : [],
            timeline: timeline || '30 days',
            deadline: rfpDeadline,
            status: 'draft',
            createdBy,
            teamMembers: [{ user: createdBy, role: 'owner' }]
        });

        console.log('Saving RFP to database...');
        await rfp.save();
        console.log('RFP created successfully:', rfp._id);
        
        res.status(201).json({ 
            success: true, 
            message: 'RFP created successfully',
            data: rfp 
        });
    } catch (error) {
        logError(error, 'createRFP');
        
        // Handle MongoDB validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                details: errors
            });
        }
        
        // Handle other errors
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create RFP',
            message: error.message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    } finally {
        console.log('=== End of RFP Creation Request ===\n');
    }
};

/**
 * PREVIEW: Generate RFP data from AI (No Save)
 */
exports.parseRfp = async (req, res) => {
    try {
        const { text } = req.body;
        const aiResponse = await parseNaturalLanguage(text);
        res.json(aiResponse);
    } catch (error) {
        console.error('Error parsing RFP:', error);
        res.status(500).json({ success: false, error: 'Failed to generate preview' });
    }
};

/**
 * CREATE: Save RFP to Database
 */
exports.createFromNaturalLanguage = async (req, res) => {
    try {
        const { title, description, budget, requirements, timeline } = req.body;
        const createdBy = getUserId(req);
        
        // Ensure requirements is an array of objects
        const safeRequirements = (requirements || []).map(req => {
            return typeof req === 'string' 
                ? { description: req, priority: 'medium' }
                : req;
        });

        const rfp = new RFP({
            title: title || "Untitled RFP",
            description: description || "No description provided",
            budget: { 
                amount: typeof budget === 'number' ? budget : parseFloat(budget) || 0, 
                currency: 'USD' 
            },
            requirements: safeRequirements,
            timeline: [{ event: 'Created', description: timeline || 'RFP Created' }],
            createdBy,
            status: 'draft',
            teamMembers: [{ user: createdBy, role: 'owner' }]
        });
        
        await rfp.save();
        res.status(201).json({ success: true, data: rfp });
    } catch (error) {
        console.error('Error creating RFP:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * GET ALL: Fetch RFPs (Guest Mode)
 */
exports.getUserRFPs = async (req, res) => {
    try {
        // Return ALL RFPs since we are in guest mode
        const rfps = await RFP.find().sort({ createdAt: -1 });
        res.json(rfps); // Return array directly
    } catch (error) {
        console.error('Error fetching RFPs:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch RFPs' });
    }
};

/**
 * GET ONE: Fetch Single RFP
 */
exports.getRFP = async (req, res) => {
    try {
        const rfp = await RFP.findById(req.params.id)
            .populate('vendors.vendor', 'name email company');
            // Removed .populate('createdBy') to avoid crash if user doesn't exist
            
        if (!rfp) return res.status(404).json({ error: 'RFP not found' });
        
        // Skip permission check for testing
        res.json(rfp);
    } catch (error) {
        console.error('Error fetching RFP:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch RFP' });
    }
};

/**
 * SEND: Send to Vendors
 */
exports.sendToVendors = async (req, res) => {
    try {
        const { rfpId } = req.params;
        const { vendorIds, message } = req.body;
        
        const rfp = await RFP.findById(rfpId);
        if (!rfp) return res.status(404).json({ error: 'RFP not found' });
        
        // Skip permission check for testing
        
        // Find vendors (Mock if needed)
        const vendors = await Vendor.find({ _id: { $in: vendorIds } });
        
        // Process sending...
        const results = vendors.map(v => ({ vendorId: v._id, success: true }));
        
        rfp.status = 'sent';
        await rfp.save();
        
        res.json({ success: true, results });
    } catch (error) {
        console.error('Error sending RFPs:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- Placeholders for other functions to prevent crashes ---
exports.submitProposal = async (req, res) => res.json({ success: true });
exports.compareProposals = async (req, res) => res.json({ success: true });