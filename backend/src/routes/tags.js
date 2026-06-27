const express = require('express');
const router = express.Router();
const Tag = require('../models/Tag');

router.get('/', async (req, res) => {
  try {
    const tags = await Tag.find().sort({ category: 1, name: 1 });
    res.json(tags);
  } catch (err) {
    res.status(500).json({ message: '获取标签失败', error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const existing = await Tag.findOne({ name: req.body.name });
    if (existing) return res.status(400).json({ message: '标签已存在' });
    
    const tag = new Tag(req.body);
    await tag.save();
    res.status(201).json({ message: '创建成功', tag });
  } catch (err) {
    res.status(500).json({ message: '创建失败', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const tag = await Tag.findByIdAndDelete(req.params.id);
    if (!tag) return res.status(404).json({ message: '标签不存在' });
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ message: '删除失败', error: err.message });
  }
});

module.exports = router;