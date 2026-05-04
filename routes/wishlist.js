const express = require('express');
const Wishlist = require('../models/Wishlist');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/wishlist
// @desc    Get user wishlist
router.get('/', protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('products.product');
    
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        products: [],
      });
    }
    
    res.json({
      success: true,
      wishlist: wishlist.products,
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching wishlist',
    });
  }
});

// @route   POST /api/wishlist
// @desc    Add product to wishlist
router.post('/', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        products: [{ product: productId }],
      });
    } else {
      const alreadyExists = wishlist.products.some(
        (item) => item.product.toString() === productId
      );
      
      if (!alreadyExists) {
        wishlist.products.push({ product: productId });
        await wishlist.save();
      } else {
        return res.status(400).json({
          success: false,
          message: 'Product already in wishlist',
        });
      }
    }
    
    const updatedWishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('products.product');
    
    res.json({
      success: true,
      wishlist: updatedWishlist.products,
      message: 'Product added to wishlist',
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding to wishlist',
    });
  }
});

// @route   DELETE /api/wishlist/:productId
// @desc    Remove product from wishlist
router.delete('/:productId', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found',
      });
    }
    
    wishlist.products = wishlist.products.filter(
      (item) => item.product.toString() !== req.params.productId
    );
    await wishlist.save();
    
    const updatedWishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('products.product');
    
    res.json({
      success: true,
      wishlist: updatedWishlist.products,
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing from wishlist',
    });
  }
});

module.exports = router;