const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  recruitment: { type: mongoose.Schema.Types.ObjectId, ref: 'Recruitment', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, default: '' },
  userGrade: { type: String, default: '' },
  userSkills: { type: [String], default: [] },
  status: { type: String, enum: ['待审核', '已通过', '已拒绝'], default: '待审核' },
  message: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema);