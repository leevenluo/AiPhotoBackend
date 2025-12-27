const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// 用户登录（不需要认证）
router.post('/login', userController.login.bind(userController));

// 获取用户积分（需要认证）
router.get('/points', authMiddleware, userController.getPoints.bind(userController));

module.exports = router;
