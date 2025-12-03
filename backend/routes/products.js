/**
 * Product Routes
 * Handles e-commerce product management
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const productController = require('../controllers/productController');

/**
 * @route   GET /api/products
 * @desc    Get all products
 * @access  Public
 */
router.get('/', productController.getAllProducts);

/**
 * @route   GET /api/products/admin
 * @desc    Get all products (Admin view - includes inactive)
 * @access  Private/Admin
 */
router.get('/admin', protect, authorize('admin'), productController.getAdminProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product
 * @access  Public
 */
router.get('/:id', productController.getProductById);

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private/Admin
 */
router.post('/', protect, authorize('admin', 'super_admin'), upload.array('images', 5), productController.createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private/Admin
 */
router.put('/:id', protect, authorize('admin', 'super_admin'), upload.array('images', 5), productController.updateProduct);

/**
 * @route   PATCH /api/products/:id/stock
 * @desc    Quick update stock quantity
 * @access  Private/Admin
 */
router.patch('/:id/stock', protect, authorize('admin'), productController.updateStock);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin', 'super_admin'), productController.deleteProduct);

module.exports = router;
