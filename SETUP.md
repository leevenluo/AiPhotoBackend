# 快速启动指南

## 方法一：使用启动脚本（推荐）

### 1. 赋予脚本执行权限
```bash
chmod +x start.sh
```

### 2. 运行启动脚本
```bash
./start.sh
```

脚本会自动：
- ✅ 检查 Node.js 环境
- ✅ 安装项目依赖
- ✅ 启动开发服务器

---

## 方法二：手动启动

### 1. 安装依赖
```bash
npm install
```

### 2. 启动服务

**开发模式**（支持自动重启）：
```bash
npm run dev
```

**生产模式**：
```bash
npm start
```

---

## 验证服务

服务启动后，访问：
- **健康检查**: http://localhost:3000/health
- **首页**: http://localhost:3000/

看到响应表示服务启动成功！

---

## 测试 API

### 1. 启动服务（在一个终端窗口）
```bash
npm run dev
```

### 2. 运行测试（在另一个终端窗口）
```bash
npm test
```

测试脚本会自动测试所有 API 接口。

---

## 手动测试示例

### 1. 用户登录
```bash
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"code":"test_wx_code_123"}'
```

会返回：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGc...",
    "userInfo": {...}
  }
}
```

### 2. 使用 Token 访问其他接口
复制上一步返回的 token，替换下面的 `YOUR_TOKEN`：

```bash
curl -X GET http://localhost:3000/api/user/points \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 使用 Postman 测试

推荐使用 Postman 进行 API 测试，导入以下环境变量：

- `baseUrl`: http://localhost:3000/api
- `token`: 从登录接口获取

### 测试流程
1. POST `/api/user/login` - 获取 token
2. GET `/api/user/points` - 验证 token
3. POST `/api/photo/generate` - 创建生成任务
4. GET `/api/photo/status?taskId=xxx` - 轮询状态
5. GET `/api/photo/result?taskId=xxx` - 获取结果
6. GET `/api/gallery/list` - 查看作品列表

---

## 常见问题

### Q: npm install 失败？
**A**: 尝试以下方法：
```bash
# 清理缓存
npm cache clean --force

# 使用淘宝镜像
npm install --registry=https://registry.npmmirror.com
```

### Q: 端口被占用？
**A**: 修改端口：
```bash
# 临时修改
PORT=3001 npm run dev

# 或修改 src/config/index.js 中的 port 配置
```

### Q: EACCES 权限错误？
**A**: 
```bash
# macOS/Linux
sudo chown -R $USER node_modules
```

---

## 推荐工具

- **API 测试**: Postman, Insomnia
- **代码编辑**: VS Code
- **终端工具**: iTerm2 (macOS), Windows Terminal

---

## 下一步

✅ 服务启动成功后，可以：

1. 查看 [API.md](./API.md) 了解完整接口文档
2. 查看 [README.md](./README.md) 了解项目详情
3. 运行 `npm test` 测试所有接口
4. 对接前端应用

祝开发顺利！🚀
