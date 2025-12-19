const Request = require('../models/Request');
const Donation = require('../models/Donation');
const Payment = require('../models/Payment');
const asyncHandler = require('../utils/asyncHandler');

const { getJSON, setJSON, del } = require('../utils/cache');

exports.getDashboard = asyncHandler(async (req, res) => {
  const q = req.query.q || '';
  const filter = { status: 'open' };
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
  }
  let requests;
  const cacheKey = 'donor:dashboard:open';
  if (!q) {
    requests = await getJSON(req.app, cacheKey);
  }
  if (!requests) {
    requests = await Request.find(filter).populate('student', 'name').sort({ createdAt: -1 }).lean({ virtuals: true });
    if (!q) await setJSON(req.app, cacheKey, requests, 30); // 30s cache for open list when no search
  }
  res.render('donor/dashboard', { title: 'Donor Dashboard', requests, q });
});

exports.postDonate = asyncHandler(async (req, res) => {
  const { requestId, amount } = req.body;
  const request = await Request.findById(requestId);
  if (!request || request.status !== 'open') return res.status(400).json({ message: 'Invalid request' });
  const amt = Number(amount);
  if (!amt || amt <= 0) return res.status(400).json({ message: 'Invalid amount' });

  const donation = await Donation.create({ donor: req.user._id, request: request._id, amount: amt });
  await Payment.create({ donation: donation._id, status: 'completed' });
  request.amountFunded += amt;
  if (request.amountFunded >= request.amountRequested) request.status = 'funded';
  await request.save();
  // Invalidate caches affected by donation
  await del(req.app, 'donor:dashboard:open');
  await del(req.app, `student:dashboard:${request.student}`);

  // Update donors and student via socket
  const io = req.app.get('io');
  io.to('donors').emit('request-updated', { id: request._id, amountFunded: request.amountFunded, status: request.status });
  io.to('students').emit('request-updated', { id: request._id, amountFunded: request.amountFunded, status: request.status });

  res.json({ success: true });
});

exports.getHistory = asyncHandler(async (req, res) => {
  const donations = await Donation.find({ donor: req.user._id }).populate('request').sort({ createdAt: -1 }).lean();
  res.render('donor/history', { title: 'Donation History', donations });
});
