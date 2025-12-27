/**
 * 统一响应格式
 */
class Response {
  static success(data = null, message = 'success') {
    return {
      code: 0,
      message,
      data
    };
  }

  static error(code, message, data = null) {
    return {
      code,
      message,
      data
    };
  }
}

module.exports = Response;
