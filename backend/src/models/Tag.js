const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, enum: ['技术', '设计', '管理', '其他'], default: '其他' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tag', tagSchema);