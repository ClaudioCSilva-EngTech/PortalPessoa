// src/utils/ApiResponse.js
class ApiResponse {
  static success(res, statusCode, message, data = {}) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res, statusCode, message, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  static notFound(res, message = 'Recurso não encontrado.') {
    return res.status(404).json({
      success: false,
      message,
    });
  }

  static Unauthorized(res, message) {
    return res.status(401).json({
      success: false,
      message,
    });
  }

  static badRequest(res, message = 'Requisição inválida.') {
    return res.status(400).json({
      success: false,
      message,
    });
  }

  // Você pode adicionar mais métodos para diferentes tipos de respostas
}

module.exports = ApiResponse;