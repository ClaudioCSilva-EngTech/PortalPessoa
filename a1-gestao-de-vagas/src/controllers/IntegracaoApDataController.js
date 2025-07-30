const IntegracaoApData = require('../models/IntegracaoApData');
const ApiResponse = require('../utils/ApiResponse');
const MailService = require('../services/MailService');
const csv = require('csv-parse');
const fs = require('fs');
const path = require('path');
let Desligado;
try {
    Desligado = require('../models/Desligado');
} catch (e) {
    Desligado = null;
}

class IntegracaoApDataController {
    constructor() {
        // Mapeamento de campos para importação/preview
        this.keyMap = {
            vinculo: 'Vínculo',
            setor: 'Centro de Custo',
            // ...adicione outros mapeamentos se necessário...
        };
    }

    getField(record, ...keys) {
        for (const key of keys) {
            if (record[key] !== undefined) return record[key];
            if (this.keyMap[key] && record[this.keyMap[key]] !== undefined) return record[this.keyMap[key]];
        }
        return '';
    }

    /**
      * Buscar colaboradores por estrutura, removendo superintendente se usuário for gerente e gerente se usuário for supervisor
      * GET /colaboradores/estrutura/:estrutura?role=gerente|supervisor&id_apdata=xxx
      */
    async buscarColaboradoresPorEstrutura(req, res, next) {
        try {
            const { estrutura } = req.params;
            const { role, id_apdata } = req.query;
            if (!estrutura) {
                return res.status(400).json({ message: 'Estrutura não informada.' });
            }
            // Buscar todos os colaboradores da estrutura
            const colaboradores = await IntegracaoApData.find({ estrutura });
            let filtrados = colaboradores;
            if (role === 'gerente') {
                // Remove superintendente
                filtrados = colaboradores.filter(c => c.cargo.toLowerCase() !== 'superintendente');
            } else if (role === 'supervisor') {
                // Remove gerente
                filtrados = colaboradores.filter(c => c.cargo.toLowerCase() !== 'gerente');
            }
            // Retorna lista
            return res.status(200).json({ colaboradoresList: filtrados });
        } catch (error) {
            next(error);
        }
    }
    /**
     * Listar colaboradores por ID do gestor
     */
    async listarColaboradoresPorIdGestor(req, res, next) {
        try {
            const { id_apdata } = req.params;
            // Supondo que o campo 'supervisor' ou 'gerente' seja o id_apdata do gestor
            const colaboradores = await require('../services/IntegracaoApDataService').buscarColaboradores({
                $or: [
                    { 'colaboradores.supervisor': id_apdata },
                    { 'colaboradores.gerente': id_apdata }
                ]
            });
            return res.status(200).json(colaboradores);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Buscar colaborador por id_apdata
     */
    async buscarColaboradorPorId(req, res, next) {
        try {
            const { id_apdata } = req.params;
            const colaborador = await require('../services/IntegracaoApDataService').buscarColaboradorPorId(id_apdata);
            if (!colaborador) {
                return res.status(404).json({ message: 'Colaborador não encontrado.' });
            }
            return res.status(200).json(colaborador);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Deletar colaborador por id_apdata
     */
    async deletarColaborador(req, res, next) {
        try {
            const { id_apdata } = req.params;
            await require('../services/IntegracaoApDataService').deletarColaborador(id_apdata);
            return res.status(200).json({ message: 'Colaborador deletado com sucesso.' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Atualizar colaborador por id_apdata
     */
    async atualizarColaborador(req, res, next) {
        try {
            const { id_apdata } = req.params;
            const dadosAtualizacao = req.body;
            const result = await require('../services/IntegracaoApDataService').atualizarColaborador(id_apdata, dadosAtualizacao);
            if (result.nModified === 0) {
                return res.status(404).json({ message: 'Colaborador não encontrado para atualização.' });
            }
            return res.status(200).json({ message: 'Colaborador atualizado com sucesso.' });
        } catch (error) {
            next(error);
        }
    }
    /**
     * Listar todos os colaboradores do ApData
     */
    async listarColaboradores(req, res, next) {
        try {
            const colaboradores = await IntegracaoApData.find({});
            return res.status(200).json(colaboradores);
        } catch (error) {
            next(error);
        }
    }
    /**
     * Preview de colaboradores do ApData (CSV)
     * Espera um arquivo CSV enviado via multipart/form-data em req.file
     * Retorna apenas os dados extraídos, sem gravar na base
     */
    previewColaboradoresApData = async (req, res, next) => {
        try {
            const previewFilePath = req.file?.path || req.body.filePath;
            if (!previewFilePath) {
                return res.status(400).json({ message: 'Arquivo CSV não enviado.' });
            }
            const ext = path.extname(previewFilePath).toLowerCase();
            let preview = [];
            if (ext === '.csv') {
                const parser = fs.createReadStream(previewFilePath, { encoding: 'latin1' })
                    .pipe(csv.parse({ delimiter: ';', columns: true, skip_empty_lines: true }));
                for await (const record of parser) {
                    preview.push({
                        id_apdata: this.getField(record, 'Id Contratado', 'id_apdata', 'idColaborador'),
                        nomeCompleto: this.getField(record, 'Nome Completo', 'nomeCompleto'),
                        setor: this.getField(record, 'Centro de Custo'),
                        e_mail: this.getField(record, 'E-mail', 'e_mail'),
                        cargo: this.getField(record, 'Cargo'),
                        gestor: this.getField(record, 'Hierarquia'),
                        idHierarquia: this.getField(record, 'Id Hierarquia'),
                        vinculo: this.getField(record, 'Vínculo', 'V�nculo', 'Vinculo'),
                        local: this.getField(record, 'Local', 'local'),
                        dataInclusao: new Date()
                    });
                }
            } else if (ext === '.xls' || ext === '.xlsx') {
                const xlsx = require('xlsx');
                const workbook = xlsx.readFile(previewFilePath);
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });
                for (const record of rows) {
                    preview.push({
                        id_apdata: this.getField(record, 'Id Contratado', 'id_apdata', 'idColaborador'),
                        nomeCompleto: this.getField(record, 'Nome Completo', 'nomeCompleto'),
                        setor: this.getField(record, 'Centro de Custo'),
                        e_mail: this.getField(record, 'E-mail', 'e_mail'),
                        cargo: this.getField(record, 'Cargo'),
                        gestor: this.getField(record, 'Hierarquia'),
                        idHierarquia: this.getField(record, 'Id Hierarquia'),
                        vinculo: this.getField(record, 'Vínculo', 'V�nculo', 'Vinculo'),
                        local: this.getField(record, 'Local', 'local'),
                        dataInclusao: new Date()
                    });
                }
            } else {
                return res.status(400).json({ message: 'Formato de arquivo não suportado para preview.' });
            }
            return res.status(200).json({ preview });
        } catch (error) {
            console.log('Erro ao processar arquivo para preview:', error);
            return res.status(500).json({ message: 'Erro ao processar arquivo para preview.', error: error.message });
        }
    }

    /**
     * Importar colaboradores do ApData (CSV)
     * Espera um arquivo CSV enviado via multipart/form-data em req.file
     */
    importarColaboradoresApData = async (req, res, next) => {
        try {
            let filePath = undefined;
            if (req.file && req.file.path) {
                filePath = req.file.path;
            } else if (req.body && req.body.filePath) {
                filePath = req.body.filePath;
            }
            if (!filePath) {
                return ApiResponse.badRequest(res, 'Arquivo CSV não enviado (nenhum arquivo recebido no upload).');
            }

            const colaboradores = [];
            const ext = path.extname(filePath).toLowerCase();
            if (ext === '.csv') {
                const parser = fs.createReadStream(filePath, { encoding: 'latin1' })
                    .pipe(csv.parse({ delimiter: ';', columns: true, skip_empty_lines: true }));
                for await (const record of parser) {
                    const id_apdata = this.getField(record, 'Id Contratado', 'id_apdata', 'idColaborador');

                    if (!id_apdata || String(id_apdata).trim() === '') continue;
                    const colaborador = {
                        id_apdata,
                        local: this.getField(record, 'Local', 'local'),
                        nomeCompleto: this.getField(record, 'Nome Completo', 'nomeCompleto'),
                        setor: this.getField(record, 'Centro de Custo'),
                        e_mail: this.getField(record, 'E-mail', 'e_mail'),
                        cargo: this.getField(record, 'Cargo'),
                        gestor: this.getField(record, 'Hierarquia'),
                        dataInclusao: new Date(),
                        nome: this.getField(record, 'Nome', 'nome'),
                        idade: this.getField(record, 'Quantidade de Anos de Idade', 'idade'),
                        categoria: this.getField(record, 'Categoria'),
                        vinculo: this.getField(record, 'Vínculo', 'V�nculo', 'Vinculo'),
                        dataAdmissao: this.getField(record, 'Data da Admissão', 'dataAdmissao'),
                        cbo: this.getField(record, 'Classificação Brasileira de Ocupações - CBO', 'Classifica��o Brasileira de Ocupa��es - CBO'),
                        horario: this.getField(record, 'Horário'),
                        horasMes: this.getField(record, 'Quantidade de Horas Mês', 'Quantidade de Horas M�s'),
                        estrutura: this.getField(record, 'Código de Estrutura', 'C�digo de Estrutura'),
                        centroCusto: this.getField(record, 'Centro de Custo'),
                        sindicato: this.getField(record, 'Sindicato'),
                        situacao: this.getField(record, 'Situação', 'Situa��o'),
                        dataInicioSituacao: this.getField(record, 'Data Início na Situação', 'Data In�cio na Situa��o'),
                        dataRescisao: this.getField(record, 'Data da Rescisão', 'Data da Rescis�o'),
                        dataNascimento: this.getField(record, 'Data do Nascimento'),
                        nacionalidade: this.getField(record, 'Nacionalidade'),
                        localNascimento: this.getField(record, 'Local de Nascimento'),
                        ufNascimento: this.getField(record, 'UF de Nascimento'),
                        nomeMae: this.getField(record, 'Nome da Mãe', 'Nome da M�e'),
                        nomePai: this.getField(record, 'Nome do Pai'),
                        estadoCivil: this.getField(record, 'Estado Civil'),
                        grauInstrucao: this.getField(record, 'Grau de Instrução', 'Grau de Instru��o'),
                        sexo: this.getField(record, 'Sigla Sexo'),
                        tipoEndereco: this.getField(record, 'Tipo de Endereço', 'Tipo de Endere�o'),
                        enderecoBase: this.getField(record, 'Endereço Base', 'Endere�o Base'),
                        enderecoNumero: this.getField(record, 'Endereço Número', 'Endere�o N�mero'),
                        enderecoComplemento: this.getField(record, 'Endereço Complemento', 'Endere�o Complemento'),
                        cep: this.getField(record, 'CEP'),
                        bairro: this.getField(record, 'Bairro'),
                        municipio: this.getField(record, 'Município', 'Munic�pio'),
                        estado: this.getField(record, 'Estado'),
                        telefoneDDD: this.getField(record, 'Telefone DDD'),
                        telefoneNumero: this.getField(record, 'Telefone Número', 'Telefone N�mero'),
                        celularDDD: this.getField(record, 'Telefone Celular DDD'),
                        celularNumero: this.getField(record, 'Telefone Celular Número', 'Telefone Celular N�mero'),
                        banco: this.getField(record, 'Banco'),
                        agenciaBanco: this.getField(record, 'Nome da Agência do Banco', 'Nome da Ag�ncia do Banco'),
                        numeroAgencia: this.getField(record, 'Número Oficial Agência', 'N�mero Oficial Ag�ncia'),
                        digitoAgencia: this.getField(record, 'Dígito da Agência', 'D�gito da Ag�ncia'),
                        numeroConta: this.getField(record, 'Número da Conta de Pagamento', 'N�mero da Conta de Pagamento'),
                        digitoConta: this.getField(record, 'Dígito da Conta de Pagamento', 'D�gito da Conta de Pagamento'),
                        meioPagamento: this.getField(record, 'Meio de Pagamento'),
                        cpf: this.getField(record, 'Cadastro de Pessoa Física - CPF', 'Cadastro de Pessoa F�sica - CPF'),
                        rg: this.getField(record, 'Número do Registro Geral - RG', 'N�mero do Registro Geral - RG'),
                        ufRg: this.getField(record, 'Estado - Emissão do RG', 'Estado - Emiss�o do RG'),
                        tituloEleitorNumero: this.getField(record, 'Título de Eleitor Número', 'T�tulo de Eleitor N�mero'),
                        tituloEleitorSecao: this.getField(record, 'Título de Eleitor Seção', 'T�tulo de Eleitor Se��o'),
                        tituloEleitorZona: this.getField(record, 'Título de Eleitor Zona', 'T�tulo de Eleitor Zona'),
                        ufTitulo: this.getField(record, 'Estado - Emissão do Título de Eleitor', 'Estado - Emiss�o do T�tulo de Eleitor'),
                        ctpsNumero: this.getField(record, 'CTPS Número', 'CTPS N�mero'),
                        ctpsSerie: this.getField(record, 'CTPS Série', 'CTPS S�rie'),
                        ufCtps: this.getField(record, 'Estado - Emissão da CTPS', 'Estado - Emiss�o da CTPS'),
                        pis: this.getField(record, 'PIS/PASEP Número', 'PIS/PASEP N�mero'),
                        tempoCasaAnos: this.getField(record, 'Quantidade Tempo Casa Anos'),
                        tempoCasaMeses: this.getField(record, 'Quantidade Tempo Casa Meses'),
                        tempoCasaDias: this.getField(record, 'Quantidade Tempo Casa Dias'),
                        segmentoEtnicoRacial: this.getField(record, 'Segmento Étnico e Racial', 'Segmento �tnico e Racial'),
                        idHierarquia: this.getField(record, 'Id Hierarquia'),
                        hierarquia: this.getField(record, 'Hierarquia'),
                    };
                    colaboradores.push(colaborador);
                }
            } else if (ext === '.xls' || ext === '.xlsx') {
                const xlsx = require('xlsx');
                const workbook = xlsx.readFile(filePath);
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });
                for (const record of rows) {
                    const id_apdata = this.getField(record, 'Id Contratado', 'id_apdata', 'idColaborador');
                    if (!id_apdata || String(id_apdata).trim() === '') continue;
                    const colaborador = {
                        id_apdata,
                        local: this.getField(record, 'Local', 'local'),
                        nomeCompleto: this.getField(record, 'Nome Completo', 'nomeCompleto'),
                        setor: this.getField(record, 'Centro de Custo'),
                        e_mail: this.getField(record, 'E-mail', 'e_mail'),
                        cargo: this.getField(record, 'Cargo'),
                        gestor: this.getField(record, 'Hierarquia'),
                        dataInclusao: new Date(),
                        nome: this.getField(record, 'Nome', 'nome'),
                        idade: this.getField(record, 'Quantidade de Anos de Idade', 'idade'),
                        categoria: this.getField(record, 'Categoria'),
                        vinculo: this.getField(record, 'Vínculo', 'V�nculo', 'Vinculo'),
                        dataAdmissao: this.getField(record, 'Data da Admissão', 'dataAdmissao'),
                        cbo: this.getField(record, 'Classificação Brasileira de Ocupações - CBO', 'Classifica��o Brasileira de Ocupa��es - CBO'),
                        horario: this.getField(record, 'Horário'),
                        horasMes: this.getField(record, 'Quantidade de Horas Mês', 'Quantidade de Horas M�s'),
                        estrutura: this.getField(record, 'Código de Estrutura', 'C�digo de Estrutura'),
                        centroCusto: this.getField(record, 'Centro de Custo'),
                        sindicato: this.getField(record, 'Sindicato'),
                        situacao: this.getField(record, 'Situação', 'Situa��o'),
                        dataInicioSituacao: this.getField(record, 'Data Início na Situação', 'Data In�cio na Situa��o'),
                        dataRescisao: this.getField(record, 'Data da Rescisão', 'Data da Rescis�o'),
                        dataNascimento: this.getField(record, 'Data do Nascimento'),
                        nacionalidade: this.getField(record, 'Nacionalidade'),
                        localNascimento: this.getField(record, 'Local de Nascimento'),
                        ufNascimento: this.getField(record, 'UF de Nascimento'),
                        nomeMae: this.getField(record, 'Nome da Mãe', 'Nome da M�e'),
                        nomePai: this.getField(record, 'Nome do Pai'),
                        estadoCivil: this.getField(record, 'Estado Civil'),
                        grauInstrucao: this.getField(record, 'Grau de Instrução', 'Grau de Instru��o'),
                        sexo: this.getField(record, 'Sigla Sexo'),
                        tipoEndereco: this.getField(record, 'Tipo de Endereço', 'Tipo de Endere�o'),
                        enderecoBase: this.getField(record, 'Endereço Base', 'Endere�o Base'),
                        enderecoNumero: this.getField(record, 'Endereço Número', 'Endere�o N�mero'),
                        enderecoComplemento: this.getField(record, 'Endereço Complemento', 'Endere�o Complemento'),
                        cep: this.getField(record, 'CEP'),
                        bairro: this.getField(record, 'Bairro'),
                        municipio: this.getField(record, 'Município', 'Munic�pio'),
                        estado: this.getField(record, 'Estado'),
                        telefoneDDD: this.getField(record, 'Telefone DDD'),
                        telefoneNumero: this.getField(record, 'Telefone Número', 'Telefone N�mero'),
                        celularDDD: this.getField(record, 'Telefone Celular DDD'),
                        celularNumero: this.getField(record, 'Telefone Celular Número', 'Telefone Celular N�mero'),
                        banco: this.getField(record, 'Banco'),
                        agenciaBanco: this.getField(record, 'Nome da Agência do Banco', 'Nome da Ag�ncia do Banco'),
                        numeroAgencia: this.getField(record, 'Número Oficial Agência', 'N�mero Oficial Ag�ncia'),
                        digitoAgencia: this.getField(record, 'Dígito da Agência', 'D�gito da Ag�ncia'),
                        numeroConta: this.getField(record, 'Número da Conta de Pagamento', 'N�mero da Conta de Pagamento'),
                        digitoConta: this.getField(record, 'Dígito da Conta de Pagamento', 'D�gito da Conta de Pagamento'),
                        meioPagamento: this.getField(record, 'Meio de Pagamento'),
                        cpf: this.getField(record, 'Cadastro de Pessoa Física - CPF', 'Cadastro de Pessoa F�sica - CPF'),
                        rg: this.getField(record, 'Número do Registro Geral - RG', 'N�mero do Registro Geral - RG'),
                        ufRg: this.getField(record, 'Estado - Emissão do RG', 'Estado - Emiss�o do RG'),
                        tituloEleitorNumero: this.getField(record, 'Título de Eleitor Número', 'T�tulo de Eleitor N�mero'),
                        tituloEleitorSecao: this.getField(record, 'Título de Eleitor Seção', 'T�tulo de Eleitor Se��o'),
                        tituloEleitorZona: this.getField(record, 'Título de Eleitor Zona', 'T�tulo de Eleitor Zona'),
                        ufTitulo: this.getField(record, 'Estado - Emissão do Título de Eleitor', 'Estado - Emiss�o do T�tulo de Eleitor'),
                        ctpsNumero: this.getField(record, 'CTPS Número', 'CTPS N�mero'),
                        ctpsSerie: this.getField(record, 'CTPS Série', 'CTPS S�rie'),
                        ufCtps: this.getField(record, 'Estado - Emissão da CTPS', 'Estado - Emiss�o da CTPS'),
                        pis: this.getField(record, 'PIS/PASEP Número', 'PIS/PASEP N�mero'),
                        tempoCasaAnos: this.getField(record, 'Quantidade Tempo Casa Anos'),
                        tempoCasaMeses: this.getField(record, 'Quantidade Tempo Casa Meses'),
                        tempoCasaDias: this.getField(record, 'Quantidade Tempo Casa Dias'),
                        segmentoEtnicoRacial: this.getField(record, 'Segmento Étnico e Racial', 'Segmento �tnico e Racial'),
                        idHierarquia: this.getField(record, 'Id Hierarquia'),
                        hierarquia: this.getField(record, 'Hierarquia'),
                    };
                    colaboradores.push(colaborador);
                }
            } else {
                return ApiResponse.badRequest(res, 'Formato de arquivo não suportado para importação.');
            }

            if (colaboradores.length === 0) {
                return ApiResponse.badRequest(res, 'Nenhum colaborador válido para importar (id_apdata ausente em todos os registros).');
            }

            let result = null;
            let message = '';
            try {
                // Cada colaborador será um documento individual na collection
                result = await IntegracaoApData.insertMany(colaboradores, { ordered: false, lean: true });
                message = `${result.length} colaborador(es) importados com sucesso.`;
            } catch (error) {
                if (error && error.code === 11000) {
                    message = 'Importação concluída com duplicatas ignoradas.';
                } else {
                    console.error('Erro ao importar colaboradores do APData1:', error);
                    return ApiResponse.error(res, 500, 'Erro ao importar colaboradores.', error?.message || error);
                }
            }

            return ApiResponse.success(res, 201, message, { colaboradores: result });
        } catch (error) {
            if (error && error.code === 11000) {
                return ApiResponse.success(res, 201, 'Importação concluída com duplicatas ignoradas.', { colaboradores: [] });
            }
            console.error('Erro ao importar colaboradores do APData2:', error);
            return ApiResponse.error(res, 500, 'Erro ao importar colaboradores.', error?.message || error);
        }
    }

    /**
     * Verificar quais funcionários já existem na base
     */
    async verificarExistentes(req, res, next) {
        try {
            const { idsApData } = req.body;

            if (!idsApData || !Array.isArray(idsApData)) {
                return ApiResponse.badRequest(res, 'idsApData deve ser um array válido.');
            }

            // Buscar funcionários existentes
            const existingEmployees = await IntegracaoApData.find(
                { id_apdata: { $in: idsApData } },
                { id_apdata: 1, nomeCompleto: 1, dataInclusao: 1 }
            );

            // Extrair apenas os IDs dos funcionários existentes
            const existingIds = existingEmployees.map(emp => emp.id_apdata);

            // Formatar dados para retorno
            const existing = existingEmployees.map(emp => ({
                id_apdata: emp.id_apdata,
                nomeCompleto: emp.nomeCompleto,
                dataInclusao: emp.dataInclusao.toISOString()
            }));

            return ApiResponse.success(res, 200, 'Verificação concluída.', {
                existingIds,
                existing
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Salvar funcionários importados do APData
     */
    async criarBaseColaboradores(req, res, next) {
        try {
            const { colaboradores } = req.body;

            if (!colaboradores || !Array.isArray(colaboradores)) {
                return ApiResponse.badRequest(res, 'Dados de colaboradores deve ser um array válido.');
            }

            if (colaboradores.length === 0) {
                return ApiResponse.badRequest(res, 'Array de colaboradores não pode estar vazio.');
            }

            // Validar dados obrigatórios
            for (const colaborador of colaboradores) {
                if (!colaborador.id_apdata || !colaborador.nomeCompleto) {
                    return ApiResponse.badRequest(res, 'idColaborador e nomeCompleto são obrigatórios para todos os registros.');
                }
            }

            // Inserir em lote, ignorando duplicatas
            const result = await IntegracaoApData.insertMany(colaboradores, {
                ordered: false, // Continua inserindo mesmo se houver erro em alguns documentos
                lean: true
            });

            return ApiResponse.success(res, 201, `${result.length} colaborador(es) salvos com sucesso.`, result);

        } catch (error) {
            // Se erro for de duplicata (código 11000), ainda considerar sucesso parcial
            if (error.code === 11000) {
                return ApiResponse.success(res, 201, 'Funcionários processados. Alguns já existiam na base e foram ignorados.');
            }
            next(error);
        }
    }

    /**
     * Listar funcionários desligados com paginação
     */
    async listarDesligados(req, res, next) {
        try {
            const { page = 1, limit = 50, idContratado, nomeCompleto, cargo, centroCusto } = req.query;

            const query = {};
            if (idContratado) query.idContratado = { $regex: new RegExp(idContratado, 'i') };
            if (nomeCompleto) query.nomeCompleto = { $regex: new RegExp(nomeCompleto, 'i') };
            if (cargo) query.cargo = { $regex: new RegExp(cargo, 'i') };
            if (centroCusto) query.centroCusto = { $regex: new RegExp(centroCusto, 'i') };

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { dataInclusao: -1 }
            };

            // Buscar com paginação manual
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const total = await Desligado.countDocuments(query);
            const docs = await Desligado.find(query)
                .sort({ dataInclusao: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const result = {
                docs,
                totalDocs: total,
                limit: parseInt(limit),
                page: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
                hasPrevPage: parseInt(page) > 1
            };

            return ApiResponse.success(res, 200, 'Funcionários desligados recuperados com sucesso.', result);

        } catch (error) {
            next(error);
        }
    }

    /**
     * Buscar funcionário desligado por ID
     */
    async buscarPorId(req, res, next) {
        try {
            const { id } = req.params;

            const desligado = await Desligado.findById(id);

            if (!desligado) {
                return ApiResponse.notFound(res, 'Funcionário desligado não encontrado.');
            }

            return ApiResponse.success(res, 200, 'Funcionário desligado encontrado.', desligado);

        } catch (error) {
            next(error);
        }
    }

    /**
     * Buscar funcionário desligado por ID Contratado
     */
    async buscarPorIdContratado(req, res, next) {
        try {
            const { idContratado } = req.params;

            const desligado = await Desligado.findOne({ idContratado });

            if (!desligado) {
                return ApiResponse.notFound(res, 'Funcionário desligado não encontrado.');
            }

            return ApiResponse.success(res, 200, 'Funcionário desligado encontrado.', desligado);

        } catch (error) {
            next(error);
        }
    }

    /**
     * Buscar desligados por filtro de data para relatórios
     */
    async buscarDesligadosPorData(req, res, next) {
        try {
            const { dataInicio, dataFim, formato = 'json' } = req.query;

            console.log('Buscar desligados por data:', { dataInicio, dataFim, formato });

            if (!dataInicio || !dataFim) {
                return ApiResponse.badRequest(res, 'dataInicio e dataFim são obrigatórios.');
            }

            // Função para converter data ISO (YYYY-MM-DD) para formato brasileiro (DD/MM/YYYY)
            const formatToBrazilianDate = (isoDate) => {
                const date = new Date(isoDate);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            };

            // Função para converter data brasileira (DD/MM/YYYY) para Date para comparação
            const parseFromBrazilianDate = (brazilianDate) => {
                const [day, month, year] = brazilianDate.split('/');
                return new Date(year, month - 1, day);
            };

            // Converter datas de entrada para formato brasileiro
            const dataInicioBR = formatToBrazilianDate(dataInicio);
            const dataFimBR = formatToBrazilianDate(dataFim);

            console.log('Datas convertidas:', { dataInicioBR, dataFimBR });

            // Buscar todos os desligados e filtrar por data no código
            // Isso é necessário porque dataRescisao está armazenada como string no formato DD/MM/YYYY
            const todosDesligados = await Desligado.find({
                dataRescisao: { $exists: true, $ne: null, $ne: '' }
            }).lean();

            console.log(`Total de desligados encontrados: ${todosDesligados.length}`);

            // Filtrar por período de data
            const inicio = new Date(dataInicio);
            const fim = new Date(dataFim);

            const desligados = todosDesligados.filter(desligado => {
                if (!desligado.dataRescisao) return false;

                try {
                    const dataRescisaoDate = parseFromBrazilianDate(desligado.dataRescisao);
                    return dataRescisaoDate >= inicio && dataRescisaoDate <= fim;
                } catch (error) {
                    console.log(`Erro ao processar data: ${desligado.dataRescisao}`, error);
                    return false;
                }
            });

            console.log(`Desligados filtrados por período: ${desligados.length}`);

            // Ordenar por data de rescisão
            desligados.sort((a, b) => {
                const dateA = parseFromBrazilianDate(a.dataRescisao);
                const dateB = parseFromBrazilianDate(b.dataRescisao);
                return dateA - dateB;
            });

            // Se for solicitado formato Excel, formatar dados
            if (formato === 'excel') {
                const desligadosFormatados = desligados.map((desligado, index) => ({
                    'MatrÍcula': desligado.idContratado || '',
                    'Nome': desligado.nomeCompleto || '',
                    'Data de Desligamento': desligado.dataRescisao || '',
                    'Data de Admissão': desligado.dataAdmissao || '',
                    'Data de Pagamento': '', // Campo calculado ou vazio
                    'Data da Homologação': '', // Campo calculado ou vazio
                    'Tipo de Desligamento': desligado.situacao || '',
                    'Gestor': '', // Vem da hierarquia
                    'Gerente': '', // Vem da hierarquia
                    'Departamento': desligado.hierarquia || desligado.centroCusto || '',
                    'Unidade': desligado.local || ''
                }));

                return ApiResponse.success(res, 200, 'Desligados formatados para Excel.', {
                    desligados: desligadosFormatados,
                    total: desligados.length,
                    periodo: {
                        inicio: dataInicioBR,
                        fim: dataFimBR
                    }
                });
            }

            return ApiResponse.success(res, 200, 'Desligados encontrados.', {
                desligados,
                total: desligados.length,
                periodo: {
                    inicio: dataInicioBR,
                    fim: dataFimBR
                }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Enviar relatório de desligados por email
     */
    async enviarRelatorioEmail(req, res, next) {
        try {
            const { titulo, remetente, destinatarios, corpo, dataInicio, dataFim } = req.body;

            console.log('Enviar relatório por email:', { titulo, remetente, destinatarios: destinatarios?.split(',').length, dataInicio, dataFim });

            // Validações
            if (!titulo || !remetente || !destinatarios || !corpo) {
                return ApiResponse.badRequest(res, 'Título, remetente, destinatários e corpo do email são obrigatórios.');
            }

            if (!dataInicio || !dataFim) {
                return ApiResponse.badRequest(res, 'dataInicio e dataFim são obrigatórios.');
            }

            // Criar conexão de email
            const transporter = await MailService.criarConexaoEmail();

            // Separar destinatários e limpar espaços
            const emailsDestinatarios = destinatarios
                .split(',')
                .map(email => email.trim())
                .filter(email => email.length > 0);

            if (emailsDestinatarios.length === 0) {
                return ApiResponse.badRequest(res, 'Pelo menos um destinatário válido é necessário.');
            }

            // Enviar email para cada destinatário
            const resultados = [];
            for (const emailDestinatario of emailsDestinatarios) {
                try {
                    await MailService.SendMail(titulo, corpo, emailDestinatario, transporter);
                    resultados.push({ email: emailDestinatario, status: 'enviado' });
                    console.log(`✅ Email enviado para: ${emailDestinatario}`);
                } catch (emailError) {
                    console.error(`❌ Erro ao enviar email para ${emailDestinatario}:`, emailError);
                    resultados.push({ email: emailDestinatario, status: 'erro', erro: emailError.message });
                }
            }

            const sucessos = resultados.filter(r => r.status === 'enviado').length;
            const erros = resultados.filter(r => r.status === 'erro').length;

            return ApiResponse.success(res, 200, `Relatório enviado com sucesso para ${sucessos} destinatário(s). ${erros > 0 ? `${erros} falha(s).` : ''}`, {
                resultados,
                resumo: {
                    total: emailsDestinatarios.length,
                    sucessos,
                    erros
                }
            });

        } catch (error) {
            console.error('Erro ao enviar email:', error);
            next(error);
        }
    }

}

module.exports = new IntegracaoApDataController();
