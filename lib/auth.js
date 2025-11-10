import jwt from 'jsonwebtoken';
import User from '../models/User';
import connectDB from './db';

export const signToken = (user) => jwt.sign(
  { id: user._id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

export const verifyToken = async (token) => {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();
    const user = await User.findById(decoded.id).select('-passwordHash');
    return user;
  } catch (err) {
    return null;
  }
};
