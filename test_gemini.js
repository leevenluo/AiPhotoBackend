/**
 * 测试 Gemini 图片生成 API
 * 运行: node test_gemini.js
 */

// 加载环境变量
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function testGeminiImageGeneration() {
  console.log('\n' + '='.repeat(60));
  log('测试 Google Gemini 图片生成 API', 'cyan');
  console.log('='.repeat(60) + '\n');

  // 检查 API Key
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your-gemini-api-key') {
    log('⚠️  未配置 Gemini API Key', 'yellow');
    console.log('\n请按以下步骤配置:');
    console.log('1. 访问 https://aistudio.google.com/app/apikey');
    console.log('2. 创建或复制你的 API Key');
    console.log('3. 在 .env 文件中添加: GEMINI_API_KEY=your-api-key');
    console.log('\n详细说明请查看: GEMINI_SETUP.md\n');
    process.exit(1);
  }

  log(`API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`, 'cyan');
  log(`图片生成模型: gemini-2.5-flash-image`, 'cyan');
  console.log('');

  try {
    // 初始化 Gemini AI
    log('正在初始化 Gemini AI...', 'yellow');
    const ai = new GoogleGenAI({
      apiKey: apiKey
    });

    // 测试图片生成
    log('正在生成图片...', 'yellow');
    const prompt = 'Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme';
    
    console.log(`提示词: "${prompt}"`);
    console.log('');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
    });

    log('✓ 图片生成成功！', 'green');
    console.log('');

    // 处理响应
    let imageCount = 0;
    let textContent = '';

    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        textContent += part.text;
      } else if (part.inlineData) {
        imageCount++;
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, 'base64');
        
        // 确保 uploads 目录存在
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // 保存图片
        const filename = `gemini-generated-${Date.now()}.png`;
        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, buffer);
        
        log(`✓ 图片已保存: ${filepath}`, 'green');
      }
    }

    // 显示文本内容（如果有）
    if (textContent) {
      console.log('\nGemini 响应文本:');
      console.log('─'.repeat(60));
      console.log(textContent);
      console.log('─'.repeat(60));
    }

    // 总结
    console.log('\n' + '='.repeat(60));
    log(`✓ 测试完成！成功生成 ${imageCount} 张图片`, 'green');
    console.log('='.repeat(60));
    console.log('\n现在可以启动服务并使用 AI 图片生成功能了！');
    console.log('运行: npm run dev\n');

  } catch (error) {
    console.log('\n' + '='.repeat(60));
    log('✗ 生成失败', 'red');
    console.log('='.repeat(60));
    console.log('\n错误信息:');
    console.log(error.message);
    
    if (error.stack) {
      console.log('\n详细错误:');
      console.log(error.stack);
    }
    
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
    } else if (error.message.includes('location')) {
      console.log('\n可能的原因:');
      console.log('- 当前地理位置不支持 API 访问');
      console.log('\n解决方案:');
      console.log('- 使用 VPN 连接到支持的地区');
      console.log('- 在 .env 中配置代理: HTTP_PROXY 和 HTTPS_PROXY');
    }
    
    console.log('\n详细配置说明请查看: GEMINI_SETUP.md\n');
    process.exit(1);
  }
}

// 运行测试
testGeminiImageGeneration().catch(error => {
  log('✗ 测试脚本执行失败', 'red');
  console.error(error);
  process.exit(1);
});
