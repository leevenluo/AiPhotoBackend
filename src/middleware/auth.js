const Response = require('../utils/response');
const JWTUtil = require('../utils/jwt');

/**
 * 认证中间件
 */
function authMiddleware(req, res, next) {
  // 从请求头获取 token
  const authorization = req.headers.authorization;
  
  if (!authorization) {
    return res.status(401).json(Response.error(401, '未授权，需要登录'));
  }

  // 提取 Bearer token
  const token = authorization.replace('Bearer ', '');
  
  // 验证 token
  const decoded = JWTUtil.verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json(Response.error(401, 'Token 无效或已过期'));
  }

  // 将用户信息挂载到 req 对象
  req.user = decoded;
  
  next();
}

module.exports = authMiddleware;
