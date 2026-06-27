# 校园组队竞赛平台系统设计

## 1. 技术栈选择

### 前端
- React 18 + TypeScript
- Tailwind CSS 3
- React Router 6
- Axios
- React Hook Form

### 后端
- Node.js + Express
- MongoDB (Mongoose)
- JWT 认证
- CORS

## 2. 功能模块划分

### 2.1 核心模块

#### 用户模块
- 用户注册、登录、退出
- 个人信息管理
- 能力标签管理

#### 竞赛模块
- 竞赛通知发布
- 竞赛列表展示
- 竞赛详情查看

#### 组队模块
- 创建队伍
- 发布招募信息
- 申请加入队伍
- 队伍管理

#### 标签模块
- 能力标签定义
- 个人标签设置
- 标签搜索与筛选

### 2.2 辅助模块
- 通知系统
- 搜索系统
- 消息系统

## 3. 数据库设计

### 3.1 用户表 (users)
```
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String,
  name: String,
  avatar: String,
  tags: [ObjectId], // 能力标签引用
  bio: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 3.2 竞赛表 (competitions)
```
{
  _id: ObjectId,
  title: String,
  description: String,
  organizer: String,
  startDate: Date,
  endDate: Date,
  status: String, // 进行中、已结束、未开始
  coverImage: String,
  tags: [ObjectId], // 相关标签
  createdAt: Date,
  updatedAt: Date
}
```

### 3.3 队伍表 (teams)
```
{
  _id: ObjectId,
  name: String,
  description: String,
  leader: ObjectId, // 队长用户ID
  members: [ObjectId], // 成员用户ID
  competition: ObjectId, // 关联竞赛
  tags: [ObjectId], // 队伍标签
  createdAt: Date,
  updatedAt: Date
}
```

### 3.4 招募表 (recruitments)
```
{
  _id: ObjectId,
  team: ObjectId, // 关联队伍
  title: String,
  description: String,
  requiredTags: [ObjectId], // 所需能力标签
  numberOfMembers: Number, // 招募人数
  deadline: Date,
  status: String, // 招募中、已结束
  createdAt: Date,
  updatedAt: Date
}
```

### 3.5 申请表 (applications)
```
{
  _id: ObjectId,
  recruitment: ObjectId, // 关联招募
  user: ObjectId, // 申请人
  status: String, // 待审核、已通过、已拒绝
  message: String, // 申请留言
  createdAt: Date,
  updatedAt: Date
}
```

### 3.6 标签表 (tags)
```
{
  _id: ObjectId,
  name: String,
  category: String, // 技术、设计、管理等
  createdAt: Date
}
```

## 4. API接口规划

### 4.1 用户相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取个人信息
- `PUT /api/auth/profile` - 更新个人信息
- `PUT /api/auth/tags` - 更新个人能力标签

### 4.2 竞赛相关
- `GET /api/competitions` - 获取竞赛列表
- `GET /api/competitions/:id` - 获取竞赛详情
- `POST /api/competitions` - 创建竞赛（管理员）
- `PUT /api/competitions/:id` - 更新竞赛（管理员）
- `DELETE /api/competitions/:id` - 删除竞赛（管理员）

### 4.3 队伍相关
- `GET /api/teams` - 获取队伍列表
- `GET /api/teams/:id` - 获取队伍详情
- `POST /api/teams` - 创建队伍
- `PUT /api/teams/:id` - 更新队伍信息
- `DELETE /api/teams/:id` - 删除队伍
- `POST /api/teams/:id/members` - 添加队员
- `DELETE /api/teams/:id/members/:userId` - 移除队员

### 4.4 招募相关
- `GET /api/recruitments` - 获取招募列表
- `GET /api/recruitments/:id` - 获取招募详情
- `POST /api/recruitments` - 发布招募
- `PUT /api/recruitments/:id` - 更新招募信息
- `DELETE /api/recruitments/:id` - 删除招募
- `POST /api/recruitments/:id/apply` - 申请加入
- `PUT /api/applications/:id` - 处理申请

### 4.5 标签相关
- `GET /api/tags` - 获取所有标签
- `POST /api/tags` - 创建标签（管理员）
- `DELETE /api/tags/:id` - 删除标签（管理员）

## 5. 前端页面设计

### 5.1 主要页面
- 首页：展示热门竞赛和招募信息
- 竞赛列表页：浏览所有竞赛
- 竞赛详情页：查看竞赛详情和相关队伍
- 队伍列表页：浏览所有队伍
- 队伍详情页：查看队伍详情和成员
- 招募列表页：浏览所有招募信息
- 个人中心：管理个人信息和能力标签

### 5.2 组件设计
- 导航组件
- 竞赛卡片组件
- 队伍卡片组件
- 招募卡片组件
- 标签选择组件
- 用户信息组件

## 6. 系统流程

### 6.1 用户注册/登录流程
1. 用户注册：填写基本信息，设置密码
2. 邮箱验证（可选）
3. 用户登录：输入邮箱和密码
4. 获取JWT令牌
5. 存储令牌到本地存储

### 6.2 竞赛参与流程
1. 浏览竞赛列表
2. 查看竞赛详情
3. 创建队伍或加入现有队伍
4. 参与竞赛

### 6.3 组队流程
1. 创建队伍
2. 发布招募信息
3. 接收申请
4. 审核申请
5. 组成队伍

### 6.4 能力标签使用流程
1. 用户设置个人能力标签
2. 队伍发布招募时指定所需标签
3. 系统匹配符合条件的用户
4. 用户根据标签申请加入队伍

## 7. 安全考虑

### 7.1 认证与授权
- 使用JWT进行身份验证
- 密码加密存储
- 权限控制（普通用户、管理员）

### 7.2 数据安全
- 输入验证
- 防止SQL注入
- 防止XSS攻击
- 防止CSRF攻击

### 7.3 性能优化
- 数据库索引
- 缓存策略
- 分页加载
- 图片优化

## 8. 部署计划

### 8.1 开发环境
- 本地开发：前端使用Vite，后端使用Node.js
- 数据库：本地MongoDB

### 8.2 生产环境
- 前端：部署到Vercel或Netlify
- 后端：部署到Heroku或AWS
- 数据库：MongoDB Atlas

## 9. 测试计划

### 9.1 单元测试
- 前端组件测试
- 后端API测试

### 9.2 集成测试
- 完整流程测试
- 性能测试

### 9.3 验收测试
- 功能验证
- 用户体验测试

## 10. 项目进度规划

1. 项目初始化：1天
2. 后端API开发：3天
3. 前端页面开发：5天
4. 功能测试：2天
5. 部署上线：1天

总计：12天