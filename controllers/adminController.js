const User = require('../models/User');
const Request = require('../models/Request');
const Donation = require('../models/Donation');
const asyncHandler = require('../utils/asyncHandler');

exports.getDashboard = asyncHandler(async (req, res) => {
  const [users, requests, donations] = await Promise.all([
    User.find().select('-password').lean(),
    Request.find().populate('student', 'name').lean(),
    Donation.find().populate('donor', 'name').populate('request', 'title').lean(),
  ]);
  res.render('admin/dashboard', { title: 'Admin Dashboard', users, requests, donations });
});
