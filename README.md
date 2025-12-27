# AI Photo Backend API

基于 Node.js + Express 实现的 AI 照片生成后端 API 服务。

## 功能特性

- ✅ 用户登录和积分管理
- ✅ 照片上传（支持本地存储）
- ✅ **AI 照片生成（已集成 Google Gemini API）**
- ✅ 生成状态查询（支持轮询）
- ✅ 作品展厅（列表和详情）
- ✅ JWT 身份认证
- ✅ 统一错误处理
- ✅ 完整的 API 测试脚本

## 技术栈

- **运行环境**: Node.js 14+
- **Web 框架**: Express 4.x
- **文件上传**: Multer
- **身份认证**: JWT (jsonwebtoken)
- **跨域支持**: CORS
- **AI 服务**: Google Gemini API / Imagen 3
- **HTTP 客户端**: Axios

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Gemini API（可选）

如果要使用真实的 AI 图像生成功能：

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，添加你的 Gemini API Key
# GEMINI_API_KEY=your-api-key-here
```

获取 API Key: https://aistudio.google.com/app/apikey

详细配置请查看 [GEMINI_SETUP.md](./GEMINI_SETUP.md)

**注意**: 如果不配置 API Key，系统会自动回退到模拟模式。

### 3. 启动服务

**开发模式**（支持热重载）：
```bash
npm run dev
```

**生产模式**：
```bash
npm start
```

服务将在 `http://localhost:3000` 启动。

### 3. 运行测试

确保服务已启动，然后运行：

```bash
npm test
```

测试脚本会自动执行所有 API 的功能测试。

## API 接口

### 用户相关

| 接口 | 方法 | 说明 | 认证 |
|-----|------|------|------|
| `/api/user/login` | POST | 用户登录 | ❌ |
| `/api/user/points` | GET | 获取用户积分 | ✅ |

### 照片相关

| 接口 | 方法 | 说明 | 认证 |
|-----|------|------|------|
| `/api/photo/upload` | POST | 上传照片 | ✅ |
| `/api/photo/generate` | POST | 生成魔法照片 | ✅ |
| `/api/photo/status` | GET | 查询生成状态 | ✅ |
| `/api/photo/result` | GET | 获取生成结果 | ✅ |

### 作品展厅

| 接口 | 方法 | 说明 | 认证 |
|-----|------|------|------|
| `/api/gallery/list` | GET | 获取作品列表 | ✅ |
| `/api/gallery/detail` | GET | 获取作品详情 | ✅ |

详细的接口文档请参考 [API.md](./API.md)。

## 项目结构

```
AiPhotoBackend/
├── src/
│   ├── config/              # 配置文件
│   │   └── index.js
│   ├── controllers/         # 控制器
│   │   ├── userController.js
│   │   ├── photoController.js
│   │   └── galleryController.js
│   ├── middleware/          # 中间件
│   │   ├── auth.js
│   │   ├── upload.js
│   │   └── errorHandler.js
│   ├── models/              # 数据模型
│   │   └── storage.js
│   ├── routes/              # 路由
│   │   ├── user.js
│   │   ├── photo.js
│   │   └── gallery.js
│   ├── utils/               # 工具类
│   │   ├── response.js
│   │   └── jwt.js
│   └── app.js               # 应用入口
├── test/
│   └── test.js              # 测试脚本
├── uploads/                 # 上传文件目录
├── package.json
└── README.md
```

## 配置说明

配置文件位于 `src/config/index.js`，可以修改以下配置：

- `port`: 服务端口（默认 3000）
- `jwtSecret`: JWT 密钥（生产环境务必修改）
- `jwtExpire`: Token 过期时间（默认 7 天）
- `upload.maxSize`: 文件上传大小限制（默认 10MB）
- `wechat`: 微信小程序配置（需要填写真实的 AppID 和 AppSecret）

## 使用说明

### 1. 用户登录

```bash
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"code":"test_wx_code_123"}'
```

返回示例：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "userInfo": {
      "id": "user_xxx",
      "nickname": "用户123",
      "avatar": "https://...",
      "points": 10
    }
  }
}
```

### 2. 获取用户积分

```bash
curl -X GET http://localhost:3000/api/user/points \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. 生成魔法照片

```bash
curl -X POST http://localhost:3000/api/photo/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "photoUrl": "https://cdn.example.com/photos/test.jpg",
    "prompt": "宇宙星际者古风城小机娘"
  }'
```

### 4. 查询生成状态

```bash
curl -X GET "http://localhost:3000/api/photo/status?taskId=TASK_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 开发说明

### 数据存储

当前使用内存存储（`src/models/storage.js`），重启后数据会丢失。生产环境建议使用：
- MySQL/PostgreSQL（关系型数据库）
- MongoDB（文档型数据库）
- Redis（缓存和会话存储）

### 文件上传

当前上传文件存储在本地 `uploads/` 目录。生产环境建议使用：
- 腾讯云 COS
- 阿里云 OSS
- AWS S3

### AI 生成

`photoController.js` 中的 `_simulateGeneration` 方法是模拟生成过程。实际应用需要对接：
- Stable Diffusion API
- MidJourney API
- 其他 AI 图像生成服务

### 微信登录

当前微信登录是模拟的。实际应用需要：
1. 在 `src/config/index.js` 中配置真实的 AppID 和 AppSecret
2. 在 `userController.js` 中调用微信 API: `https://api.weixin.qq.com/sns/jscode2session`

## 注意事项

1. **JWT 密钥**: 生产环境务必修改 `jwtSecret`
2. **CORS**: 根据需要配置允许的域名
3. **文件上传**: 限制文件大小和类型，防止恶意上传
4. **错误处理**: 生产环境不要返回详细的错误堆栈
5. **日志**: 建议使用 Winston 或其他日志库记录请求日志

## 常见问题

**Q: 如何修改端口？**  
A: 设置环境变量 `PORT=3001` 或修改 `src/config/index.js` 中的 `port` 配置。

**Q: Token 过期怎么办？**  
A: 重新调用登录接口获取新的 Token。

**Q: 如何测试文件上传？**  
A: 使用 Postman 或 curl 的 multipart/form-data 格式上传文件。

## License

ISC
