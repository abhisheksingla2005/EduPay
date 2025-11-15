const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  amountRequested: { type: Number, required: true, min: 1 },
  amountFunded: { type: Number, default: 0 },
  deadline: { type: Date },
  status: { type: String, enum: ['open', 'funded', 'closed'], default: 'open' },
}, { timestamps: true });

requestSchema.virtual('progress').get(function() {
  return this.amountRequested ? Math.min(100, Math.round((this.amountFunded / this.amountRequested) * 100)) : 0;
});

module.exports = mongoose.model('Request', requestSchema);
