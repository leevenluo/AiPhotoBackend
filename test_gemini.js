/**
 * 测试 Gemini API 连接
 * 运行: node test_gemini.js
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('./src/config');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testGeminiConnection() {
  console.log('\n' + '='.repeat(60));
  log('测试 Google Gemini API 连接', 'cyan');
  console.log('='.repeat(60) + '\n');

  // 检查 API Key
  const apiKey = config.gemini.apiKey;
  
  if (!apiKey || apiKey === 'your-gemini-api-key') {
    log('⚠️  未配置 Gemini API Key', 'yellow');
    console.log('\n请按以下步骤配置:');
    console.log('1. 访问 https://aistudio.google.com/app/apikey');
    console.log('2. 创建或复制你的 API Key');
    console.log('3. 创建 .env 文件并添加: GEMINI_API_KEY=your-api-key');
    console.log('4. 或修改 src/config/index.js 中的 apiKey');
    console.log('\n详细说明请查看: GEMINI_SETUP.md\n');
    process.exit(1);
  }

  log(`API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`, 'cyan');
  log(`模型: ${config.gemini.model}`, 'cyan');
  console.log('');

  try {
    // 初始化 Gemini
    log('正在连接 Gemini API...', 'yellow');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: config.gemini.model });

    // 测试简单的文本生成
    log('测试文本生成功能...', 'yellow');
    const prompt = 'Say "Hello, I am Gemini!" in a friendly way.';
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    log('✓ 连接成功！', 'green');
    console.log('\nGemini 响应:');
    console.log('─'.repeat(60));
    console.log(text);
    console.log('─'.repeat(60));

    // 测试图像描述生成
    console.log('');
    log('测试图像提示词增强...', 'yellow');
    const imagePrompt = 'Enhance this prompt for AI image generation: "a magical forest with glowing trees"';
    const imageResult = await model.generateContent(imagePrompt);
    const imageResponse = await imageResult.response;
    const imageText = imageResponse.text();

    log('✓ 提示词增强成功！', 'green');
    console.log('\n增强后的提示词:');
    console.log('─'.repeat(60));
    console.log(imageText);
    console.log('─'.repeat(60));

    // 总结
    console.log('\n' + '='.repeat(60));
    log('✓ 所有测试通过！Gemini API 配置正确', 'green');
    console.log('='.repeat(60));
    console.log('\n现在可以启动服务并使用 AI 生成功能了！');
    console.log('运行: npm run dev\n');

  } catch (error) {
    console.log('\n' + '='.repeat(60));
    log('✗ 连接失败', 'red');
    console.log('='.repeat(60));
    console.log('\n错误信息:');
    console.log(error.message);
    
    if (error.message.includes('API key not valid')) {
      console.log('\n可能的原因:');
      console.log('1. API Key 不正确');
      console.log('2. API Key 已过期');
      console.log('3. API Key 权限不足');
      console.log('\n解决方案:');
      console.log('- 在 Google AI Studio 重新生成 API Key');
      console.log('- 确认复制的 API Key 完整无误');
    } else if (error.message.includes('quota')) {
      console.log('\n可能的原因:');
      console.log('- API 调用次数超过限额');
      console.log('\n解决方案:');
      console.log('- 等待配额重置');
      console.log('- 升级到付费计划');
    }
    
    console.log('\n详细配置说明请查看: GEMINI_SETUP.md\n');
    process.exit(1);
  }
}

// 运行测试
testGeminiConnection().catch(error => {
  log('✗ 测试脚本执行失败', 'red');
  console.error(error);
  process.exit(1);
});
