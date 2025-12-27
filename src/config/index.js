module.exports = {
  // 服务端口
  port: process.env.PORT || 3000,
  
  // JWT 密钥
  jwtSecret: 'your-secret-key-change-in-production',
  
  // JWT 过期时间
  jwtExpire: '7d',
  
  // 文件上传配置
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    allowedExtensions: ['.jpg', '.jpeg', '.png']
  },
  
  // 微信小程序配置（需要替换为实际的 AppID 和 AppSecret）
  wechat: {
    appId: 'your_wechat_app_id',
    appSecret: 'your_wechat_app_secret'
  },
  
  // CDN 配置（模拟）
  cdn: {
    baseUrl: 'https://cdn.example.com'
  },
  
  // Google Gemini API 配置
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || 'your-gemini-api-key',
    model: 'gemini-2.0-flash-exp', // 或 'gemini-1.5-pro'
    imageGeneration: {
      model: 'imagen-3.0-generate-001', // Imagen 3 模型
      endpoint: 'https://generativelanguage.googleapis.com/v1beta'
    }
  }
};
