/**
 * API 测试脚本
 * 运行: node test/test.js
 */

const baseUrl = 'http://localhost:3000/api';
let token = '';
let taskId = '';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

async function request(method, path, data = null, useToken = false) {
  const url = `${baseUrl}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (useToken && token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  if (method === 'GET' && data) {
    const params = new URLSearchParams(data);
    return fetch(`${url}?${params}`, options);
  }

  return fetch(url, options);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 测试用例
async function test1_userLogin() {
  logSection('测试 1: 用户登录');
  
  try {
    const response = await request('POST', '/user/login', {
      code: 'test_wx_code_123'
    });
    
    const result = await response.json();
    
    if (result.code === 0 && result.data.token) {
      token = result.data.token;
      log('✓ 登录成功', 'green');
      console.log('Token:', token.substring(0, 30) + '...');
      console.log('用户信息:', result.data.userInfo);
      return true;
    } else {
      log('✗ 登录失败', 'red');
      console.log(result);
      return false;
    }
  } catch (error) {
    log('✗ 请求失败: ' + error.message, 'red');
    return false;
  }
}

async function test2_getUserPoints() {
  logSection('测试 2: 获取用户积分');
  
  try {
    const response = await request('GET', '/user/points', null, true);
    const result = await response.json();
    
    if (result.code === 0) {
      log('✓ 获取积分成功', 'green');
      console.log('当前积分:', result.data.points);
      return true;
    } else {
      log('✗ 获取积分失败', 'red');
      console.log(result);
      return false;
    }
  } catch (error) {
    log('✗ 请求失败: ' + error.message, 'red');
    return false;
  }
}

async function test3_generatePhoto() {
  logSection('测试 3: 生成魔法照片');
  
  try {
    const response = await request('POST', '/photo/generate', {
      photoUrl: 'https://cdn.example.com/photos/test123.jpg',
      prompt: '宇宙星际者古风城小机娘，坐在开满彼岸花的宫殿式花园中，阳光洒落'
    }, true);
    
    const result = await response.json();
    
    if (result.code === 0 && result.data.taskId) {
      taskId = result.data.taskId;
      log('✓ 生成任务创建成功', 'green');
      console.log('任务ID:', taskId);
      console.log('预计时间:', result.data.estimatedTime, '秒');
      return true;
    } else {
      log('✗ 创建任务失败', 'red');
      console.log(result);
      return false;
    }
  } catch (error) {
    log('✗ 请求失败: ' + error.message, 'red');
    return false;
  }
}

async function test4_checkStatus() {
  logSection('测试 4: 查询生成状态（轮询）');
  
  let attempts = 0;
  const maxAttempts = 20;
  
  while (attempts < maxAttempts) {
    try {
      attempts++;
      log(`第 ${attempts} 次查询...`, 'yellow');
      
      const response = await request('GET', '/photo/status', { taskId }, true);
      const result = await response.json();
      
      if (result.code === 0) {
        const { status, progress } = result.data;
        console.log(`状态: ${status}, 进度: ${progress}%`);
        
        if (status === 'completed') {
          log('✓ 生成完成！', 'green');
          console.log('结果URL:', result.data.resultUrl);
          console.log('缩略图URL:', result.data.thumbnailUrl);
          return true;
        } else if (status === 'failed') {
          log('✗ 生成失败', 'red');
          console.log('失败原因:', result.data.message);
          return false;
        }
        
        // 等待 2 秒后继续查询
        await sleep(2000);
      } else {
        log('✗ 查询失败', 'red');
        console.log(result);
        return false;
      }
    } catch (error) {
      log('✗ 请求失败: ' + error.message, 'red');
      return false;
    }
  }
  
  log('✗ 查询超时', 'red');
  return false;
}

async function test5_getResult() {
  logSection('测试 5: 获取生成结果');
  
  try {
    const response = await request('GET', '/photo/result', { taskId }, true);
    const result = await response.json();
    
    if (result.code === 0) {
      log('✓ 获取结果成功', 'green');
      console.log('结果详情:', result.data);
      return true;
    } else {
      log('✗ 获取结果失败', 'red');
      console.log(result);
      return false;
    }
  } catch (error) {
    log('✗ 请求失败: ' + error.message, 'red');
    return false;
  }
}

async function test6_getGalleryList() {
  logSection('测试 6: 获取作品列表');
  
  try {
    const response = await request('GET', '/gallery/list', {
      page: 1,
      pageSize: 5
    }, true);
    
    const result = await response.json();
    
    if (result.code === 0) {
      log('✓ 获取列表成功', 'green');
      console.log(`总数: ${result.data.total}, 当前页: ${result.data.page}/${Math.ceil(result.data.total / result.data.pageSize)}`);
      console.log(`作品数量: ${result.data.list.length}`);
      if (result.data.list.length > 0) {
        console.log('第一个作品:', result.data.list[0]);
      }
      return true;
    } else {
      log('✗ 获取列表失败', 'red');
      console.log(result);
      return false;
    }
  } catch (error) {
    log('✗ 请求失败: ' + error.message, 'red');
    return false;
  }
}

async function test7_getGalleryDetail() {
  logSection('测试 7: 获取作品详情');
  
  try {
    const response = await request('GET', '/gallery/detail', {
      id: 'photo_001'
    }, true);
    
    const result = await response.json();
    
    if (result.code === 0) {
      log('✓ 获取详情成功', 'green');
      console.log('作品详情:', result.data);
      return true;
    } else {
      log('✗ 获取详情失败', 'red');
      console.log(result);
      return false;
    }
  } catch (error) {
    log('✗ 请求失败: ' + error.message, 'red');
    return false;
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('\n');
  log('╔═══════════════════════════════════════════════════╗', 'blue');
  log('║                                                   ║', 'blue');
  log('║         AI Photo Backend API 测试开始            ║', 'blue');
  log('║                                                   ║', 'blue');
  log('╚═══════════════════════════════════════════════════╝', 'blue');
  
  const tests = [
    { name: '用户登录', fn: test1_userLogin },
    { name: '获取用户积分', fn: test2_getUserPoints },
    { name: '生成魔法照片', fn: test3_generatePhoto },
    { name: '查询生成状态', fn: test4_checkStatus },
    { name: '获取生成结果', fn: test5_getResult },
    { name: '获取作品列表', fn: test6_getGalleryList },
    { name: '获取作品详情', fn: test7_getGalleryDetail }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await test.fn();
    results.push({ name: test.name, passed: result });
    await sleep(500);
  }
  
  // 输出测试总结
  logSection('测试总结');
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const icon = result.passed ? '✓' : '✗';
    const color = result.passed ? 'green' : 'red';
    log(`${icon} ${result.name}`, color);
  });
  
  console.log('\n' + '='.repeat(60));
  if (passed === total) {
    log(`所有测试通过! (${passed}/${total})`, 'green');
  } else {
    log(`部分测试失败 (${passed}/${total})`, 'yellow');
  }
  console.log('='.repeat(60) + '\n');
}

// 检查服务器是否启动
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/health');
    if (response.ok) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
}

// 主函数
async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    log('错误: 服务器未启动！', 'red');
    log('请先运行: npm run dev 或 npm start', 'yellow');
    process.exit(1);
  }
  
  await runAllTests();
}

main();
