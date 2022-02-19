const asyncHandler = require('express-async-handler');
const User = require('../models/User');

module.exports.me = asyncHandler(async (req, res) => {
    res.json(req.user);
});

module.exports.exists = asyncHandler(async (req, res) => {
    const username = req.params.username;
    const exists = await User.exists({ username });
    res.json(exists !== null);
});
