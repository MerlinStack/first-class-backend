const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
  },
  salePrice: {
    type: Number,
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Dress', 'Gown', 'Two Piece', 'Jeans', 'Jumpsuit', 'Shape Wear'],
  },
  sizes: [{
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  }],
  colors: [{
    name: String,
    code: String,
  }],
  images: [{
    url: String,
    publicId: String,
  }],
  mainImage: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  isNew: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  ratings: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create product slug from name
productSchema.pre('save', function(next) {
  this.slug = this.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  next();
});

module.exports = mongoose.model('Product', productSchema);