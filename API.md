# 后端 API 接口文档

## 基础信息

- **Base URL**: `https://your-domain.com/api`
- **请求头**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`

## 响应格式

所有接口统一返回格式：

```json
{
  "code": 0,           // 0或200表示成功，其他表示失败
  "message": "success", // 提示信息
  "data": {}           // 响应数据
}
```

## 用户相关接口

### 1. 用户登录

**接口**: `POST /user/login`

**请求参数**:
```json
{
  "code": "wx_login_code"  // 微信登录凭证
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "userInfo": {
      "id": "user_123",
      "nickname": "用户昵称",
      "avatar": "https://...",
      "points": 10
    }
  }
}
```

### 2. 获取用户积分

**接口**: `GET /user/points`

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "points": 10
  }
}
```

## 照片生成相关接口

### 3. 上传照片

**接口**: `POST /photo/upload`

**请求方式**: `multipart/form-data`

**请求参数**:
- `file`: 图片文件
- `type`: 图片类型（portrait）

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "url": "https://cdn.example.com/photos/abc123.jpg",
    "fileId": "file_abc123"
  }
}
```

### 4. 生成魔法照片

**接口**: `POST /photo/generate`

**请求参数**:
```json
{
  "photoUrl": "https://cdn.example.com/photos/abc123.jpg",
  "prompt": "宇宙星际者古风城小机娘，坐在开满彼岸花的宫殿式花园中，阳光洒落"
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "taskId": "task_xyz789",
    "status": "pending",
    "estimatedTime": 30  // 预计生成时间（秒）
  }
}
```

### 5. 查询生成状态

**接口**: `GET /photo/status`

**请求参数**:
- `taskId`: 任务ID

**响应数据**:

**生成中**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "taskId": "task_xyz789",
    "status": "processing",  // pending/processing/completed/failed
    "progress": 65          // 进度百分比（0-100）
  }
}
```

**生成完成**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "taskId": "task_xyz789",
    "status": "completed",
    "progress": 100,
    "resultUrl": "https://cdn.example.com/results/result_abc123.jpg",
    "thumbnailUrl": "https://cdn.example.com/results/thumb_abc123.jpg"
  }
}
```

**生成失败**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "taskId": "task_xyz789",
    "status": "failed",
    "message": "生成失败原因描述"
  }
}
```

### 6. 获取生成结果

**接口**: `GET /photo/result`

**请求参数**:
- `taskId`: 任务ID

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "taskId": "task_xyz789",
    "resultUrl": "https://cdn.example.com/results/result_abc123.jpg",
    "thumbnailUrl": "https://cdn.example.com/results/thumb_abc123.jpg",
    "prompt": "原始提示词",
    "createTime": "2024-01-01 12:00:00"
  }
}
```

## 作品展厅相关接口

### 7. 获取作品列表

**接口**: `GET /gallery/list`

**请求参数**:
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认10）

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "photo_001",
        "imageUrl": "https://cdn.example.com/results/result_001.jpg",
        "thumbnailUrl": "https://cdn.example.com/results/thumb_001.jpg",
        "prompt": "描述文字",
        "createTime": "2024-01-01 12:00:00"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

### 8. 获取作品详情

**接口**: `GET /gallery/detail`

**请求参数**:
- `id`: 作品ID

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "photo_001",
    "imageUrl": "https://cdn.example.com/results/result_001.jpg",
    "thumbnailUrl": "https://cdn.example.com/results/thumb_001.jpg",
    "originalUrl": "https://cdn.example.com/photos/original_001.jpg",
    "prompt": "描述文字",
    "createTime": "2024-01-01 12:00:00",
    "userId": "user_123"
  }
}
```

## 错误码说明

| 错误码 | 说明 |
|-------|------|
| 0/200 | 成功 |
| 400   | 请求参数错误 |
| 401   | 未授权，需要登录 |
| 403   | 无权限访问 |
| 404   | 资源不存在 |
| 500   | 服务器内部错误 |
| 1001  | 积分不足 |
| 1002  | 文件格式不支持 |
| 1003  | 文件大小超限 |
| 2001  | 生成任务不存在 |
| 2002  | 生成任务已过期 |

## 注意事项

1. 所有接口都需要在请求头中携带 `Authorization` token（除登录接口外）
2. 图片上传限制：
   - 支持格式：jpg, jpeg, png
   - 文件大小：最大 10MB
   - 图片尺寸：建议 1024x1024 以内
3. 生成状态轮询建议：
   - 轮询间隔：2-3秒
   - 最大轮询次数：60次（约2分钟）
   - 超时后提示用户稍后查看结果
4. 响应时间：
   - 普通接口：< 1秒
   - 上传接口：根据文件大小，一般 < 5秒
   - 生成接口：异步处理，立即返回任务ID
   - 状态查询：< 500ms
