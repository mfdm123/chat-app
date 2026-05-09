# Real-Time Chat App

一个实时聊天网页应用，支持用户注册登录、创建群组、实时收发消息。

## 技术栈

- Frontend: React, Web Component
- Backend: Node.js, Express
- Database: MongoDB
- 实时通信: WebSocket

## 功能

- 用户注册、登录
- 创建群组、加入群组
- 实时消息收发
- 成员列表管理
- 响应式布局，支持手机端

## 配置

- 前端 API 地址：`src/config.js` 的 `API_BASE`
- 数据库连接：`server/.env` 的 `DB_URL`

## 运行

### 数据库
下载 MongoDB Community Server，安装后运行：mongod

### 后端
cd server
npm install
node index.js

### 前端
npm install
npm run dev

"# chat-app" 
