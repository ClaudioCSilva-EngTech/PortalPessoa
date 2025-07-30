const IntegracaoApData = require('../models/IntegracaoApData');

class IntegracaoApDataService {

    async uploadColaboradores(data) {
        try {
            const existing = await IntegracaoApData.findOne({ id_apdata: data.id_apdata });
            if (existing) {
                await IntegracaoApData.updateOne(
                    { id_apdata: data.id_apdata },
                    { $set: data }
                );
            } else {
                await IntegracaoApData.create(data);
            }
        } catch (error) {
            throw new Error(`Erro ao fazer upload de colaboradores: ${error.message}`);
        }
    }

    async buscarColaboradores(filtros = {}) {
        try {
            return await IntegracaoApData.find(filtros);
        } catch (error) {
            throw new Error(`Erro ao buscar colaboradores: ${error.message}`);
        }
    }

    async buscarColaboradorPorId(id_apdata) {
        try {
            return await IntegracaoApData.findOne({ id_apdata });
        } catch (error) {
            throw new Error(`Erro ao buscar colaborador por ID: ${error.message}`);
        }
    }

    async deletarColaborador(id_apdata) {
        try {
            await IntegracaoApData.deleteOne({ id_apdata });
        } catch (error) {
            throw new Error(`Erro ao deletar colaborador: ${error.message}`);
        }
    }

    async atualizarColaborador(id_apdata, dadosAtualizacao) {
        try {
            return await IntegracaoApData.updateOne(
                { id_apdata },
                { $set: dadosAtualizacao }
            );
        } catch (error) {
            throw new Error(`Erro ao atualizar colaborador: ${error.message}`);
        }
    }

    async obterEstatisticas() {
        try {
            const totalColaboradores = await IntegracaoApData.countDocuments();
            // Para ferias, contar todos os ferias de todos os colaboradores
            const all = await IntegracaoApData.find({}, { ferias: 1 });
            let totalFerias = 0;
            all.forEach(doc => {
                if (Array.isArray(doc.ferias)) totalFerias += doc.ferias.length;
            });
            return {
                totalColaboradores,
                totalFerias
            };
        } catch (error) {
            throw new Error(`Erro ao obter estatísticas: ${error.message}`);
        }
    }

    async validarColaborador(id_apdata) {
        const colaborador = await IntegracaoApData.findOne({ id_apdata });
        return !colaborador; // retorna true se não existir
    }

    async buscarColaboradoresPorSetor(setor) {
        try {
            return await IntegracaoApData.find({ setor });
        } catch (error) {
            throw new Error(`Erro ao buscar colaboradores por setor: ${error.message}`);
        }
    }

    async buscarColaboradoresPorCargo(cargo) {
        try {
            return await IntegracaoApData.find({ cargo });
        } catch (error) {
            throw new Error(`Erro ao buscar colaboradores por cargo: ${error.message}`);
        }
    }

    async buscarColaboradoresPorSupervisor(supervisor) {
        try {
            return await IntegracaoApData.find({ supervisor });
        } catch (error) {
            throw new Error(`Erro ao buscar colaboradores por supervisor: ${error.message}`);
        }
    }

}    

module.exports = new IntegracaoApDataService();