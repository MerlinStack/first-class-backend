const express = require('express');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, pagination
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      search, 
      sort, 
      page = 1, 
      limit = 12,
      minPrice,
      maxPrice,
      isNew,
      isFeatured
    } = req.query;
    
    let query = {};
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Search products
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Filter by new arrivals
    if (isNew === 'true') {
      query.isNew = true;
    }
    
    // Filter by featured
    if (isFeatured === 'true') {
      query.isFeatured = true;
    }
    
    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'price_asc':
        sortOption.price = 1;
        break;
      case 'price_desc':
        sortOption.price = -1;
        break;
      case 'newest':
        sortOption.createdAt = -1;
        break;
      case 'oldest':
        sortOption.createdAt = 1;
        break;
      case 'rating':
        sortOption.ratings = -1;
        break;
      default:
        sortOption.createdAt = -1;
    }
    
    const products = await Product.find(query)
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Product.countDocuments(query);
    
    res.json({
      success: true,
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      totalProducts: total,
      productsPerPage: Number(limit),
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching products',
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching product',
    });
  }
});

// @route   POST /api/products
// @desc    Create product (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating product',
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating product',
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    res.json({ success: true, message: 'Product removed successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting product',
    });
  }
});

module.exports = router;