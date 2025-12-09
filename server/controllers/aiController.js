const RFP = require('../models/RFP');
const Proposal = require('../models/Proposal');
const Vendor = require('../models/Vendor');
const { 
    parseNaturalLanguage, 
    analyzeProposal, 
    compareProposals, 
    generateExecutiveSummary,
    extractDataFromDocument
} = require('../services/aiService');

/**
 * @desc    Parse natural language input into structured RFP
 * @route   POST /api/ai/parse-rfp
 * @access  Private
 */
exports.parseRFP = async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'Text input is required'
            });
        }

        const parsedRFP = await parseNaturalLanguage(text);
        
        res.json({
            success: true,
            data: parsedRFP
        });
    } catch (error) {
        console.error('Error in parseRFP:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to parse RFP',
            details: error.message
        });
    }
};

/**
 * @desc    Analyze a proposal against RFP requirements
 * @route   POST /api/ai/analyze-proposal/:rfpId
 * @access  Private
 */
exports.analyzeProposal = async (req, res) => {
    try {
        const { rfpId } = req.params;
        const { proposalText } = req.body;
        
        if (!proposalText) {
            return res.status(400).json({
                success: false,
                error: 'Proposal text is required'
            });
        }

        const rfp = await RFP.findById(rfpId);
        if (!rfp) {
            return res.status(404).json({
                success: false,
                error: 'RFP not found'
            });
        }

        const analysis = await analyzeProposal(proposalText, rfp.requirements);
        
        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        console.error('Error in analyzeProposal:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze proposal',
            details: error.message
        });
    }
};

/**
 * @desc    Compare multiple proposals for an RFP
 * @route   GET /api/ai/compare-proposals/:rfpId
 * @access  Private
 */
exports.compareProposals = async (req, res) => {
    try {
        const { rfpId } = req.params;
        
        // Get the RFP with requirements
        const rfp = await RFP.findById(rfpId);
        if (!rfp) {
            return res.status(404).json({
                success: false,
                error: 'RFP not found'
            });
        }

        // Get all proposals for this RFP with vendor details
        const proposals = await Proposal.find({ rfpId })
            .populate('vendorId', 'name company');

        if (proposals.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'At least two proposals are required for comparison'
            });
        }

        // Prepare data for comparison
        const proposalsData = proposals.map(proposal => ({
            vendorName: proposal.vendorId.name,
            company: proposal.vendorId.company,
            summary: proposal.parsedData?.summary || '',
            score: proposal.parsedData?.score || 0,
            text: proposal.proposalText
        }));

        // Get AI comparison
        const comparison = await compareProposals(proposalsData, {
            title: rfp.title,
            requirements: rfp.requirements,
            evaluationCriteria: rfp.aiMetadata?.evaluationCriteria || []
        });
        
        res.json({
            success: true,
            data: comparison
        });
    } catch (error) {
        console.error('Error in compareProposals:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to compare proposals',
            details: error.message
        });
    }
};

/**
 * @desc    Generate an executive summary for an RFP
 * @route   GET /api/ai/executive-summary/:rfpId
 * @access  Private
 */
exports.generateExecutiveSummary = async (req, res) => {
    try {
        const { rfpId } = req.params;
        
        // Get the RFP with proposals
        const rfp = await RFP.findById(rfpId);
        if (!rfp) {
            return res.status(404).json({
                success: false,
                error: 'RFP not found'
            });
        }

        // Get all proposals for this RFP with vendor details
        const proposals = await Proposal.find({ rfpId })
            .populate('vendorId', 'name company');

        if (proposals.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No proposals found for this RFP'
            });
        }

        // Prepare proposals data
        const proposalsData = proposals.map(proposal => ({
            vendorName: proposal.vendorId.name,
            company: proposal.vendorId.company,
            price: proposal.price,
            score: proposal.parsedData?.score || 0,
            summary: proposal.parsedData?.summary || '',
            strengths: proposal.parsedData?.strengths || [],
            weaknesses: proposal.parsedData?.weaknesses || []
        }));

        // Generate executive summary
        const summary = await generateExecutiveSummary(rfp, proposalsData);
        
        res.json({
            success: true,
            data: {
                summary,
                rfpTitle: rfp.title,
                totalProposals: proposals.length,
                vendors: proposalsData.map(p => ({
                    name: p.vendorName,
                    company: p.company,
                    score: p.score
                }))
            }
        });
    } catch (error) {
        console.error('Error in generateExecutiveSummary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate executive summary',
            details: error.message
        });
    }
};

/**
 * @desc    Extract data from RFP document (PDF, DOCX, etc.)
 * @route   POST /api/ai/extract-document
 * @access  Private
 */
exports.extractDocumentData = async (req, res) => {
    try {
        if (!req.files || !req.files.document) {
            return res.status(400).json({
                success: false,
                error: 'No document file uploaded'
            });
        }

        const { document } = req.files;
        const { mimeType } = req.body;

        if (!mimeType) {
            return res.status(400).json({
                success: false,
                error: 'MIME type is required'
            });
        }

        // Extract and process the document
        const result = await extractDataFromDocument(document.data, mimeType);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error in extractDocumentData:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to extract document data',
            details: error.message
        });
    }
};
