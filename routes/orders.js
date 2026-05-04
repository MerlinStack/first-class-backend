const express = require('express');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
router.post('/', protect, async (req, res) => {
  try {
    console.log('📦 Order creation request received');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user?.id);
    
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items',
      });
    }

    // Generate order number
    const orderNumber = `FCUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await Order.create({
      orderNumber,
      user: req.user.id,
      orderItems: orderItems.map(item => ({
        product: item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size || '',
        color: item.color || '',
        image: item.image || '',
      })),
      shippingAddress: {
        address: shippingAddress.address || 'No address provided',
        city: shippingAddress.city || 'Lagos',
        state: shippingAddress.state || 'Lagos',
        postalCode: shippingAddress.postalCode || '100001',
        country: shippingAddress.country || 'Nigeria',
      },
      paymentMethod: paymentMethod || 'PayStack',
      itemsPrice: itemsPrice || 0,
      shippingPrice: shippingPrice || 0,
      totalPrice: totalPrice || 0,
      status: 'pending',
      paymentStatus: 'pending',
    });

    console.log('✅ Order created successfully:', order._id);

    res.status(201).json({
      success: true,
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        totalPrice: order.totalPrice,
      },
    });
  } catch (error) {
    console.error('❌ Order creation error:', error);
    console.error('Error details:', error.message);
    
    // Send detailed error for debugging
    res.status(500).json({
      success: false,
      message: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => error.errors[key].message) : undefined,
    });
  }
});

module.exports = router;