// 加载环境变量
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

// 路由
const userRoutes = require('./routes/user');
const photoRoutes = require('./routes/photo');
const galleryRoutes = require('./routes/gallery');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务（用于访问上传的文件）
app.use('/uploads', express.static('uploads'));

// 路由挂载
app.use('/api/user', userRoutes);
app.use('/api/photo', photoRoutes);
app.use('/api/gallery', galleryRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: 'AI Photo Backend API',
    version: '1.0.0',
    docs: '/api-docs'
  });
});

// 错误处理中间件（必须放在最后）
app.use(errorHandler);

// 启动服务器
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║     AI Photo Backend API Server Started! 🚀      ║
║                                                   ║
║     Server running on: http://localhost:${PORT}     ║
║     Environment: development                      ║
║                                                   ║
║     API Routes:                                   ║
║     - POST   /api/user/login                      ║
║     - GET    /api/user/points                     ║
║     - POST   /api/photo/upload                    ║
║     - POST   /api/photo/generate                  ║
║     - GET    /api/photo/status                    ║
║     - GET    /api/photo/result                    ║
║     - GET    /api/gallery/list                    ║
║     - GET    /api/gallery/detail                  ║
║                                                   ║
║     Health Check: http://localhost:${PORT}/health   ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);
});

module.exports = app;
