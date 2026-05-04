const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderNumber: String,
  orderItems: [{
    product: { type: String, required: true }, // String instead of ObjectId
    name: String,
    price: Number,
    quantity: Number,
    size: String,
    color: String,
    image: String,
  }],
  shippingAddress: {
    address: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  paymentMethod: String,
  paymentResult: Object,
  paymentStatus: { type: String, default: 'pending' },
  transactionId: String,
  itemsPrice: Number,
  shippingPrice: Number,
  totalPrice: Number,
  isPaid: { type: Boolean, default: false },
  paidAt: Date,
  isDelivered: { type: Boolean, default: false },
  deliveredAt: Date,
  status: { type: String, default: 'pending' },
  trackingNumber: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);