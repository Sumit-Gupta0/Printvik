/**
 * Product Controller
 * Handles e-commerce product management
 */

const Product = require('../models/Product');
const NotificationService = require('../services/NotificationService');

/**
 * Get all products
 * @route GET /api/products
 */
exports.getAllProducts = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = { isActive: true };

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const products = await Product.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products'
        });
    }
};

/**
 * Get all products (Admin view - includes inactive)
 * @route GET /api/products/admin
 */
exports.getAdminProducts = async (req, res) => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Get admin products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products'
        });
    }
};

/**
 * Get single product
 * @route GET /api/products/:id
 */
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product'
        });
    }
};

/**
 * Create new product
 * @route POST /api/products
 */
exports.createProduct = async (req, res) => {
    try {
        const fs = require('fs');
        fs.appendFileSync('debug.log', `Create Product Request Body: ${JSON.stringify(req.body)}\n`);
        console.log('Create Product Request Body:', req.body); // DEBUG LOG
        const {
            name,
            sku,
            description,
            basePrice,
            discountPrice,
            costPrice,
            taxRate,
            isTaxApplicable,
            stockQuantity,
            lowStockThreshold,
            category,
            tags,
            isActive,
            hasVariants,
            variants
        } = req.body;

        // Process uploaded images
        const images = req.files ? req.files.map(file => ({
            url: `/uploads/${file.filename}`,
            alt: name
        })) : [];

        // Parse variants if sent as string (from FormData)
        let parsedVariants = [];
        if (variants) {
            try {
                parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
            } catch (e) {
                console.error('Error parsing variants:', e);
            }
        }

        const product = await Product.create({
            name,
            sku,
            description,
            images,
            basePrice,
            discountPrice,
            costPrice,
            taxRate,
            isTaxApplicable,
            stockQuantity, // Will sync with inventory.currentStock via pre-save hook
            inventory: {
                currentStock: stockQuantity || 0,
                lowStockThreshold: lowStockThreshold || 10,
                manageStock: true,
                locationInWarehouse: req.body.locationInWarehouse
            },
            category,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            isActive: isActive === 'true' || isActive === true,
            hasVariants: hasVariants === 'true' || hasVariants === true,
            variants: parsedVariants
        });

        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        const fs = require('fs');
        fs.appendFileSync('debug.log', `Create Product Error: ${error.message}\nStack: ${error.stack}\n`);
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
};

/**
 * Update product
 * @route PUT /api/products/:id
 */
exports.updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const updateData = { ...req.body };

        // Handle tags if present
        if (updateData.tags) {
            updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
        }

        // Handle variants parsing
        if (updateData.variants) {
            try {
                updateData.variants = typeof updateData.variants === 'string' ? JSON.parse(updateData.variants) : updateData.variants;
            } catch (e) {
                console.error('Error parsing variants:', e);
            }
        }

        // Handle inventory structure update
        if (updateData.stockQuantity || updateData.lowStockThreshold || updateData.locationInWarehouse) {
            updateData.inventory = {
                ...product.inventory,
                currentStock: updateData.stockQuantity || product.inventory.currentStock,
                lowStockThreshold: updateData.lowStockThreshold || product.inventory.lowStockThreshold,
                locationInWarehouse: updateData.locationInWarehouse || product.inventory.locationInWarehouse
            };
        }

        // Handle images if uploaded
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => ({
                url: `/uploads/${file.filename}`,
                alt: updateData.name || product.name
            }));
            updateData.images = [...product.images, ...newImages];
        }

        product = await Product.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
};

/**
 * Quick update stock quantity
 * @route PATCH /api/products/:id/stock
 */
exports.updateStock = async (req, res) => {
    try {
        const { stockAdjustment, newStock } = req.body; // Provide either adjustment (+/-) or absolute newStock

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        let updatedStock = product.inventory.currentStock;

        if (newStock !== undefined) {
            updatedStock = parseInt(newStock);
        } else if (stockAdjustment !== undefined) {
            updatedStock += parseInt(stockAdjustment);
        }

        if (updatedStock < 0) updatedStock = 0;

        product.inventory.currentStock = updatedStock;
        product.stockQuantity = updatedStock; // Sync legacy field
        await product.save();

        // Check Low Stock
        if (product.inventory.manageStock && updatedStock <= product.inventory.lowStockThreshold) {
            await NotificationService.sendAdminAlert(
                'WARNING',
                'Low Stock Alert',
                `Product "${product.name}" is low on stock (${updatedStock} remaining).`,
                `/admin/products/${product._id}`,
                { type: 'SYSTEM', id: product._id }
            );
        }

        res.json({
            success: true,
            message: 'Stock updated successfully',
            data: {
                currentStock: product.inventory.currentStock,
                _id: product._id
            }
        });
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating stock'
        });
    }
};

/**
 * Delete a product
 * @route DELETE /api/products/:id
 */
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        await product.deleteOne();

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product'
        });
    }
};
