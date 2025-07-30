
const mongoose = require('mongoose');
const feriasApDataSchema = require('./GestaDeFerias');

// Model colaborador baseado no CSV
const colaboradorApDataSchema = new mongoose.Schema({
    id_apdata: { type: String, required: true, unique: true },
    local: { type: String, trim: true, default: 'Grupo Quali' }, 
    nome: { type: String, trim: true },
    nomeCompleto: { type: String, required: true, trim: true },
    idade: { type: Number, trim: true },
    categoria: { type: String, trim: true },
    vinculo: { type: String, trim: true },
    dataAdmissao: { type: String, trim: true },
    cargo: { type: String, trim: true },
    cbo: { type: String, trim: true },
    horario: { type: String, trim: true },
    horasMes: { type: String, trim: true },
    estrutura: { type: String, trim: true },
    centroCusto: { type: String, trim: true },
    sindicato: { type: String, trim: true },
    situacao: { type: String, trim: true },
    dataInicioSituacao: { type: String, trim: true },
    dataRescisao: { type: String, trim: true },
    dataNascimento: { type: String, trim: true },
    nacionalidade: { type: String, trim: true },
    localNascimento: { type: String, trim: true },
    ufNascimento: { type: String, trim: true },
    nomeMae: { type: String, trim: true },
    nomePai: { type: String, trim: true },
    estadoCivil: { type: String, trim: true },
    grauInstrucao: { type: String, trim: true },
    sexo: { type: String, trim: true },
    tipoEndereco: { type: String, trim: true },
    enderecoBase: { type: String, trim: true },
    enderecoNumero: { type: String, trim: true },
    enderecoComplemento: { type: String, trim: true },
    cep: { type: String, trim: true },
    bairro: { type: String, trim: true },
    municipio: { type: String, trim: true },
    estado: { type: String, trim: true },
    telefoneDDD: { type: String, trim: true },
    telefoneNumero: { type: String, trim: true },
    celularDDD: { type: String, trim: true },
    celularNumero: { type: String, trim: true },
    e_mail: { type: String, trim: true },
    banco: { type: String, trim: true },
    agenciaBanco: { type: String, trim: true },
    numeroAgencia: { type: String, trim: true },
    digitoAgencia: { type: String, trim: true },
    numeroConta: { type: String, trim: true },
    digitoConta: { type: String, trim: true },
    meioPagamento: { type: String, trim: true },
    cpf: { type: String, trim: true },
    rg: { type: String, trim: true },
    ufRg: { type: String, trim: true },
    tituloEleitorNumero: { type: String, trim: true },
    tituloEleitorSecao: { type: String, trim: true },
    tituloEleitorZona: { type: String, trim: true },
    ufTitulo: { type: String, trim: true },
    ctpsNumero: { type: String, trim: true },
    ctpsSerie: { type: String, trim: true },
    ufCtps: { type: String, trim: true },
    pis: { type: String, trim: true },
    tempoCasaAnos: { type: String, trim: true },
    tempoCasaMeses: { type: String, trim: true },
    tempoCasaDias: { type: String, trim: true },
    segmentoEtnicoRacial: { type: String, trim: true },
    idHierarquia: { type: String, trim: true },
    hierarquia: { type: String, trim: true },
    dataInclusao: { type: Date, default: Date.now },
    ferias: [feriasApDataSchema], // Férias do colaborador
}, { timestamps: true });

colaboradorApDataSchema.index({ id_apdata: 1 }, { unique: true });
colaboradorApDataSchema.index({ nome: 1 });
colaboradorApDataSchema.index({ local: 1 });
colaboradorApDataSchema.index({ nomeCompleto: 1 });
colaboradorApDataSchema.index({ dataInclusao: -1 });
colaboradorApDataSchema.index({ dataRescisao: 1 });
colaboradorApDataSchema.index({ cargo: 1 });
colaboradorApDataSchema.index({ centroCusto: 1 });

module.exports = mongoose.model('IntegracaoApData', colaboradorApDataSchema);