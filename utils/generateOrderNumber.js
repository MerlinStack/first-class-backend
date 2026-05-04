// backend/utils/generateOrderNumber.js
const { getNextSequence } = require('../models/Counter');

/**
 * Generate a formatted order number
 * Format: FCUB-YYYYMMDD-XXXXX
 * Example: FCUB-20250428-00001
 */
const generateOrderNumber = async () => {
  // Get the next sequence number (atomic operation)
  const sequence = await getNextSequence('order_number');
  
  // Get current date in YYYYMMDD format
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Format sequence with leading zeros (5 digits)
  const sequenceStr = String(sequence).padStart(5, '0');
  
  // Combine: Prefix + Date + Sequence
  const orderNumber = `FCUB-${dateStr}-${sequenceStr}`;
  
  return orderNumber;
};

module.exports = generateOrderNumber;