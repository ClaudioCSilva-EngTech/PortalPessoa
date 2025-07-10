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
    const userStr = sessionStorage.getItem('user');
    if (!userStr) return null;
    
    const userObj = JSON.parse(userStr);
    const detalhes = userObj?.data?.detalhes;
    
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

class ApiServiceVaga {
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

  // Métodos para gerenciar desligados
  static async verificarDesligadosExistentes(idsContratados: string[]): Promise<any> {
    const response = await fetch(`${API_BASE}/desligados/check-existing`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ idsContratados }),
    });
    return response.json();
  }

  static async salvarDesligados(desligados: any[]): Promise<any> {
    const response = await fetch(`${API_BASE}/desligados`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ desligados }),
    });
    return response.json();
  }

  static async criarVagasEmLote(desligados: any[]): Promise<VagaResponse> {
    // Obter dados do usuário logado
    const usuarioLogado = getCurrentUser();
    
    // Validar se o usuário está logado
    if (!usuarioLogado) {
      console.error('Usuário não encontrado para criação de vagas em lote');
      return {
        success: false,
        message: 'Usuário não encontrado. Faça login novamente.',
        data: [] as any
      };
    }
    
    console.log('Criando vagas em lote com usuário:', usuarioLogado);
    
    const response = await fetch(`${API_BASE}/vagas/lote`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        desligados,
        usuarioLogado 
      }),
    });
    
    const result = await response.json();
    console.log('Resultado da criação de vagas em lote:', result);
    
    return result;
  }
}

export default ApiServiceVaga;