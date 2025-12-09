const express = require('express');
const router = express.Router();
const { 
  createVendor, 
  getVendors, 
  getVendor, 
  updateVendor, 
  deleteVendor 
} = require('../controllers/vendorController');
const { auth, authorize } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Vendor routes
router.post('/', authorize('admin'), createVendor);
router.get('/', getVendors);
router.get('/:id', getVendor);
router.put('/:id', authorize('admin'), updateVendor);
router.delete('/:id', authorize('admin'), deleteVendor);

module.exports = router;
