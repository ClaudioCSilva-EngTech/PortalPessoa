// scripts/test-payload-frontend.js
// Script para simular o payload que seria enviado pelo frontend

// Simular dados do sessionStorage
const mockUser = {
  data: {
    detalhes: {
      id_apdata: "USR001",
      nome: "João Silva Teste",
      cargo: "Gerente de TI",
      setor: "Tecnologia",
      e_mail: "joao.silva@empresa.com"
    }
  }
};

// Simular dados de desligados
const mockDesligados = [
  {
    razaoSocialEmpresa: "Empresa Teste Ltda",
    local: "São Paulo",
    sufixoCnpj: "0001",
    idContratado: "PAYLOAD_TEST_001",
    nomeCompleto: "Maria Teste Payload",
    vinculo: "CLT",
    dataAdmissao: "01/01/2020",
    cargo: "Desenvolvedora Frontend",
    codigoEstrutura: "TI002",
    centroCusto: "Tecnologia",
    situacao: "Desligado",
    dataInicioSituacao: "15/12/2024",
    dataRescisao: "15/12/2024",
    dataNascimento: "22/08/1985",
    estadoCivil: "Solteiro",
    grauInstrucao: "Superior Completo",
    siglaSexo: "F",
    segmentoEtnicoRacial: "Pardo",
    idHierarquia: "H002",
    hierarquia: "Analista"
  }
];

function simulateGetCurrentUser() {
  try {
    const detalhes = mockUser?.data?.detalhes;
    
    if (!detalhes) return null;
    
    return {
      id: detalhes.id_apdata || detalhes.id || 'SISTEMA',
      nome: detalhes.nome || 'Usuário Sistema',
      cargo: detalhes.cargo || 'Não especificado',
      setor: detalhes.setor || 'Não especificado',
      email: detalhes.e_mail || detalhes.email || ''
    };
  } catch (error) {
    console.warn('Erro ao extrair dados do usuário:', error);
    return null;
  }
}

function testPayloadGeneration() {
  console.log('🧪 Testando geração de payload para criação de vagas em lote...\n');

  // 1. Simular extração do usuário
  console.log('1️⃣ Extraindo dados do usuário logado...');
  const usuarioLogado = simulateGetCurrentUser();
  console.log('✅ Usuário extraído:', usuarioLogado);
  console.log('');

  // 2. Gerar payload completo
  console.log('2️⃣ Gerando payload completo...');
  const payload = {
    desligados: mockDesligados,
    usuarioLogado: usuarioLogado
  };
  
  console.log('📦 Payload gerado:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('');

  // 3. Validar estrutura do payload
  console.log('3️⃣ Validando estrutura do payload...');
  
  const validations = [
    { check: Array.isArray(payload.desligados), message: 'desligados é um array' },
    { check: payload.desligados.length > 0, message: 'array de desligados não está vazio' },
    { check: payload.usuarioLogado !== null, message: 'usuarioLogado não é null' },
    { check: payload.usuarioLogado?.id, message: 'usuarioLogado tem ID' },
    { check: payload.usuarioLogado?.nome, message: 'usuarioLogado tem nome' },
    { check: payload.usuarioLogado?.cargo, message: 'usuarioLogado tem cargo' },
    { check: payload.desligados[0]?.idContratado, message: 'primeiro desligado tem idContratado' },
    { check: payload.desligados[0]?.nomeCompleto, message: 'primeiro desligado tem nomeCompleto' },
    { check: payload.desligados[0]?.cargo, message: 'primeiro desligado tem cargo' }
  ];

  validations.forEach((validation, index) => {
    if (validation.check) {
      console.log(`✅ ${index + 1}. ${validation.message}`);
    } else {
      console.log(`❌ ${index + 1}. ${validation.message}`);
    }
  });

  console.log('');

  // 4. Simular processamento no backend
  console.log('4️⃣ Simulando processamento no backend...');
  
  const backendInput = {
    desligados: payload.desligados,
    usuarioLogado: payload.usuarioLogado
  };

  console.log('📥 Dados que o backend receberá:');
  console.log('- Número de desligados:', backendInput.desligados.length);
  console.log('- Usuário logado ID:', backendInput.usuarioLogado?.id);
  console.log('- Usuário logado nome:', backendInput.usuarioLogado?.nome);
  console.log('- Usuário logado cargo:', backendInput.usuarioLogado?.cargo);
  
  // Simular mapeamento no backend
  const mockVagaData = {
    codigo_vaga: `LTD-${mockDesligados[0].idContratado}`,
    solicitante: backendInput.usuarioLogado?.nome || 'Sistema - Importação em Lote',
    cargo_solicitante: backendInput.usuarioLogado?.cargo || 'Sistema',
    _idUsuario: backendInput.usuarioLogado?.id || 'SISTEMA',
    status_aprovacao: false,
    detalhe_vaga: {
      posicaoVaga: mockDesligados[0].cargo,
      setor: mockDesligados[0].centroCusto,
      empresaContratante: mockDesligados[0].razaoSocialEmpresa
    }
  };

  console.log('');
  console.log('📋 Vaga que seria criada:');
  console.log('- Código:', mockVagaData.codigo_vaga);
  console.log('- Solicitante:', mockVagaData.solicitante);
  console.log('- Cargo solicitante:', mockVagaData.cargo_solicitante);
  console.log('- ID usuário:', mockVagaData._idUsuario);
  console.log('- Posição vaga:', mockVagaData.detalhe_vaga.posicaoVaga);
  console.log('- Setor:', mockVagaData.detalhe_vaga.setor);
  console.log('');

  console.log('🎉 Teste de payload concluído com sucesso!');
}

// Executar teste se o script for chamado diretamente
if (require.main === module) {
  testPayloadGeneration();
}

module.exports = { testPayloadGeneration, mockUser, mockDesligados };
