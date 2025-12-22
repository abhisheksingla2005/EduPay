const Request = require('../models/Request');
const Donation = require('../models/Donation');
const Payment = require('../models/Payment');
const asyncHandler = require('../utils/asyncHandler');

const { getJSON, setJSON, del } = require('../utils/cache');

// Helper to refresh donor dashboard cache
async function refreshDonorCache(app) {
  const cacheKey = 'donor:dashboard:open';
  const requests = await Request.find({ status: 'open' }).populate('student', 'name').sort({ createdAt: -1 }).lean({ virtuals: true });
  await setJSON(app, cacheKey, requests, 300);
  return requests;
}

// Helper to refresh student dashboard cache
async function refreshStudentCache(app, studentId) {
  const cacheKey = `student:dashboard:${studentId}`;
  const myRequests = await Request.find({ student: studentId }).sort({ createdAt: -1 }).lean({ virtuals: true });
  const totalRequested = myRequests.reduce((sum, r) => sum + r.amountRequested, 0);
  const totalFunded = myRequests.reduce((sum, r) => sum + r.amountFunded, 0);
  const data = { myRequests, totalRequested, totalFunded };
  await setJSON(app, cacheKey, data, 300);
  return data;
}

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
    if (!q) await setJSON(req.app, cacheKey, requests, 300); // cache 5 minutes
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
  // Refresh caches with updated data
  await refreshDonorCache(req.app);
  await refreshStudentCache(req.app, request.student);

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
