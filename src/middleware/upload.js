const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const Response = require('../utils/response');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

// 文件过滤
const fileFilter = (req, file, cb) => {
  // 检查文件类型
  if (!config.upload.allowedTypes.includes(file.mimetype)) {
    return cb(new Error('不支持的文件格式'), false);
  }
  
  const ext = path.extname(file.originalname).toLowerCase();
  if (!config.upload.allowedExtensions.includes(ext)) {
    return cb(new Error('不支持的文件扩展名'), false);
  }
  
  cb(null, true);
};

// 创建上传中间件
const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.upload.maxSize
  },
  fileFilter: fileFilter
});

// 错误处理包装器
const handleUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err.message === '不支持的文件格式' || err.message === '不支持的文件扩展名') {
          return res.status(400).json(Response.error(1002, err.message));
        }
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json(Response.error(1003, '文件大小超限'));
        }
        return res.status(400).json(Response.error(400, err.message || '文件上传失败'));
      }
      next();
    });
  };
};

module.exports = {
  upload,
  handleUpload
};
