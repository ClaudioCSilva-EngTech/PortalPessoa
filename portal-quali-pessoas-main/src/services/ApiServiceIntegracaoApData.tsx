// ...existing code...
import axios from 'axios';

const API_BASE = import.meta.env.VITE_BFF_URL || 'localhost';

const ApiServiceIntegracaoApData = {
// ...existing code...
  async getColaboradorById(id_apdata: string) {
    // GET para buscar colaborador pelo id_apdata
    console.log(`Rota requisitada: ${API_BASE}/integracao-apdata/colaboradores/${id_apdata}`)

    const res = await axios.get(`${API_BASE}/integracao-apdata/colaboradores/${id_apdata}`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`
      }
    });
    return res.data;
  },

  async getColaboradoresByEstrutura(estrutura: string, role: string, id_apdata: string) {
    console.log(`Rota requisitada: ${API_BASE}/integracao-apdata/colaboradores/estrutura/${estrutura}?role=${role}&id_apdata=${id_apdata}`)

    // GET para buscar colaboradores por estrutura, filtrando por role e id_apdata
    const res = await axios.get(`${API_BASE}/integracao-apdata/colaboradores/estrutura/${estrutura}?role=${role}&id_apdata=${id_apdata}`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`
      }
    });
    return res.data.colaboradoresList || [];
  },
  async uploadColaboradoresApData(formData: FormData) {
    // POST para importar colaboradores do ApData
    return axios.post(`${API_BASE}/integracao-apdata/importar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${sessionStorage.getItem('token')}`
      }
    });
  },

  async listarColaboradores() {
    // GET para listar colaboradores importados
    return axios.get(`${API_BASE}/integracao-apdata/colaboradores`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`
      }
    });
  },

  async previewColaboradoresApData(formData: FormData) {
    // POST para preview dos colaboradores do ApData (não persiste)
    return axios.post(`${API_BASE}/integracao-apdata/preview`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${sessionStorage.getItem('token')}`
      }
    });
  },

  async importarColaboradoresApData(formData: FormData) {
    // POST para persistir colaboradores do ApData
    return axios.post(`${API_BASE}/integracao-apdata/importar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${sessionStorage.getItem('token')}`
      }
    });
  }
};

export default ApiServiceIntegracaoApData;
