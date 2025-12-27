# 🚀 Gemini API 快速开始

## 📌 重要更新

项目已集成 **Google Gemini API** 实现真实的 AI 图像生成！

## ⚡ 快速配置（3 步）

### 1️⃣ 获取 API Key

访问: https://aistudio.google.com/app/apikey
- 登录 Google 账号
- 点击 "Create API Key"
- 复制生成的 API Key

### 2️⃣ 配置项目

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
nano .env
```

添加你的 API Key:
```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 3️⃣ 测试连接

```bash
# 安装依赖（如果还没安装）
npm install

# 测试 Gemini 连接
npm run test:gemini
```

看到 ✓ 表示配置成功！

## 🎯 启动服务

```bash
# 启动开发服务器
npm run dev
```

## 🧪 测试 AI 生成

```bash
# 1. 登录获取 Token
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"code":"test"}'

# 2. 生成图片（替换 YOUR_TOKEN）
curl -X POST http://localhost:3000/api/photo/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "photoUrl": "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg",
    "prompt": "transform into a magical fantasy scene"
  }'
```

## ✅ 工作模式

### 模式一：真实 AI 生成（配置了 API Key）
- ✅ 调用 Gemini/Imagen API
- ✅ 真实图像生成
- ✅ AI 提示词优化

### 模式二：模拟模式（未配置 API Key）
- ✅ 自动回退
- ✅ 返回测试图片
- ✅ 所有接口正常工作

## 📚 更多信息

- 完整配置: [GEMINI_SETUP.md](./GEMINI_SETUP.md)
- 项目文档: [项目说明.md](./项目说明.md)
- API 文档: [API.md](./API.md)

## 💡 提示

- **免费测试**: 可以先不配置 API Key，使用模拟模式测试
- **API 配额**: Gemini API 有免费配额限制
- **生产环境**: 真实部署时需要配置 API Key

---

**就是这么简单！现在开始使用吧！** 🎉
