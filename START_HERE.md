# 🚀 开始使用 AI Photo Backend

## 项目已完成！✅

恭喜！您的 AI 照片生成后端服务已经完全搭建完成。

## 📋 第一步：安装依赖并启动

打开终端，执行以下命令：

\`\`\`bash
cd /Users/leeven/Desktop/WeChatProjects/AiPhotoBackend

# 方式一：使用启动脚本（推荐）
./start.sh

# 方式二：手动启动
npm install && npm run dev
\`\`\`

看到以下界面表示启动成功：

\`\`\`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║     AI Photo Backend API Server Started! 🚀      ║
║                                                   ║
║     Server running on: http://localhost:3000     ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
\`\`\`

## 🧪 第二步：验证服务

### 快速验证

在浏览器中访问：
- http://localhost:3000/health

应该看到：
\`\`\`json
{
  "status": "ok",
  "timestamp": "2024-..."
}
\`\`\`

### 运行完整测试

**打开新的终端窗口**，运行：

\`\`\`bash
cd /Users/leeven/Desktop/WeChatProjects/AiPhotoBackend
npm test
\`\`\`

测试脚本会自动测试所有 API 接口，包括：
- ✅ 用户登录
- ✅ 获取用户积分
- ✅ 生成魔法照片
- ✅ 查询生成状态
- ✅ 获取生成结果
- ✅ 获取作品列表
- ✅ 获取作品详情

## 📱 第三步：测试 API

### 选项 1: 使用 curl（最快）

\`\`\`bash
# 1. 测试登录
curl -X POST http://localhost:3000/api/user/login \\
  -H "Content-Type: application/json" \\
  -d '{"code":"test_wx_code_123"}'

# 复制返回的 token，然后测试其他接口
# 2. 测试获取积分（替换 YOUR_TOKEN）
curl -X GET http://localhost:3000/api/user/points \\
  -H "Authorization: Bearer YOUR_TOKEN"
\`\`\`

### 选项 2: 使用 Postman（推荐）

1. 打开 Postman
2. 点击 Import
3. 选择 \`postman_collection.json\` 文件
4. 按顺序执行请求（登录会自动保存 Token）

### 选项 3: 快速测试脚本

\`\`\`bash
./quick_test.sh
\`\`\`

## 📖 第四步：了解项目

### 核心文件说明

| 文件 | 说明 |
|------|------|
| \`项目说明.md\` | **最完整的项目文档（推荐阅读）** |
| \`API.md\` | API 接口详细文档 |
| \`README.md\` | 项目说明和技术栈 |
| \`SETUP.md\` | 快速启动指南 |
| \`src/app.js\` | 应用入口文件 |
| \`test/test.js\` | 自动化测试脚本 |

### 项目结构

\`\`\`
src/
├── app.js              # 应用入口
├── config/             # 配置
├── controllers/        # 业务逻辑
│   ├── userController.js
│   ├── photoController.js
│   └── galleryController.js
├── routes/             # 路由定义
├── middleware/         # 中间件
├── models/             # 数据模型
└── utils/              # 工具函数
\`\`\`

## 🎯 典型使用场景

### 场景 1: 测试完整流程

\`\`\`bash
# 1. 启动服务（终端 1）
npm run dev

# 2. 运行测试（终端 2）
npm test
\`\`\`

### 场景 2: 一键启动并测试

\`\`\`bash
./run_all.sh
\`\`\`

这会自动：
1. 安装依赖
2. 启动服务
3. 运行测试
4. 停止服务

### 场景 3: 开发调试

\`\`\`bash
# 启动开发服务器（支持热重载）
npm run dev

# 修改代码后自动重启
# 使用 Postman 或浏览器测试接口
\`\`\`

## 🔥 核心 API 流程

### 完整的照片生成流程

\`\`\`
1. 用户登录
   POST /api/user/login
   → 返回 Token

2. 生成照片
   POST /api/photo/generate
   → 返回 taskId

3. 查询状态（轮询）
   GET /api/photo/status?taskId=xxx
   → status: pending/processing/completed

4. 获取结果
   GET /api/photo/result?taskId=xxx
   → 返回图片 URL

5. 查看展厅
   GET /api/gallery/list
   → 返回作品列表
\`\`\`

## 💡 重要提示

### ✅ 当前已实现
- 所有 API 接口
- JWT 身份认证
- 文件上传功能
- 异步任务模拟
- 完整的测试脚本

### ⚠️ 需要注意
- 当前使用**内存存储**，重启后数据会丢失
- 生成照片是**模拟的**，需要对接真实 AI 服务
- 微信登录是**模拟的**，需要配置真实的 AppID

### 🚀 生产环境需要
1. 连接真实数据库（MySQL/MongoDB）
2. 对接 AI 图像生成服务
3. 配置真实的微信 AppID 和 AppSecret
4. 使用云存储（腾讯云 COS/阿里云 OSS）
5. 修改 JWT 密钥
6. 配置 HTTPS

## 📚 推荐阅读顺序

1. ✅ 本文件（START_HERE.md）- 快速开始
2. 📖 项目说明.md - 完整的项目说明
3. 📄 API.md - API 接口文档
4. 💻 README.md - 技术细节
5. ⚙️ SETUP.md - 配置说明

## 🎉 开始使用

\`\`\`bash
# 1. 安装依赖
npm install

# 2. 启动服务
npm run dev

# 3. 打开新终端，运行测试
npm test

# 4. 开始开发！
\`\`\`

---

## 📞 获取帮助

### 遇到问题？

1. **服务启动失败**
   - 检查 Node.js 是否已安装：\`node --version\`
   - 检查端口 3000 是否被占用：\`lsof -i:3000\`
   - 尝试更换端口：\`PORT=3001 npm run dev\`

2. **测试失败**
   - 确保服务已启动
   - 检查终端输出的错误信息
   - 查看 \`server.log\` 日志文件

3. **依赖安装失败**
   - 清理缓存：\`npm cache clean --force\`
   - 删除 node_modules：\`rm -rf node_modules\`
   - 重新安装：\`npm install\`

### 查看文档

- 完整功能：查看 \`项目说明.md\`
- API 详情：查看 \`API.md\`
- 技术栈：查看 \`README.md\`

---

**祝你开发顺利！🚀**

如果一切正常，你应该已经看到：
- ✅ 服务启动成功
- ✅ 测试全部通过
- ✅ API 正常响应

现在可以开始开发你的前端应用，或者对接微信小程序了！
