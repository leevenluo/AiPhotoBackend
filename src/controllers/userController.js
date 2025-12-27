const Response = require('../utils/response');
const JWTUtil = require('../utils/jwt');
const storage = require('../models/storage');
const { v4: uuidv4 } = require('uuid');

/**
 * 用户控制器
 */
class UserController {
  /**
   * 用户登录
   * POST /api/user/login
   */
  async login(req, res) {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json(Response.error(400, '缺少登录凭证'));
      }

      // 在实际环境中，这里应该调用微信接口换取 openid
      // const wxResult = await axios.get(`https://api.weixin.qq.com/sns/jscode2session`, {
      //   params: {
      //     appid: config.wechat.appId,
      //     secret: config.wechat.appSecret,
      //     js_code: code,
      //     grant_type: 'authorization_code'
      //   }
      // });
      
      // 模拟获取 openid
      const openid = `openid_${code}`;

      // 查找或创建用户
      let user = storage.getUserByOpenid(openid);
      
      if (!user) {
        // 新用户，创建账号并赠送积分
        user = storage.createUser({
          id: `user_${uuidv4()}`,
          nickname: `用户${Math.floor(Math.random() * 10000)}`,
          avatar: 'https://cdn.example.com/avatar/default.jpg',
          points: 10,
          openid
        });
      }

      // 生成 token
      const token = JWTUtil.generateToken({
        userId: user.id,
        openid: user.openid
      });

      // 返回用户信息
      res.json(Response.success({
        token,
        userInfo: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          points: user.points
        }
      }));
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json(Response.error(500, '登录失败'));
    }
  }

  /**
   * 获取用户积分
   * GET /api/user/points
   */
  async getPoints(req, res) {
    try {
      const userId = req.user.userId;
      const user = storage.getUserById(userId);

      if (!user) {
        return res.status(404).json(Response.error(404, '用户不存在'));
      }

      res.json(Response.success({
        points: user.points
      }));
    } catch (error) {
      console.error('Get points error:', error);
      res.status(500).json(Response.error(500, '获取积分失败'));
    }
  }
}

module.exports = new UserController();
