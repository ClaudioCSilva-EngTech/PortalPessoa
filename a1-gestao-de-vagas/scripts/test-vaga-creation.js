// scripts/test-vaga-creation.js
// Script para testar a criação e persistência de vagas

const mongoose = require('mongoose');
const Vaga = require('../src/models/Vaga');
const Desligado = require('../src/models/Desligado');
const DesligadoService = require('../src/services/DesligadoService');
const VagaService = require('../src/services/VagaService');

// Dados de teste
const testDesligado = {
  razaoSocialEmpresa: "Empresa Teste Ltda",
  local: "São Paulo",
  sufixoCnpj: "0001",
  idContratado: "VAGA_TEST_001",
  nomeCompleto: "João Teste Vaga",
  vinculo: "CLT",
  dataAdmissao: "01/01/2020",
  cargo: "Analista de Sistemas",
  codigoEstrutura: "TI001",
  centroCusto: "Tecnologia",
  situacao: "Desligado",
  dataInicioSituacao: "15/12/2024",
  dataRescisao: "15/12/2024",
  dataNascimento: "15/03/1990",
  estadoCivil: "Solteiro",
  grauInstrucao: "Superior Completo",
  siglaSexo: "M",
  segmentoEtnicoRacial: "Branco",
  idHierarquia: "H001",
  hierarquia: "Analista"
};

async function testarCriacaoVaga() {
  console.log('🧪 Testando criação e persistência de vagas...\n');

  try {
    // 1. Testar mapeamento dos dados
    console.log('1️⃣ Testando mapeamento de dados...');
    const vagaData = DesligadoService.mapearDesligadoParaVaga(testDesligado);
    console.log('✅ Dados mapeados:', {
      codigo_vaga: vagaData.codigo_vaga,
      solicitante: vagaData.solicitante,
      posicaoVaga: vagaData.detalhe_vaga.posicaoVaga,
      setor: vagaData.detalhe_vaga.setor
    });
    console.log('');

    // 2. Testar validação dos dados
    console.log('2️⃣ Testando validação dos dados...');
    const errosValidacao = VagaService.validarDadosVaga(vagaData);
    if (errosValidacao.length > 0) {
      console.log('❌ Erros de validação:', errosValidacao);
      return;
    }
    console.log('✅ Dados válidos para criação');
    console.log('');

    // 3. Testar criação direta da vaga
    console.log('3️⃣ Testando criação direta da vaga...');
    try {
      const novaVaga = await VagaService.criarVaga(vagaData);
      console.log('✅ Vaga criada com sucesso:', novaVaga.codigo_vaga);
      console.log('✅ ID no MongoDB:', novaVaga._id);
      console.log('');

      // 4. Verificar se a vaga foi realmente salva
      console.log('4️⃣ Verificando persistência no MongoDB...');
      const vagaSalva = await Vaga.findById(novaVaga._id);
      if (vagaSalva) {
        console.log('✅ Vaga encontrada no banco:', vagaSalva.codigo_vaga);
        console.log('✅ Solicitante:', vagaSalva.solicitante);
        console.log('✅ Status aprovação:', vagaSalva.status_aprovacao);
        console.log('✅ Data abertura:', vagaSalva.data_abertura);
        console.log('');
      } else {
        console.log('❌ Vaga NÃO encontrada no banco de dados!');
        return;
      }

      // 5. Testar o método do DesligadoService
      console.log('5️⃣ Testando criação via DesligadoService...');
      const resultado = await DesligadoService.criarVagasAutomaticas([testDesligado]);
      
      if (resultado.vagasCriadas.length > 0) {
        console.log('✅ Vaga criada via DesligadoService:', resultado.vagasCriadas[0].codigo_vaga);
        console.log('✅ Total de vagas criadas:', resultado.vagasCriadas.length);
        console.log('✅ Erros:', resultado.erros.length);
      } else {
        console.log('❌ Nenhuma vaga criada via DesligadoService');
        console.log('❌ Erros encontrados:', resultado.erros);
      }
      console.log('');

      // 6. Contar total de vagas no banco
      console.log('6️⃣ Contando total de vagas no banco...');
      const totalVagas = await Vaga.countDocuments();
      console.log('✅ Total de vagas no banco:', totalVagas);
      
      // Listar últimas vagas criadas
      const ultimasVagas = await Vaga.find()
        .sort({ data_abertura: -1 })
        .limit(3)
        .select('codigo_vaga solicitante data_abertura');
      
      console.log('📋 Últimas vagas criadas:');
      ultimasVagas.forEach((vaga, index) => {
        console.log(`  ${index + 1}. ${vaga.codigo_vaga} - ${vaga.solicitante} (${vaga.data_abertura})`);
      });

    } catch (error) {
      console.error('❌ Erro ao criar vaga:', error.message);
      console.error('❌ Stack:', error.stack);
    }

    console.log('');
    console.log('🎉 Teste de criação de vagas concluído!');

  } catch (error) {
    console.error('❌ Erro geral no teste:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

// Executar teste se o script for chamado diretamente
if (require.main === module) {
  testarCriacaoVaga();
}

module.exports = { testarCriacaoVaga, testDesligado };
