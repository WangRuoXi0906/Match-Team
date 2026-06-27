const mongoose = require('mongoose');

const recruitmentSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  competitionName: { type: String, default: '' },
  teamName: { type: String, default: '' },
  leaderName: { type: String, default: '' },
  leaderId: { type: String, default: '' },
  requiredTags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  positions: { type: [String], default: [] },
  currentMembers: { type: Number, default: 1 },
  targetMembers: { type: Number, default: 3 },
  numberOfMembers: { type: Number, default: 3 },
  deadline: { type: String, default: '' },
  status: { type: String, enum: ['招募中', '已结束'], default: '招募中' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recruitment', recruitmentSchema);