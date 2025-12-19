const Request = require('../models/Request');
const Donation = require('../models/Donation');
const asyncHandler = require('../utils/asyncHandler');

const { getJSON, setJSON, del } = require('../utils/cache');

exports.getDashboard = asyncHandler(async (req, res) => {
  const cacheKey = `student:dashboard:${req.user._id}`;
  let cached = await getJSON(req.app, cacheKey);
  if (!cached) {
    const myRequests = await Request.find({ student: req.user._id }).sort({ createdAt: -1 }).lean({ virtuals: true });
    const totalRequested = myRequests.reduce((sum, r) => sum + r.amountRequested, 0);
    const totalFunded = myRequests.reduce((sum, r) => sum + r.amountFunded, 0);
    cached = { myRequests, totalRequested, totalFunded };
    await setJSON(req.app, cacheKey, cached, 60); // cache 60s
  }
  res.render('student/dashboard', { title: 'Student Dashboard', ...cached });
});

exports.getCreateRequest = (req, res) => {
  res.render('student/create-request', { title: 'Create Request' });
};

exports.postCreateRequest = asyncHandler(async (req, res) => {
  const { title, description, amountRequested, deadline } = req.body;
  if (!title || !description || !amountRequested) {
    return res.status(400).render('student/create-request', { title: 'Create Request', error: 'All fields with * are required' });
  }
  const request = await Request.create({
    student: req.user._id,
    title,
    description,
    amountRequested: Number(amountRequested),
    deadline: deadline ? new Date(deadline) : undefined,
  });

  // Emit socket notification to donors
  const io = req.app.get('io');
  io.to('donors').emit('student-request-notification', {
    id: request._id,
    title: request.title,
    amountRequested: request.amountRequested,
    amountFunded: request.amountFunded,
    studentName: req.user.name,
    createdAt: request.createdAt,
  });

  // Invalidate student dashboard cache & donor dashboard cache
  await del(req.app, `student:dashboard:${req.user._id}`);
  await del(req.app, 'donor:dashboard:open');
  res.redirect('/student/my-requests');
});

exports.getMyRequests = asyncHandler(async (req, res) => {
  const myRequests = await Request.find({ student: req.user._id }).sort({ createdAt: -1 }).lean({ virtuals: true });
  res.render('student/my-requests', { title: 'My Requests', myRequests });
});

exports.postUpdateRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, amountRequested, deadline } = req.body;
  const request = await Request.findOne({ _id: id, student: req.user._id });
  if (!request) return res.status(404).render('errors/404', { title: 'Not Found' });
  if (request.amountFunded > 0) return res.status(400).render('student/my-requests', { title: 'My Requests', error: 'Cannot edit a request that has donations.' });
  request.title = title || request.title;
  request.description = description || request.description;
  request.amountRequested = amountRequested ? Number(amountRequested) : request.amountRequested;
  request.deadline = deadline ? new Date(deadline) : request.deadline;
  await request.save();
  await del(req.app, `student:dashboard:${req.user._id}`);
  await del(req.app, 'donor:dashboard:open');
  res.redirect('/student/my-requests');
});

exports.postDeleteRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const request = await Request.findOne({ _id: id, student: req.user._id });
  if (!request) return res.status(404).render('errors/404', { title: 'Not Found' });
  if (request.amountFunded > 0) return res.status(400).render('student/my-requests', { title: 'My Requests', error: 'Cannot delete a request that has donations.' });
  await request.deleteOne();
  await del(req.app, `student:dashboard:${req.user._id}`);
  await del(req.app, 'donor:dashboard:open');
  res.redirect('/student/my-requests');
});
