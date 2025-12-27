#!/bin/bash

# 快速测试脚本 - 单独测试各个接口

baseUrl="http://localhost:3000/api"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================"
echo "AI Photo Backend 快速测试"
echo "================================"
echo ""

# 检查服务是否启动
echo "检查服务状态..."
if ! curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${RED}❌ 服务未启动！${NC}"
    echo "请先运行: npm run dev"
    exit 1
fi
echo -e "${GREEN}✓ 服务正常运行${NC}"
echo ""

# 1. 测试用户登录
echo "1. 测试用户登录..."
response=$(curl -s -X POST $baseUrl/user/login \
  -H "Content-Type: application/json" \
  -d '{"code":"test_wx_code_123"}')

echo "响应: $response"

# 提取 token
token=$(echo $response | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$token" ]; then
    echo -e "${RED}❌ 登录失败，无法获取 token${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 登录成功${NC}"
echo "Token: ${token:0:30}..."
echo ""

# 2. 测试获取积分
echo "2. 测试获取用户积分..."
response=$(curl -s -X GET $baseUrl/user/points \
  -H "Authorization: Bearer $token")

echo "响应: $response"
echo ""

# 3. 测试生成照片
echo "3. 测试生成魔法照片..."
response=$(curl -s -X POST $baseUrl/photo/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $token" \
  -d '{"photoUrl":"https://cdn.example.com/photos/test.jpg","prompt":"测试提示词"}')

echo "响应: $response"

# 提取 taskId
taskId=$(echo $response | grep -o '"taskId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$taskId" ]; then
    echo -e "${RED}❌ 生成任务创建失败${NC}"
else
    echo -e "${GREEN}✓ 任务创建成功${NC}"
    echo "TaskId: $taskId"
    echo ""
    
    # 4. 测试查询状态
    echo "4. 测试查询生成状态（等待 3 秒）..."
    sleep 3
    response=$(curl -s -X GET "$baseUrl/photo/status?taskId=$taskId" \
      -H "Authorization: Bearer $token")
    
    echo "响应: $response"
    echo ""
fi

# 5. 测试作品列表
echo "5. 测试获取作品列表..."
response=$(curl -s -X GET "$baseUrl/gallery/list?page=1&pageSize=5" \
  -H "Authorization: Bearer $token")

echo "响应: $response"
echo ""

# 6. 测试作品详情
echo "6. 测试获取作品详情..."
response=$(curl -s -X GET "$baseUrl/gallery/detail?id=photo_001" \
  -H "Authorization: Bearer $token")

echo "响应: $response"
echo ""

echo "================================"
echo -e "${GREEN}快速测试完成！${NC}"
echo "运行完整测试: npm test"
echo "================================"
