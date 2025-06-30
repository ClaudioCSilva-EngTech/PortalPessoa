// src/middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Loga o stack trace do erro para depuração

  // Erros específicos de aplicação ou validação
  if (err.name === 'ValidationError') { // Erros de validação do Mongoose
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors: err.errors // Mongoose envia os detalhes do erro em .errors
    });
  }

  if (err.code === 11000) { // Erro de duplicidade (ex: unique index)
    return res.status(409).json({
      success: false,
      message: 'Duplicidade de dados.',
      field: Object.keys(err.keyValue)[0], // Campo que causou a duplicidade
      value: Object.values(err.keyValue)[0] // Valor duplicado
    });
  }

  // Erros HTTP personalizados (se você criar classes de erro como NotFoundError)
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Erro genérico
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor.'
  });
};

module.exports = errorHandler;