// src/models/Hierarquia.js
const mongoose = require('mongoose');

const hierarquiaSchema = new mongoose.Schema({
  superintendente: {
    type: String,
    required: true,
    trim: true
  },
  gerente: {
    type: String,
    required: true,
    trim: true
  },
  supervisor: {
    type: String,
    required: true,
    trim: true
  },
  departamento: {
    type: String,
    required: true,
    trim: true
  },
  unidade: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'hierarquia'
});

// Índices para melhor performance
hierarquiaSchema.index({ departamento: 1, unidade: 1 });
hierarquiaSchema.index({ gerente: 1 });
hierarquiaSchema.index({ superintendente: 1 });

module.exports = mongoose.model('Hierarquia', hierarquiaSchema);
