const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const products = [
  {
    name: 'Elegant Black Dress',
    description: 'Stunning elegant black dress perfect for any occasion. Made with premium fabric that drapes beautifully.',
    price: 45000,
    category: 'Dress',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [{ name: 'Black', code: '#000000' }, { name: 'Navy', code: '#000080' }],
    mainImage: 'https://via.placeholder.com/400x500?text=Black+Dress',
    stock: 50,
    isNew: true,
    isFeatured: true,
  },
  {
    name: 'Blue Evening Gown',
    description: 'Breathtaking blue evening gown for formal events. Features a flowing skirt and elegant design.',
    price: 55000,
    category: 'Gown',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Royal Blue', code: '#4169E1' }],
    mainImage: 'https://via.placeholder.com/400x500?text=Blue+Gown',
    stock: 30,
    isNew: true,
  },
  {
    name: 'Black Jean Trousers',
    description: 'Premium quality black jean trousers with perfect fit. Comfortable and stylish.',
    price: 70000,
    category: 'Jeans',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [{ name: 'Black', code: '#000000' }],
    mainImage: 'https://via.placeholder.com/400x500?text=Black+Jeans',
    stock: 40,
    isFeatured: true,
  },
  {
    name: 'Pink Bodycon Dress',
    description: 'Chic pink bodycon dress that hugs your curves perfectly. Great for parties and date nights.',
    price: 32000,
    category: 'Dress',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [{ name: 'Pink', code: '#FFC0CB' }, { name: 'Red', code: '#FF0000' }],
    mainImage: 'https://via.placeholder.com/400x500?text=Pink+Dress',
    stock: 25,
  },
  {
    name: 'Casual Black Romper',
    description: 'Comfortable and stylish black romper for casual outings.',
    price: 30000,
    category: 'Jumpsuit',
    sizes: ['S', 'M', 'L'],
    colors: [{ name: 'Black', code: '#000000' }],
    mainImage: 'https://via.placeholder.com/400x500?text=Black+Romper',
    stock: 35,
  },
  {
    name: 'Brown Two Piece Set',
    description: 'Stylish two-piece set including crop top and matching skirt.',
    price: 48000,
    category: 'Two Piece',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Brown', code: '#8B4513' }],
    mainImage: 'https://via.placeholder.com/400x500?text=Two+Piece',
    stock: 20,
    isNew: true,
  },
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Product.deleteMany();
    await Product.insertMany(products);
    console.log('✅ Products seeded successfully');
    process.exit();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedProducts();