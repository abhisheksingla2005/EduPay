// Placeholder for future payment processor integration
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true },
  provider: { type: String, default: 'manual' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  transactionId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
