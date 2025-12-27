const Response = require('../utils/response');

/**
 * 全局错误处理中间件
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Multer 文件上传错误
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json(Response.error(1003, '文件大小超限'));
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json(Response.error(400, '文件字段错误'));
  }

  // 默认服务器错误
  res.status(500).json(Response.error(500, '服务器内部错误', err.message));
}

module.exports = errorHandler;
