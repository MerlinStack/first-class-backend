const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');

const router = express.Router();

// @route   POST /api/payment/initialize
// @desc    Initialize PayStack payment
router.post('/initialize', protect, async (req, res) => {
  console.log('🔵 PAYMENT INITIALIZATION CALLED');
  
  try {
    const { email, amount, orderId } = req.body;
    
    console.log('📧 Email:', email);
    console.log('💰 Amount:', amount);
    console.log('🆔 Order ID:', orderId);

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: email,
        amount: Math.round(amount * 100),
        currency: 'NGN',
        reference: `FCUB-${orderId}-${Date.now()}`,
        callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
        metadata: {
          orderId: orderId,
          userId: req.user.id,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('✅ Paystack response successful');
    console.log('🔗 Authorization URL:', response.data.data.authorization_url);

    res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error('❌ Payment initialization error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Payment initialization failed',
    });
  }
});

// @route   POST /api/payment/webhook
// @desc    PayStack webhook for real-time payment confirmation
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  console.log('🔵 WEBHOOK RECEIVED');
  
  // Verify webhook signature
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(req.body)
    .digest('hex');
    
  if (hash !== req.headers['x-paystack-signature']) {
    console.log('❌ Invalid webhook signature');
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const event = JSON.parse(req.body);
  console.log('📦 Webhook event:', event.event);
  
  if (event.event === 'charge.success') {
    const { reference, metadata, amount, customer } = event.data;
    const orderId = metadata.orderId;
    
    console.log(`✅ Charge successful for order: ${orderId}`);
    console.log(`💰 Amount: ${amount}`);
    console.log(`📧 Customer: ${customer.email}`);
    
    // Update order status in database
    const order = await Order.findById(orderId);
    
    if (order && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: reference,
        status: 'success',
        update_time: new Date().toISOString(),
        email_address: customer.email,
      };
      order.status = 'processing';
      await order.save();
      
      console.log(`✅ Order ${order._id} marked as PAID`);
    } else {
      console.log(`⚠️ Order ${orderId} not found or already paid`);
    }
  }
  
  // Always return 200 to acknowledge receipt
  res.json({ received: true });
});

// @route   GET /api/payment/verify/:reference
// @desc    Verify payment (fallback for callback)
router.get('/verify/:reference', async (req, res) => {
  console.log('🔵 VERIFY PAYMENT CALLED for reference:', req.params.reference);
  
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${req.params.reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    
    if (response.data.data.status === 'success') {
      const { metadata, reference } = response.data.data;
      
      const order = await Order.findById(metadata.orderId);
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = {
          id: reference,
          status: 'success',
          update_time: new Date().toISOString(),
        };
        order.status = 'processing';
        await order.save();
        console.log(`✅ Order ${order._id} marked as paid via verification`);
      }
      
      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: response.data.data,
      });
    } else {
      res.json({
        success: false,
        message: 'Payment not successful',
      });
    }
  } catch (error) {
    console.error('❌ Payment verification error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
    });
  }
});

// @route   GET /api/payment/callback
// @desc    Handle Paystack redirect after payment
router.get('/callback', async (req, res) => {
  const { reference, trxref } = req.query;
  const paymentReference = reference || trxref;
  
  console.log('🔵 CALLBACK RECEIVED for reference:', paymentReference);
  
  if (!paymentReference) {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/error?message=No reference provided`);
  }
  
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${paymentReference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    
    if (response.data.data.status === 'success') {
      const { metadata } = response.data.data;
      const order = await Order.findById(metadata.orderId);
      
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = {
          id: paymentReference,
          status: 'success',
          update_time: new Date().toISOString(),
        };
        order.status = 'processing';
        await order.save();
      }
      
      // Redirect to success page
      res.redirect(`${process.env.FRONTEND_URL}/payment/success?reference=${paymentReference}`);
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/payment/error?message=Payment%20failed`);
    }
  } catch (error) {
    console.error('Callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/error?message=Verification%20failed`);
  }
});

module.exports = router;