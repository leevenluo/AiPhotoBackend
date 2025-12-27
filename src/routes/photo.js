const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');
const authMiddleware = require('../middleware/auth');
const { upload, handleUpload } = require('../middleware/upload');

// 所有照片相关接口都需要认证
router.use(authMiddleware);

// 上传照片
router.post('/upload', handleUpload(upload.single('file')), photoController.upload.bind(photoController));

// 生成魔法照片
router.post('/generate', photoController.generate.bind(photoController));

// 查询生成状态
router.get('/status', photoController.getStatus.bind(photoController));

// 获取生成结果
router.get('/result', photoController.getResult.bind(photoController));

module.exports = router;
