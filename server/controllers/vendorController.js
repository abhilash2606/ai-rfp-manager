const Vendor = require('../models/Vendor');

/**
 * @desc    Create a new vendor
 * @route   POST /api/vendors
 * @access  Private
 */
exports.createVendor = async (req, res) => {
    try {
        const vendorData = req.body;
        
        // Check if vendor with this email already exists
        let vendor = await Vendor.findOne({ email: vendorData.email });
        
        if (vendor) {
            return res.status(400).json({
                success: false,
                error: 'Vendor with this email already exists'
            });
        }
        
        vendor = new Vendor({
            ...vendorData,
            createdBy: req.user.id
        });
        
        await vendor.save();
        
        res.status(201).json({
            success: true,
            data: vendor
        });
    } catch (error) {
        console.error('Error creating vendor:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create vendor',
            details: error.message
        });
    }
};

/**
 * @desc    Get all vendors
 * @route   GET /api/vendors
 * @access  Private
 */
exports.getVendors = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        
        const query = {};
        
        // Add search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } }
            ];
        }
        
        const vendors = await Vendor.find(query)
            .sort({ name: 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const count = await Vendor.countDocuments(query);
        
        res.json({
            success: true,
            count: vendors.length,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            data: vendors
        });
    } catch (error) {
        console.error('Error fetching vendors:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch vendors'
        });
    }
};

/**
 * @desc    Get single vendor
 * @route   GET /api/vendors/:id
 * @access  Private
 */
exports.getVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        
        if (!vendor) {
            return res.status(404).json({
                success: false,
                error: 'Vendor not found'
            });
        }
        
        res.json({
            success: true,
            data: vendor
        });
    } catch (error) {
        console.error('Error fetching vendor:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch vendor'
        });
    }
};

/**
 * @desc    Update vendor
 * @route   PUT /api/vendors/:id
 * @access  Private
 */
exports.updateVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Don't allow updating email to an existing one
        if (updateData.email) {
            const existingVendor = await Vendor.findOne({ 
                email: updateData.email, 
                _id: { $ne: id } 
            });
            
            if (existingVendor) {
                return res.status(400).json({
                    success: false,
                    error: 'Email already in use by another vendor'
                });
            }
        }
        
        const vendor = await Vendor.findByIdAndUpdate(
            id,
            { ...updateData, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );
        
        if (!vendor) {
            return res.status(404).json({
                success: false,
                error: 'Vendor not found'
            });
        }
        
        res.json({
            success: true,
            data: vendor
        });
    } catch (error) {
        console.error('Error updating vendor:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update vendor',
            details: error.message
        });
    }
};

/**
 * @desc    Delete vendor
 * @route   DELETE /api/vendors/:id
 * @access  Private
 */
exports.deleteVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndDelete(req.params.id);
        
        if (!vendor) {
            return res.status(404).json({
                success: false,
                error: 'Vendor not found'
            });
        }
        
        // TODO: Handle any cleanup, like removing vendor from RFPs
        
        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Error deleting vendor:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete vendor',
            details: error.message
        });
    }
};
