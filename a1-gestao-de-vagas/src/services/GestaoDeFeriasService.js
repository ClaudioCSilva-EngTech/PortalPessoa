const GestaoDeFerias = require('../models/GestaDeFerias');

class GestaoDeFeriasService {

    async agendarferias(data) {
        try {  
            const existingFerias = await GestaoDeFerias.findOne({ "ferias.id_apdata": data.id_apdata });
            if (existingFerias) {
                // Atualiza o período de férias existente
                await GestaoDeFerias.updateOne(
                    { "ferias.id_apdata": data.id_apdata },
                    { $set: { "ferias.$": data } }
                );
            } else {
                // Adiciona novo período de férias
                await GestaoDeFerias.updateOne(
                    {},
                    { $push: { ferias: data } },
                    { upsert: true }
                );
            }
        } catch (error) {
            throw new Error(`Erro ao agendar férias: ${error.message}`);
        }
    }

    async uploadFerias(data) {
        try {
            const existingFerias = await GestaoDeFerias.findOne({ "ferias.id_apdata": data.id_apdata });
            if (existingFerias) {
                // Atualiza o período de férias existente
                await GestaoDeFerias.updateOne(
                    { "ferias.id_apdata": data.id_apdata },
                    { $set: { "ferias.$": data } }
                );
            } else {
                // Adiciona novo período de férias
                await GestaoDeFerias.updateOne(
                    {},
                    { $push: { ferias: data } },
                    { upsert: true }
                );
            }
        } catch (error) {
            throw new Error(`Erro ao fazer upload de férias: ${error.message}`);
        }
    }

    async buscarFerias(filtros = {}) {
        try {
            return await GestaoDeFerias.find(filtros, { ferias: 1 });
        } catch (error) {
            throw new Error(`Erro ao buscar férias: ${error.message}`);
        }
    }   

    async buscarFeriasPorId(id_apdata) {
        try {
            return await GestaoDeFerias.findOne({ "ferias.id_apdata": id_apdata }, { ferias: 1 });
        } catch (error) {
            throw new Error(`Erro ao buscar férias por ID: ${error.message}`);
        }
    }

    async deletarFerias(id_apdata) {
        try {
            await GestaoDeFerias.updateOne(
                {},
                { $pull: { ferias: { id_apdata } } }
            );
        } catch (error) {
            throw new Error(`Erro ao deletar férias: ${error.message}`);
        }
    }

    async atualizarFerias(id_apdata, dadosAtualizacao) {
        try {
            return await GestaoDeFerias.updateOne(
                { "ferias.id_apdata": id_apdata },
                { $set: { "ferias.$": dadosAtualizacao } }
            );
        } catch (error) {
            throw new Error(`Erro ao atualizar férias: ${error.message}`);
        }
    }

    async obterEstatisticas() {
        try {
           
            const totalFerias = await GestaoDeFerias.aggregate([
                { $unwind: "$ferias" },
                { $count: "total" }
            ]);

            return {
                totalFerias: totalFerias[0]?.total || 0
            };
        } catch (error) {
            throw new Error(`Erro ao obter estatísticas: ${error.message}`);
        }
    }

    async validarFerias(id_apdata) {
        const ferias = await GestaoDeFerias.findOne({ "ferias.id_apdata": id_apdata });
        return !ferias; // retorna true se não existir
    }

    async buscarFeriasPorAprovador(aprovador) {
        try {
            return await GestaoDeFerias.find({ "ferias.aprovador": aprovador }, { ferias: 1 });
        } catch (error) {
            throw new Error(`Erro ao buscar férias por aprovador: ${error.message}`);
        }
    }

    async buscarFeriasPorStatus(status) {
        try {
            return await GestaoDeFerias.find({ "ferias.status": status }, { ferias: 1 });
        } catch (error) {
            throw new Error(`Erro ao buscar férias por status: ${error.message}`);
        }
    }

    async buscarFeriasPorGerente(gerente) {
        try {
            return await GestaoDeFerias.find({ "ferias.gerente": gerente }, { ferias: 1 });
        } catch (error) {
            throw new Error(`Erro ao buscar férias por gerente: ${error.message}`);
        }
    }

}    

module.exports = new GestaoDeFeriasService();