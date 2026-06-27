const mongoose = require('mongoose');
const User = require('../src/models/User');
const Recruitment = require('../src/models/Recruitment');
const Application = require('../src/models/Application');

// 连接数据库
mongoose.connect('mongodb://localhost:27017/campus-competition', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function clearNonAdminUsers() {
  try {
    console.log('开始清理非管理员用户数据...');
    
    // 获取所有非管理员用户
    const nonAdminUsers = await User.find({ role: { $ne: 'admin' } });
    const userIds = nonAdminUsers.map(user => user._id.toString());
    
    console.log(`找到 ${userIds.length} 个非管理员用户`);
    
    // 删除这些用户创建的招募
    const recruitmentResult = await Recruitment.deleteMany({ leaderId: { $in: userIds } });
    console.log(`已删除 ${recruitmentResult.deletedCount} 个招募信息`);
    
    // 删除这些用户的申请记录
    const applicationResult = await Application.deleteMany({ user: { $in: userIds } });
    console.log(`已删除 ${applicationResult.deletedCount} 个申请记录`);
    
    // 删除所有非管理员用户
    const userResult = await User.deleteMany({ role: { $ne: 'admin' } });
    console.log(`已删除 ${userResult.deletedCount} 个非管理员用户`);
    
    // 关闭数据库连接
    await mongoose.disconnect();
    console.log('清理完成！');
  } catch (error) {
    console.error('清理失败:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

clearNonAdminUsers();