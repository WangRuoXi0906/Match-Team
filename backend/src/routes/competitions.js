const express = require('express');
const router = express.Router();
const Competition = require('../models/Competition');
const { requireAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const competitions = await Competition.find().populate('tags').sort({ createdAt: -1 });
    res.json(competitions);
  } catch (err) {
    res.status(500).json({ message: '获取竞赛失败', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id).populate('tags');
    if (!competition) return res.status(404).json({ message: '竞赛不存在' });
    res.json(competition);
  } catch (err) {
    res.status(500).json({ message: '获取竞赛失败', error: err.message });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const competition = new Competition(req.body);
    await competition.save();
    res.status(201).json({ message: '创建成功', competition });
  } catch (err) {
    res.status(500).json({ message: '创建失败', error: err.message });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const competition = await Competition.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!competition) return res.status(404).json({ message: '竞赛不存在' });
    res.json({ message: '更新成功', competition });
  } catch (err) {
    res.status(500).json({ message: '更新失败', error: err.message });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const competition = await Competition.findByIdAndDelete(req.params.id);
    if (!competition) return res.status(404).json({ message: '竞赛不存在' });
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ message: '删除失败', error: err.message });
  }
});

module.exports = router;