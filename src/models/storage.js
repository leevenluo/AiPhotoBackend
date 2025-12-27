/**
 * 简单的内存数据存储（生产环境应使用数据库）
 */
class Storage {
  constructor() {
    // 用户数据
    this.users = new Map();
    
    // 照片生成任务
    this.tasks = new Map();
    
    // 作品展厅
    this.gallery = [];
    
    // 初始化一些测试数据
    this._initTestData();
  }

  _initTestData() {
    // 添加测试用户
    this.users.set('test_user_001', {
      id: 'test_user_001',
      nickname: '测试用户',
      avatar: 'https://cdn.example.com/avatar/default.jpg',
      points: 10,
      openid: 'test_openid_001'
    });

    // 添加测试作品
    for (let i = 1; i <= 20; i++) {
      this.gallery.push({
        id: `photo_${String(i).padStart(3, '0')}`,
        imageUrl: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg',
        thumbnailUrl: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg',
        originalUrl: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg',
        prompt: `测试提示词 ${i}`,
        createTime: new Date(Date.now() - i * 86400000).toISOString().replace('T', ' ').split('.')[0],
        userId: 'test_user_001'
      });
    }
  }

  // 用户相关
  getUserByOpenid(openid) {
    for (const user of this.users.values()) {
      if (user.openid === openid) {
        return user;
      }
    }
    return null;
  }

  getUserById(userId) {
    return this.users.get(userId);
  }

  createUser(userData) {
    this.users.set(userData.id, userData);
    return userData;
  }

  updateUserPoints(userId, points) {
    const user = this.users.get(userId);
    if (user) {
      user.points = points;
      return user;
    }
    return null;
  }

  // 任务相关
  createTask(taskData) {
    this.tasks.set(taskData.taskId, taskData);
    return taskData;
  }

  getTask(taskId) {
    return this.tasks.get(taskId);
  }

  updateTask(taskId, updates) {
    const task = this.tasks.get(taskId);
    if (task) {
      Object.assign(task, updates);
      return task;
    }
    return null;
  }

  // 作品展厅相关
  getGalleryList(page = 1, pageSize = 10) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      list: this.gallery.slice(start, end),
      total: this.gallery.length,
      page,
      pageSize
    };
  }

  getGalleryDetail(id) {
    return this.gallery.find(item => item.id === id);
  }

  addToGallery(item) {
    this.gallery.unshift(item);
    return item;
  }
}

// 单例模式
module.exports = new Storage();
