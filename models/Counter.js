// backend/models/Counter.js
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },  // e.g., 'order_number'
  sequence_value: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

// Function to get next sequence value
const getNextSequence = async (sequenceName) => {
  const counter = await Counter.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }  // upsert: true creates if doesn't exist
  );
  return counter.sequence_value;
};

module.exports = { Counter, getNextSequence };