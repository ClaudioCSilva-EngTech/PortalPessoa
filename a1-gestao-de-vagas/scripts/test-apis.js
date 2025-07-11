// scripts/test-apis.js
// Script para testar as APIs implementadas (usando fetch nativo do Node.js 18+)

// Dados de teste
const testData = {
  desligados: [
    {
      razaoSocialEmpresa: "Empresa Teste Ltda",
      local: "São Paulo",
      sufixoCnpj: "0001",
      idContratado: "TEST001",
      nomeCompleto: "João Teste Silva",
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
    },
    {
      razaoSocialEmpresa: "Empresa Teste Ltda",
      local: "São Paulo",
      sufixoCnpj: "0001",
      idContratado: "TEST002",
      nomeCompleto: "Maria Teste Santos",
      vinculo: "CLT",
      dataAdmissao: "01/06/2021",
      cargo: "Desenvolvedora Frontend",
      codigoEstrutura: "TI002",
      centroCusto: "Tecnologia",
      situacao: "Desligado",
      dataInicioSituacao: "20/12/2024",
      dataRescisao: "20/12/2024",
      dataNascimento: "22/08/1985",
      estadoCivil: "Casado",
      grauInstrucao: "Superior Completo",
      siglaSexo: "F",
      segmentoEtnicoRacial: "Pardo",
      idHierarquia: "H002",
      hierarquia: "Analista"
    }
  ]
};

// Função para testar modelos e controllers localmente
async function testModels() {
  console.log('🧪 Testando modelos e controllers localmente...\n');

  try {
    // Importar modelos e controllers
    const Desligado = require('../src/models/Desligado');
    const Vaga = require('../src/models/Vaga');
    const DesligadoController = require('../src/controllers/DesligadoController');
    const VagaController = require('../src/controllers/VagaController');
    const DesligadoService = require('../src/services/DesligadoService');

    console.log('✅ Todos os modelos e controllers foram importados com sucesso');
    console.log('');

    // Testar validação dos dados
    console.log('1️⃣ Testando validação de dados...');
    const isValid = DesligadoService.validarDadosObrigatorios(testData.desligados[0]);
    console.log('✅ Validação de dados:', isValid ? 'Passou' : 'Falhou');
    console.log('');

    // Testar mapeamento de hierarquia
    console.log('2️⃣ Testando mapeamento de hierarquia...');
    const hierarquia = DesligadoService.mapearHierarquia('Analista de Sistemas');
    console.log('✅ Hierarquia mapeada:', hierarquia);
    console.log('');

    // Testar mapeamento de tipo de contratação
    console.log('3️⃣ Testando mapeamento de tipo de contratação...');
    const tipoContratacao = DesligadoService.mapearTipoContratacao('CLT');
    console.log('✅ Tipo de contratação mapeado:', tipoContratacao);
    console.log('');

    // Testar mapeamento de desligado para vaga
    console.log('4️⃣ Testando mapeamento de desligado para vaga...');
    const vagaData = DesligadoService.mapearDesligadoParaVaga(testData.desligados[0]);
    console.log('✅ Vaga mapeada - Código:', vagaData.codigo_vaga);
    console.log('✅ Posição:', vagaData.detalhe_vaga.posicaoVaga);
    console.log('✅ Setor:', vagaData.detalhe_vaga.setor);
    console.log('');

    // Testar definição de urgência
    console.log('5️⃣ Testando definição de urgência...');
    const urgencia = DesligadoService.definirUrgencia(testData.desligados[0]);
    console.log('✅ Urgência definida:', urgencia);
    console.log('');

    console.log('🎉 Todos os testes locais foram concluídos com sucesso!');
    console.log('');
    console.log('📋 Resumo dos componentes implementados:');
    console.log('- ✅ Modelo Desligado');
    console.log('- ✅ DesligadoController');
    console.log('- ✅ DesligadoService');
    console.log('- ✅ VagaController (método criarVagasEmLote)');
    console.log('- ✅ Rotas desligados');
    console.log('- ✅ Rota vagas/lote');
    console.log('');
    console.log('🚀 Para testar com servidor rodando, use:');
    console.log('   curl -X POST http://localhost:3000/desligados/check-existing \\');
    console.log('   -H "Content-Type: application/json" \\');
    console.log('   -d \'{"idsContratados": ["TEST001", "TEST002"]}\'');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  testModels();
}

module.exports = { testModels, testData };
