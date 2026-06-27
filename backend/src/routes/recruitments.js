const express = require('express');
const router = express.Router();
const Recruitment = require('../models/Recruitment');
const Application = require('../models/Application');
const Team = require('../models/Team');

router.get('/', async (req, res) => {
  try {
    const recruitments = await Recruitment.find().populate('team requiredTags').sort({ createdAt: -1 });
    res.json(recruitments);
  } catch (err) {
    res.status(500).json({ message: '获取招募失败', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const recruitment = await Recruitment.findById(req.params.id).populate('team requiredTags');
    if (!recruitment) return res.status(404).json({ message: '招募不存在' });
    res.json(recruitment);
  } catch (err) {
    res.status(500).json({ message: '获取招募失败', error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const recruitment = new Recruitment(req.body);
    await recruitment.save();
    res.status(201).json({ message: '发布成功', recruitment });
  } catch (err) {
    res.status(500).json({ message: '发布失败', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const recruitment = await Recruitment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!recruitment) return res.status(404).json({ message: '招募不存在' });
    res.json({ message: '更新成功', recruitment });
  } catch (err) {
    res.status(500).json({ message: '更新失败', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const recruitment = await Recruitment.findByIdAndDelete(req.params.id);
    if (!recruitment) return res.status(404).json({ message: '招募不存在' });
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ message: '删除失败', error: err.message });
  }
});

router.post('/:id/apply', async (req, res) => {
  try {
    const existing = await Application.findOne({ recruitment: req.params.id, user: req.body.user });
    if (existing) return res.status(400).json({ message: '已申请过' });

    const application = new Application({ recruitment: req.params.id, ...req.body });
    await application.save();
    res.status(201).json({ message: '申请成功', application });
  } catch (err) {
    res.status(500).json({ message: '申请失败', error: err.message });
  }
});

// 获取某个招募的所有申请
router.get('/:id/applications', async (req, res) => {
  try {
    const applications = await Application.find({ recruitment: req.params.id })
      .populate('user', 'name username email')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: '获取申请失败', error: err.message });
  }
});

router.put('/applications/:id', async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('recruitment');
    
    if (!application) return res.status(404).json({ message: '申请不存在' });
    
    if (req.body.status === '已通过') {
      const team = await Team.findById(application.recruitment.team);
      if (team && !team.members.includes(application.user)) {
        team.members.push(application.user);
        await team.save();
      }
    }
    
    res.json({ message: '处理成功', application });
  } catch (err) {
    res.status(500).json({ message: '处理失败', error: err.message });
  }
});

module.exports = router;