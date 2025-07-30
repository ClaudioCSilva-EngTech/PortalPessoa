
const mongoose = require('mongoose');

const feriasApDataSchema = new mongoose.Schema({
    id_apdata: { type: String, required: true },
    data_inicio: { type: String, required: true },
    data_fim: { type: String, required: true },
    aprovador: { type: String, required: true },
    data_solicitacao: { type: String, required: true },
    data_aprovacao: { type: String },
    status: { type: String, required: true, enum: ['Pendente', 'Aprovado', 'Rejeitado'] },
}, { _id: false, timestamps: true });

feriasApDataSchema.index({ id_apdata: 1, status: 1 });
feriasApDataSchema.index({ id_apdata: 1, aprovador: 1 });
feriasApDataSchema.index({ id_apdata: 1 });
feriasApDataSchema.index({ data_inicio: -1 });
feriasApDataSchema.index({ data_fim: 1 });
feriasApDataSchema.index({ aprovador: 1 });

module.exports = feriasApDataSchema;