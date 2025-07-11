import { type Vaga, type VagaResponse } from "./types/VagaTypes";

const API_BASE = import.meta.env.VITE_BFF_URL;

if (!API_BASE) {
  console.error("VITE_BFF_URL não está definida. Verifique seu arquivo .env");
}

function getAuthHeaders() {
  const token = sessionStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function getCurrentUser() {
  try {
    console.log('getCurrentUser - Iniciando extração...');
    
    // 1. Tentar pegar do sessionStorage primeiro
    const userStr = sessionStorage.getItem('user');
    console.log('getCurrentUser - userStr do sessionStorage:', userStr ? 'existe' : 'não existe');
    
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        console.log('getCurrentUser - Objeto completo do sessionStorage:', userObj);
        
        // Tentar diferentes estruturas possíveis
        let userData = null;
        
        // Estrutura: user.data.detalhes
        if (userObj?.data?.detalhes) {
          userData = userObj.data.detalhes;
          console.log('getCurrentUser - Usando user.data.detalhes');
        }
        // Estrutura: user.data.auth
        else if (userObj?.data?.auth) {
          userData = userObj.data.auth;
          console.log('getCurrentUser - Usando user.data.auth');
        }
        // Estrutura: user.data
        else if (userObj?.data && typeof userObj.data === 'object') {
          userData = userObj.data;
          console.log('getCurrentUser - Usando user.data');
        }
        // Estrutura: user (direto)
        else if (userObj && typeof userObj === 'object') {
          userData = userObj;
          console.log('getCurrentUser - Usando user direto');
        }
        
        if (userData) {
          const extractedUser = {
            id: userData.id_apdata || userData.id || userData._id || userData.userId || 'SISTEMA',
            nome: userData.nome || userData.nomeCompleto || userData.name || userData.fullName || userData.usuario || 'Usuário Sistema',
            cargo: userData.cargo || userData.position || userData.funcao || userData.role || 'Não especificado',
            setor: userData.setor || userData.department || userData.departamento || userData.area || 'Não especificado',
            email: userData.e_mail || userData.email || userData.mail || userData.emailAddress || ''
          };
          
          console.log('getCurrentUser - Dados extraídos do sessionStorage:', extractedUser);
          
          // Se conseguiu extrair dados válidos, retornar
          if (extractedUser.id !== 'SISTEMA' && extractedUser.nome !== 'Usuário Sistema') {
            console.log('getCurrentUser - ✅ Dados válidos encontrados no sessionStorage');
            return extractedUser;
          }
        }
      } catch (parseError) {
        console.error('getCurrentUser - Erro ao parsear user do sessionStorage:', parseError);
      }
    }
    
    // 2. Se não conseguiu do sessionStorage, tentar outras fontes
    console.log('getCurrentUser - Tentando outras fontes de dados...');
    
    // Tentar localStorage como fallback
    const userLocalStr = localStorage.getItem('user');
    if (userLocalStr) {
      try {
        const userLocalObj = JSON.parse(userLocalStr);
        console.log('getCurrentUser - Objeto do localStorage:', userLocalObj);
        // Processar da mesma forma...
      } catch (e) {
        console.error('getCurrentUser - Erro no localStorage:', e);
      }
    }
    
    // 3. Como último recurso, criar um usuário padrão funcional
    console.warn('getCurrentUser - Usando dados padrão do sistema');
    const defaultUser = {
      id: 'RH_' + Date.now(),
      nome: 'Usuário RH',
      cargo: 'DP',
      setor: 'Departamento Pessoal',
      email: 'sistema@empresa.com'
    };
    
    console.log('getCurrentUser - Usuário padrão criado:', defaultUser);
    return defaultUser;
    
  } catch (error) {
    console.error('getCurrentUser - Erro geral:', error);
    
    // Em caso de erro, retornar um usuário padrão para não quebrar o fluxo
    return {
      id: 'SISTEMA_ERROR',
      nome: 'Usuário Sistema',
      cargo: 'Sistema',
      setor: 'TI',
      email: 'sistema@empresa.com'
    };
  }
}

class ApiServiceVaga {
  // Método de teste para debug do usuário
  static testUserData() {
    console.log('=== TESTE DE DADOS DO USUÁRIO ===');
    
    // 1. Verificar sessionStorage
    const userStr = sessionStorage.getItem('user');
    console.log('1. SessionStorage user:', userStr);
    
    if (!userStr) {
      console.error('❌ Nenhum usuário no sessionStorage');
      return null;
    }
    
    try {
      const userObj = JSON.parse(userStr);
      console.log('2. Objeto parseado:', userObj);
      
      // 3. Chamar getCurrentUser
      const result = getCurrentUser();
      console.log('3. Resultado getCurrentUser:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao parsear user:', error);
      return null;
    }
  }

  // Cadastrar vaga
  static async cadastrarVaga(vaga: Vaga): Promise<VagaResponse> {
    const response = await fetch(`${API_BASE}/vagas`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(vaga),
    });
    return response.json();
  }

  // Consultar vagas (todas ou por filtro)
  static async consultarVagas(filtros?: { [key: string]: string | number | boolean }): Promise<VagaResponse> {
    let url = `${API_BASE}/vagas`;

    if (filtros) {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      url += `?${params.toString()}`;
    }

    console.log(`URL consulta vagas: ${url}`);

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return response.json();
  }

  // Consultar vaga por código
  static async consultarVagaPorCodigo(codigo_vaga: string): Promise<VagaResponse> {
    const response = await fetch(`${API_BASE}/${codigo_vaga}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  }

  // Consultar aprovadores diretos
  static async consultarAprovadores(idUsuario: number): Promise<VagaResponse> {
    const response = await fetch(`${API_BASE}/usuario/aprovadores?idUsuario=${idUsuario}`, {
      method: "GET",
      //headers: getAuthHeaders(),
    });
    return response.json();
  }

  // Consultar aprovadores RH
  static async consultarAprovadoresRH(delegado: boolean): Promise<VagaResponse> {
    const response = await fetch(`${API_BASE}/usuario/aprovadores/rh?delegado=${delegado}`, {
      method: "GET",
      //headers: getAuthHeaders(),
    });
    return response.json();
  }

  // Aprovar vaga
  static async aprovarVaga(codigo_vaga: string, aprovador: { nome: string; setor: string }): Promise<VagaResponse> {
    const response = await fetch(`${API_BASE}/${codigo_vaga}/aprovar`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(aprovador),
    });
    return response.json();
  }

  // Rejeitar vaga
  static async rejeitarVaga(codigo_vaga: string, aprovador: { nome: string; setor: string }): Promise<VagaResponse> {
    const response = await fetch(`${API_BASE}/${codigo_vaga}/rejeitar`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(aprovador),
    });
    return response.json();
  }

  // Atualizar fase da vaga
  static async atualizarFaseVaga(
    codigo_vaga: string,
    fase_workflow: string,
    updatedAtName?: string
  ): Promise<VagaResponse> {
    // Recupera user e updatedAtName do sessionStorage se não forem passados
    let userName = updatedAtName;    
    
    if (!userName) {
      const currentUser = getCurrentUser();
      userName = currentUser?.nome;
    }
    
    const body = {
      fase_workflow,
      updatedAtName: userName
    };

    const response = await fetch(`${API_BASE}/vagas/${codigo_vaga}/atualizar`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return response.json();
  }

  // Atualizar fase da vaga com dados adicionais
  static async atualizarFaseVagaComDados(
    codigo_vaga: string,
    fase_workflow: string,
    dadosAdicionais?: {
      contratado_nome?: string;
      motivo_congelamento?: string;
      motivo_cancelamento?: string;
    },
    updatedAtName?: string
  ): Promise<VagaResponse> {
    // Recupera user e updatedAtName do sessionStorage se não forem passados
    let userName = updatedAtName;
    
    if (!userName) {
      const currentUser = getCurrentUser();
      userName = currentUser?.nome;
    }
    
    const body = {
      fase_workflow,
      updatedAtName: userName,
      ...dadosAdicionais
    };

    const response = await fetch(`${API_BASE}/vagas/${codigo_vaga}/fase`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return response.json();
  }
  // Criar vagas em lote baseadas em funcionários desligados
  /*static async criarVagasEmLote(desligados: any[]): Promise<{
    success: boolean;
    message?: string;
    data?: {
      vagas?: any[];
      vagasCriadas?: any[];
      totalProcessados?: number;
    };
  }> {*/

static async criarVagasEmLote(desligados: any[]): Promise<VagaResponse> {
    console.log('=== CRIAÇÃO DE VAGAS EM LOTE ===');
    console.log('1. Desligados recebidos:', desligados.length);
    
    // Obter dados do usuário logado
    console.log('2. Chamando getCurrentUser()...');
    const usuarioLogado = getCurrentUser();
    
    console.log('3. Usuário logado extraído:', usuarioLogado);
    console.log('4. Tipo do usuário:', typeof usuarioLogado);
    
    // O usuário nunca deve ser null agora, mas vamos garantir
    if (!usuarioLogado) {
      console.error('❌ Erro crítico: getCurrentUser retornou null');
      throw new Error('Erro interno: não foi possível obter dados do usuário');
    }
    
    console.log('5. ✅ Usuário validado:', {
      id: usuarioLogado.id,
      nome: usuarioLogado.nome,
      cargo: usuarioLogado.cargo,
      setor: usuarioLogado.setor
    });
    
    const payload = {
      desligados,
      usuarioLogado
    };
    
    console.log('6. Payload que será enviado:');
    console.log('   - Desligados:', payload.desligados.length, 'itens');
    console.log('   - Usuário (resumo):', {
      id: payload.usuarioLogado.id,
      nome: payload.usuarioLogado.nome
    });
    
    try {
      console.log('7. Enviando requisição para:', `${API_BASE}/vagas/lote`);
      
      const response = await fetch(`${API_BASE}/vagas/lote`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      
      console.log('8. Resposta da API:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na API:', errorText);
        throw new window.Error(`Erro na API: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('9. ✅ Resultado da API:', result);
      console.log('=== FIM DA CRIAÇÃO DE VAGAS ===');
      
      return result;
      
    } catch (error) {
      console.error('❌ Erro durante a requisição:', error);
      throw error;
    }
  }

}

export default ApiServiceVaga;