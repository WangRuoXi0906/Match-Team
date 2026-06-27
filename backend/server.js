const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/campus-competition', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('数据库连接成功'))
  .catch(err => console.error('数据库连接失败:', err));

const authRoutes = require('./src/routes/auth');
const competitionRoutes = require('./src/routes/competitions');
const teamRoutes = require('./src/routes/teams');
const recruitmentRoutes = require('./src/routes/recruitments');
const tagRoutes = require('./src/routes/tags');

app.use('/api/auth', authRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/recruitments', recruitmentRoutes);
app.use('/api/tags', tagRoutes);

app.get('/', (req, res) => {
  res.send('校园组队竞赛平台 MVP');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});