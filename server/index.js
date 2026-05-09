require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const Message = require('./models/Message');
const cors = require('cors');
const jwt = require('jsonwebtoken');

//import routers.
const authRouter = require('./routes/auth');
const groupsRouter = require('./routes/groups');

const app = express();

//create http server.
const server = http.createServer(app);

//bind Socket.io to the server.
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});

// 中间件
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));  // 允许前端访问
app.use(express.json());  // 解析 JSON 数据

//Mont routers.
app.use(authRouter);
app.use(groupsRouter);

// 连接数据库
mongoose.connect(process.env.DB_URL)
  .then(() => console.log('数据库连接成功'))
  .catch(err => console.error('数据库连接失败:', err));

//Socket.io's connection handle.
io.on('connection', (socket) => {
    const token = socket.handshake.auth.token;
    let userId;

    if (!token) {
      console.error('No token found.');
      socket.disconnect();
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (error) {
      console.error(error.message);
      socket.disconnect();
      return;
    }

    console.log('A user connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });

    socket.on('join-group', (groupId) => {
      socket.join(groupId);
      console.log('User:', userId, 'Joined group:', groupId);
    });
    
    socket.on('message', async (message) => {
      const { content, groupId } = message;

      const newMessage = await Message.create({
        content,
        sender: userId,
        groupId
      });

      const savedMessage = await Message.findById(newMessage._id).populate('sender', 'username');

      io.to(groupId).emit('message', savedMessage);
    });
});

// 测试接口
app.get('/', (req, res) => {
  res.send('后端服务正在运行');
});

// 启动服务器
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
