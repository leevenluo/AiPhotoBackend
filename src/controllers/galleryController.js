const Response = require('../utils/response');
const storage = require('../models/storage');

/**
 * 作品展厅控制器
 */
class GalleryController {
  /**
   * 获取作品列表
   * GET /api/gallery/list
   */
  async getList(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;

      if (page < 1 || pageSize < 1 || pageSize > 100) {
        return res.status(400).json(Response.error(400, '分页参数错误'));
      }

      const result = storage.getGalleryList(page, pageSize);

      res.json(Response.success(result));
    } catch (error) {
      console.error('Get gallery list error:', error);
      res.status(500).json(Response.error(500, '获取作品列表失败'));
    }
  }

  /**
   * 获取作品详情
   * GET /api/gallery/detail
   */
  async getDetail(req, res) {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json(Response.error(400, '缺少作品ID'));
      }

      const detail = storage.getGalleryDetail(id);

      if (!detail) {
        return res.status(404).json(Response.error(404, '作品不存在'));
      }

      res.json(Response.success(detail));
    } catch (error) {
      console.error('Get gallery detail error:', error);
      res.status(500).json(Response.error(500, '获取作品详情失败'));
    }
  }
}

module.exports = new GalleryController();
