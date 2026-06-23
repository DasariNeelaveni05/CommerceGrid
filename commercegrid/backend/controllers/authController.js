const jwt = require('jsonwebtoken');
const { User } = require('../models');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ email, password, firstName, lastName });
    const token = signToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(user.id);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// PATCH /api/auth/me
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, bio, addressStreet, addressCity, addressState, addressPincode, addressCountry } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    await user.update({ firstName, lastName, phone, bio, addressStreet, addressCity, addressState, addressPincode, addressCountry });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
