const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * JWT 工具类
 */
class JWTUtil {
  // 生成 token
  static generateToken(payload) {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpire
    });
  }

  // 验证 token
  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      return null;
    }
  }
}

module.exports = JWTUtil;
