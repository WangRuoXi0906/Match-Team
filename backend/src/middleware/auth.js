const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SECRET = process.env.JWT_SECRET || 'campus-secret';

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: '未授权' });

    const decoded = jwt.verify(token, SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: '用户不存在' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token无效' });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: '未授权' });

    const decoded = jwt.verify(token, SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: '用户不存在' });
    if (user.role !== 'admin') return res.status(403).json({ message: '权限不足' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token无效' });
  }
};

module.exports = { authenticate, requireAdmin };
