# 校园竞赛组队平台

> 一个集竞赛展示、招募、组队、群聊、个人主页于一体的校园竞赛组队平台

## 项目简介

校园竞赛组队平台是一个面向高校学生的 Web 平台，主要功能包括竞赛信息展示、组队招募、加入申请、群聊交流和个人主页管理等。项目采用前后端分离架构，前端基于 React 18 + TypeScript，后端基于 Node.js + Express，数据库使用 MongoDB。

## 技术栈

### 前端
- React 18
- TypeScript
- Vite（构建工具）
- React Router（路由管理）
- Tailwind CSS（样式设计）
- Axios（HTTP 请求）

### 后端
- Node.js 18+
- Express（Web 框架）
- MongoDB 8.0 + Mongoose（ODM）
- JWT（身份认证）
- bcryptjs（密码加密）
- multer（文件上传）
- WebSocket（实时通信）

### 开发工具
- TRAE IDE（AI 辅助开发）
- Git（版本控制）

## 环境要求

- Node.js 18.0 或更高版本[reference:0]
- MongoDB 8.0 或更高版本[reference:1]
- 现代浏览器（Chrome、Edge 等）

## 安装与运行

### 1. 克隆项目

```bash
git clone https://github.com/您的用户名/项目名.git
cd 项目名
```

### 2. 后端配置与启动

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
# 复制 .env.example 为 .env，并填写相应配置
cp .env.example .env
```

`.env` 文件内容示例：

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/competition-platform
JWT_SECRET=your_jwt_secret_key
```

```bash
# 启动后端服务
npm run dev
# 或
node server.js
```

后端服务默认运行在 `http://localhost:5000`[reference:2]

### 3. 前端配置与启动

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端开发服务器默认运行在 `http://localhost:5173`[reference:3]

### 4. 数据库启动

确保 MongoDB 服务已启动：

```bash
# Windows（需以管理员身份运行）
net start MongoDB

# macOS（使用 Homebrew 安装）
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 5. 访问系统

打开浏览器访问 `http://localhost:5173` 即可使用平台。

## 项目结构

```
项目根目录/
├── backend/                    # 后端代码
│   ├── src/
│   │   ├── controllers/        # 控制器层
│   │   ├── services/           # 业务逻辑层
│   │   ├── models/             # 数据模型（Mongoose Schema）
│   │   ├── routes/             # 路由配置
│   │   ├── config/             # 配置文件
│   │   └── app.js              # Express 应用配置
│   ├── server.js               # 服务入口
│   ├── package.json
│   └── .env
├── frontend/                   # 前端代码
│   ├── src/
│   │   ├── components/         # 可复用组件
│   │   ├── pages/              # 页面组件
│   │   ├── hooks/              # 自定义 Hooks
│   │   ├── utils/              # 工具函数
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── README.md
└── .gitignore
```

## 核心功能

| 功能模块 | 说明 |
|----------|------|
| 用户认证 | 注册、登录、JWT 身份认证 |
| 竞赛管理 | 竞赛列表浏览、详情查看、搜索筛选 |
| 招募管理 | 发布招募、编辑删除、申请加入 |
| 组队管理 | 创建队伍、成员管理、审核入队申请 |
| 群聊服务 | WebSocket 实时消息收发、历史记录 |
| 个人主页 | 资料编辑、头像上传、参赛记录 |
| 后台管理 | 用户管理、竞赛上传、内容审核 |

## API 文档

主要接口列表（开发环境）：

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| GET | /api/competitions | 获取竞赛列表 |
| GET | /api/competitions/:id | 获取竞赛详情 |
| POST | /api/recruitments | 发布招募 |
| POST | /api/recruitments/:id/apply | 申请加入 |
| PUT | /api/applications/:id/review | 审核申请 |
| WebSocket | ws://localhost:5000/chat | 群聊连接 |

## AI 辅助开发说明

本项目在开发过程中使用了 **TRAE IDE** 的 AI 辅助能力[reference:4]：

- **代码生成**：AI 辅助生成数据模型、接口骨架、配置类等基础代码
- **代码补全**：智能代码补全提升编码效率
- **Bug 修复**：辅助定位问题并提供修复建议
- **代码审查**：检查代码质量并提供优化建议

所有 AI 生成的代码均经人工审核、修改和整合，最终代码由开发者独立负责[reference:5]。

## 贡献指南

本项目为课程实践项目，欢迎 Fork 和 Star。

## 许可证

本项目仅供学习交流使用。

## 联系方式

- 作者：王若熙
- 邮箱：1041974379@qq.com
- GitHub：https://github.com/WangRuoXi0906
