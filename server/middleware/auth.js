import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Bypass for Demo User (Fail-safe)
    if (token === 'dummy-demo-token') {
      const dummyUser = await User.findOne({ email: 'dummy@kiit.ac.in' });
      if (dummyUser) {
        req.userId = dummyUser._id;
        req.userRole = dummyUser.role;
        return next();
      }
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'K-Forum-secret');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.userId = user._id;
    req.userRole = user.role;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (user.role !== 'admin' && user.role !== 'moderator') {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};