const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'campus-secret';

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ message: '用户名或邮箱已存在' });

    const role = email === 'admin@example.com' ? 'admin' : 'student';
    const user = new User({ username, email, password, name, role });
    await user.save();

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: '注册成功', user: formatUser(user), token });
  } catch (err) {
    res.status(500).json({ message: '注册失败', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: '邮箱或密码错误' });

    if (!await user.matchPassword(password)) {
      return res.status(400).json({ message: '邮箱或密码错误' });
    }

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '7d' });
    res.json({ message: '登录成功', user: formatUser(user), token });
  } catch (err) {
    res.status(500).json({ message: '登录失败', error: err.message });
  }
});

router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: '未授权' });

    const decoded = jwt.verify(token, SECRET);
    const user = await User.findById(decoded.id).populate('tags');
    if (!user) return res.status(404).json({ message: '用户不存在' });

    res.json({ user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ message: '获取个人信息失败', error: err.message });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: '未授权' });

    const decoded = jwt.verify(token, SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: '用户不存在' });

    Object.assign(user, req.body, { updatedAt: Date.now() });
    await user.save();
    res.json({ message: '更新成功', user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ message: '更新失败', error: err.message });
  }
});

router.put('/tags', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: '未授权' });

    const decoded = jwt.verify(token, SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: '用户不存在' });

    user.tags = req.body.tags;
    user.updatedAt = Date.now();
    await user.save();
    res.json({ message: '标签更新成功', user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ message: '更新失败', error: err.message });
  }
});

function formatUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    tags: user.tags || [],
    bio: user.bio,
    role: user.role || 'student'
  };
}

module.exports = router;