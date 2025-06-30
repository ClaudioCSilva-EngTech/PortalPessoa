const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    id_apdata: {type: String, required: true, unique: true },
    nome: { type: String, required: true, unique: true },
    setor: { type: String, required: true, unique: true },
    e_mail: { type: String, required: true, unique: true },
    cargo: { type: String, default: null },
    nivel_hierarquia: { type: Number, required: true, unique: true } //Candidato_interno: 1, Candidato_externo: 2, Assistente: 10, Coordenador: 11, Gerente: 20, Superintendete: 30, Diretor: 40
},{timestamps: true });

usuarioSchema.index({ "e_mail": 1, "setor": 1 });

module.exports = mongoose.model("Usuario", usuarioSchema);