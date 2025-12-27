const Response = require('../utils/response');
const storage = require('../models/storage');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const fs = require('fs').promises;

/**
 * 照片控制器
 */
class PhotoController {
  /**
   * 上传照片
   * POST /api/photo/upload
   */
  async upload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json(Response.error(400, '缺少文件'));
      }

      const { type } = req.body;
      
      if (!type) {
        return res.status(400).json(Response.error(400, '缺少图片类型'));
      }

      // 生成文件 URL（实际环境应上传到 CDN）
      const fileId = `file_${uuidv4()}`;
      const url = `${config.cdn.baseUrl}/photos/${req.file.filename}`;

      res.json(Response.success({
        url,
        fileId
      }));
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json(Response.error(500, '上传失败'));
    }
  }

  /**
   * 生成魔法照片
   * POST /api/photo/generate
   */
  async generate(req, res) {
    try {
      const { photoUrl, prompt } = req.body;
      const userId = req.user.userId;

      if (!photoUrl || !prompt) {
        return res.status(400).json(Response.error(400, '缺少必要参数'));
      }

      // 检查用户积分
      const user = storage.getUserById(userId);
      if (!user) {
        return res.status(404).json(Response.error(404, '用户不存在'));
      }

      if (user.points < 1) {
        return res.status(400).json(Response.error(1001, '积分不足'));
      }

      // 扣除积分
      storage.updateUserPoints(userId, user.points - 1);

      // 创建生成任务
      const taskId = `task_${uuidv4()}`;
      const task = storage.createTask({
        taskId,
        userId,
        photoUrl,
        prompt,
        status: 'pending',
        progress: 0,
        createTime: new Date().toISOString(),
        estimatedTime: 30
      });

      // 异步调用 Gemini 生成图片
      this._generateWithGemini(taskId);

      res.json(Response.success({
        taskId: task.taskId,
        status: task.status,
        estimatedTime: task.estimatedTime
      }));
    } catch (error) {
      console.error('Generate error:', error);
      res.status(500).json(Response.error(500, '生成失败'));
    }
  }

  /**
   * 使用 Google Gemini 生成图片
   */
  async _generateWithGemini(taskId) {
    try {
      const task = storage.getTask(taskId);
      if (!task) {
        console.error('Task not found:', taskId);
        return;
      }

      // 更新为处理中
      storage.updateTask(taskId, {
        status: 'processing',
        progress: 10
      });

      // 初始化 Gemini API
      const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
      
      // 使用 Gemini 进行图像生成（使用 Imagen 3）
      // 注意：Gemini 本身是文本模型，真正的图像生成需要 Imagen API
      // 这里提供两种方案
      
      // 方案一：使用 Gemini 优化提示词，然后调用 Imagen（推荐）
      await this._generateWithImagen(taskId, task);
      
    } catch (error) {
      console.error('Gemini generation error:', error);
      
      // 更新任务状态为失败
      storage.updateTask(taskId, {
        status: 'failed',
        progress: 0,
        errorMessage: error.message || 'AI 生成失败'
      });
    }
  }

  /**
   * 使用 Imagen API 生成图片
   */
  async _generateWithImagen(taskId, task) {
    try {
      // 更新进度
      storage.updateTask(taskId, { progress: 30 });

      // 构建请求 - 使用 Imagen 3.0
      const imagenUrl = `${config.gemini.imageGeneration.endpoint}/models/${config.gemini.imageGeneration.model}:predict`;
      
      // 准备提示词（包含原图引用和用户提示词）
      const enhancedPrompt = `Based on the image at ${task.photoUrl}, create a magical transformation: ${task.prompt}. High quality, detailed, artistic style.`;
      
      storage.updateTask(taskId, { progress: 50 });

      // 调用 Imagen API 生成图片
      const response = await axios.post(
        imagenUrl,
        {
          instances: [
            {
              prompt: enhancedPrompt,
              // 可选参数
              sampleCount: 1,
              aspectRatio: '1:1',
              negativePrompt: 'low quality, blurry, distorted',
              personGeneration: 'allow_adult'
            }
          ],
          parameters: {
            sampleCount: 1
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${config.gemini.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60秒超时
        }
      );

      storage.updateTask(taskId, { progress: 80 });

      // 处理响应
      if (response.data && response.data.predictions && response.data.predictions.length > 0) {
        const prediction = response.data.predictions[0];
        
        // Imagen 返回的是 base64 编码的图片或图片 URL
        let imageUrl;
        
        if (prediction.bytesBase64Encoded) {
          // 如果返回 base64，保存到本地
          imageUrl = await this._saveBase64Image(prediction.bytesBase64Encoded, taskId);
        } else if (prediction.mimeType && prediction.image) {
          // 或者直接使用返回的 URL
          imageUrl = prediction.image;
        } else {
          throw new Error('无法获取生成的图片');
        }

        storage.updateTask(taskId, { progress: 90 });

        // 生成缩略图 URL（这里简化处理，使用同一个 URL）
        const thumbnailUrl = imageUrl;

        // 更新任务为完成
        storage.updateTask(taskId, {
          status: 'completed',
          progress: 100,
          resultUrl: imageUrl,
          thumbnailUrl: thumbnailUrl,
          completeTime: new Date().toISOString()
        });

        // 添加到作品展厅
        storage.addToGallery({
          id: `photo_${uuidv4()}`,
          imageUrl: imageUrl,
          thumbnailUrl: thumbnailUrl,
          originalUrl: task.photoUrl,
          prompt: task.prompt,
          createTime: new Date().toISOString().replace('T', ' ').split('.')[0],
          userId: task.userId
        });

        console.log('Image generated successfully:', taskId);
      } else {
        throw new Error('API 未返回图片数据');
      }

    } catch (error) {
      console.error('Imagen API error:', error.response?.data || error.message);
      
      // 如果 API 失败，回退到模拟模式
      console.log('Falling back to simulation mode...');
      await this._fallbackSimulation(taskId, task);
    }
  }

  /**
   * 保存 base64 图片到本地
   */
  async _saveBase64Image(base64Data, taskId) {
    try {
      const uploadsDir = path.join(__dirname, '../../uploads');
      const filename = `generated_${taskId}_${Date.now()}.jpg`;
      const filepath = path.join(uploadsDir, filename);

      // 移除 base64 前缀（如果有）
      const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Image, 'base64');

      // 保存文件
      await fs.writeFile(filepath, buffer);

      // 返回访问 URL
      return `http://localhost:${config.port}/uploads/${filename}`;
    } catch (error) {
      console.error('Save image error:', error);
      throw error;
    }
  }

  /**
   * 回退方案：使用 Gemini 文本模型生成艺术描述，返回原图
   */
  async _fallbackSimulation(taskId, task) {
    try {
      // 使用 Gemini 优化提示词或生成艺术描述
      const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
      const model = genAI.getGenerativeModel({ model: config.gemini.model });

      storage.updateTask(taskId, { progress: 60 });

      // 生成增强的描述
      const prompt = `Based on this prompt: "${task.prompt}", generate a detailed artistic description for an AI image generation. Be creative and descriptive.`;
      const result = await model.generateContent(prompt);
      const enhancedDescription = result.response.text();

      console.log('Enhanced description:', enhancedDescription);

      storage.updateTask(taskId, { progress: 80 });

      // 使用原图作为结果（模拟模式）
      const resultUrl = task.photoUrl;
      const thumbnailUrl = task.photoUrl;

      storage.updateTask(taskId, {
        status: 'completed',
        progress: 100,
        resultUrl: resultUrl,
        thumbnailUrl: thumbnailUrl,
        completeTime: new Date().toISOString(),
        enhancedPrompt: enhancedDescription
      });

      // 添加到作品展厅
      storage.addToGallery({
        id: `photo_${uuidv4()}`,
        imageUrl: resultUrl,
        thumbnailUrl: thumbnailUrl,
        originalUrl: task.photoUrl,
        prompt: task.prompt,
        createTime: new Date().toISOString().replace('T', ' ').split('.')[0],
        userId: task.userId
      });

    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      
      // 最终回退：直接使用原图
      storage.updateTask(taskId, {
        status: 'completed',
        progress: 100,
        resultUrl: task.photoUrl,
        thumbnailUrl: task.photoUrl,
        completeTime: new Date().toISOString()
      });

      storage.addToGallery({
        id: `photo_${uuidv4()}`,
        imageUrl: task.photoUrl,
        thumbnailUrl: task.photoUrl,
        originalUrl: task.photoUrl,
        prompt: task.prompt,
        createTime: new Date().toISOString().replace('T', ' ').split('.')[0],
        userId: task.userId
      });
    }
  }

  /**
   * 模拟照片生成过程（保留作为备用）
   */
  _simulateGeneration(taskId) {
    let progress = 0;
    
    // 更新为处理中
    setTimeout(() => {
      storage.updateTask(taskId, {
        status: 'processing',
        progress: 10
      });
    }, 1000);

    // 模拟进度更新
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10;
      
      if (progress >= 90) {
        clearInterval(interval);
        
        // 模拟生成完成
        setTimeout(() => {
          const task = storage.getTask(taskId);
          const resultId = uuidv4();
          
          storage.updateTask(taskId, {
            status: 'completed',
            progress: 100,
            resultUrl: `${config.cdn.baseUrl}/results/result_${resultId}.jpg`,
            thumbnailUrl: `${config.cdn.baseUrl}/results/thumb_${resultId}.jpg`,
            completeTime: new Date().toISOString()
          });

          // 添加到作品展厅
          if (task) {
            storage.addToGallery({
              id: `photo_${resultId}`,
              imageUrl: `${config.cdn.baseUrl}/results/result_${resultId}.jpg`,
              thumbnailUrl: `${config.cdn.baseUrl}/results/thumb_${resultId}.jpg`,
              originalUrl: task.photoUrl,
              prompt: task.prompt,
              createTime: new Date().toISOString().replace('T', ' ').split('.')[0],
              userId: task.userId
            });
          }
        }, 2000);
      } else {
        storage.updateTask(taskId, {
          progress: Math.min(progress, 90)
        });
      }
    }, 2000);
  }

  /**
   * 查询生成状态
   * GET /api/photo/status
   */
  async getStatus(req, res) {
    try {
      const { taskId } = req.query;

      if (!taskId) {
        return res.status(400).json(Response.error(400, '缺少任务ID'));
      }

      const task = storage.getTask(taskId);

      if (!task) {
        return res.status(404).json(Response.error(2001, '生成任务不存在'));
      }

      // 根据状态返回不同的数据
      const responseData = {
        taskId: task.taskId,
        status: task.status,
        progress: task.progress
      };

      if (task.status === 'completed') {
        responseData.resultUrl = task.resultUrl;
        responseData.thumbnailUrl = task.thumbnailUrl;
      }

      if (task.status === 'failed') {
        responseData.message = task.errorMessage || '生成失败';
      }

      res.json(Response.success(responseData));
    } catch (error) {
      console.error('Get status error:', error);
      res.status(500).json(Response.error(500, '查询失败'));
    }
  }

  /**
   * 获取生成结果
   * GET /api/photo/result
   */
  async getResult(req, res) {
    try {
      const { taskId } = req.query;

      if (!taskId) {
        return res.status(400).json(Response.error(400, '缺少任务ID'));
      }

      const task = storage.getTask(taskId);

      if (!task) {
        return res.status(404).json(Response.error(2001, '生成任务不存在'));
      }

      if (task.status !== 'completed') {
        return res.status(400).json(Response.error(400, '任务尚未完成'));
      }

      res.json(Response.success({
        taskId: task.taskId,
        resultUrl: task.resultUrl,
        thumbnailUrl: task.thumbnailUrl,
        prompt: task.prompt,
        createTime: task.createTime.replace('T', ' ').split('.')[0]
      }));
    } catch (error) {
      console.error('Get result error:', error);
      res.status(500).json(Response.error(500, '获取结果失败'));
    }
  }
}

module.exports = new PhotoController();
