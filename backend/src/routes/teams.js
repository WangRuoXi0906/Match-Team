const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().populate('leader members competition tags').sort({ createdAt: -1 });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: '获取队伍失败', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('leader members competition tags');
    if (!team) return res.status(404).json({ message: '队伍不存在' });
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: '获取队伍失败', error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { leader, ...rest } = req.body;
    const team = new Team({ ...rest, leader, members: [leader] });
    await team.save();
    res.status(201).json({ message: '创建成功', team });
  } catch (err) {
    res.status(500).json({ message: '创建失败', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!team) return res.status(404).json({ message: '队伍不存在' });
    res.json({ message: '更新成功', team });
  } catch (err) {
    res.status(500).json({ message: '更新失败', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return res.status(404).json({ message: '队伍不存在' });
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ message: '删除失败', error: err.message });
  }
});

router.post('/:id/members', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: '队伍不存在' });
    if (!team.members.includes(req.body.userId)) {
      team.members.push(req.body.userId);
      team.updatedAt = Date.now();
      await team.save();
    }
    res.json({ message: '添加成功', team });
  } catch (err) {
    res.status(500).json({ message: '添加失败', error: err.message });
  }
});

router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: '队伍不存在' });
    if (team.leader.toString() === req.params.userId) {
      return res.status(400).json({ message: '队长不能被移除' });
    }
    team.members = team.members.filter(m => m.toString() !== req.params.userId);
    team.updatedAt = Date.now();
    await team.save();
    res.json({ message: '移除成功', team });
  } catch (err) {
    res.status(500).json({ message: '移除失败', error: err.message });
  }
});

module.exports = router;