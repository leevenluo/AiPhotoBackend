const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const authMiddleware = require('../middleware/auth');

// 所有展厅接口都需要认证
router.use(authMiddleware);

// 获取作品列表
router.get('/list', galleryController.getList.bind(galleryController));

// 获取作品详情
router.get('/detail', galleryController.getDetail.bind(galleryController));

module.exports = router;
