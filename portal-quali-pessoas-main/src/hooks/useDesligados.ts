import { useState } from 'react';

export interface Desligado {
  _id?: string;
  razaoSocialEmpresa: string;
  local: string;
  sufixoCnpj: string;
  idContratado: string;
  nomeCompleto: string;
  vinculo: string;
  dataAdmissao: string;
  cargo: string;
  codigoEstrutura: string;
  centroCusto: string;
  situacao: string;
  dataInicioSituacao: string;
  dataRescisao: string;
  dataNascimento: string;
  estadoCivil: string;
  grauInstrucao: string;
  siglaSexo: string;
  segmentoEtnicoRacial: string;
  idHierarquia: string;
  hierarquia: string;
  dataInclusao: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExistingEmployee {
  idContratado: string;
  nomeCompleto: string;
  dataInclusao: string;
}

interface UseDesligadosReturn {
  loading: boolean;
  error: string | null;
  processarArquivoDesligados: (file: File) => Promise<{ success: boolean; existingEmployees: ExistingEmployee[]; newEmployees: Desligado[] }>;
}

const API_BASE = import.meta.env.VITE_BFF_URL;

function getAuthHeaders() {
  const token = sessionStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export const useDesligados = (): UseDesligadosReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseCSVLine = (line: string, delimiter: string = ';'): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const detectDelimiter = (text: string): string => {
    const firstLine = text.split('\n')[0];
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    
    return semicolonCount > commaCount ? ';' : ',';
  };

  const processarArquivoDesligados = async (file: File): Promise<{ success: boolean; existingEmployees: ExistingEmployee[]; newEmployees: Desligado[] }> => {
    setLoading(true);
    setError(null);

    try {
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file, 'UTF-8');
      });

      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length <= 1) {
        throw new Error('Arquivo deve conter pelo menos um cabeçalho e uma linha de dados');
      }

      // Detectar delimitador automaticamente
      const delimiter = detectDelimiter(text);

      // Parse das linhas (ignorando cabeçalho)
      const desligados: Desligado[] = lines.slice(1).map(line => {
        const values = parseCSVLine(line, delimiter);
        
        // Mapeamento das colunas conforme posições no arquivo CSV fornecido
        return {
          razaoSocialEmpresa: values[0] || '',
          local: values[1] || '',
          sufixoCnpj: values[3] || '', // Sufixo do CNPJ está na posição 3
          idContratado: values[6] || '', // Id Contratado está na posição 6
          nomeCompleto: values[8] || '', // Nome Completo está na posição 8
          vinculo: values[11] || '', // Vínculo está na posição 11
          dataAdmissao: values[12] || '', // Data da Admissão está na posição 12
          cargo: values[13] || '', // Cargo está na posição 13
          codigoEstrutura: values[17] || '', // Código de Estrutura está na posição 17
          centroCusto: values[18] || '', // Centro de Custo está na posição 18
          situacao: values[20] || '', // Situação está na posição 20
          dataInicioSituacao: values[21] || '', // Data Início na Situação está na posição 21
          dataRescisao: values[22] || '', // Data da Rescisão está na posição 22
          dataNascimento: values[23] || '', // Data do Nascimento está na posição 23
          estadoCivil: values[29] || '', // Estado Civil está na posição 29
          grauInstrucao: values[30] || '', // Grau de Instrução está na posição 30
          siglaSexo: values[31] || '', // Sigla Sexo está na posição 31
          segmentoEtnicoRacial: values[63] || '', // Segmento Étnico e Racial está na posição 63
          idHierarquia: values[64] || '', // Id Hierarquia está na posição 64
          hierarquia: values[65] || '', // Hierarquia está na posição 65
          dataInclusao: new Date().toISOString()
        };
      }).filter(d => d.idContratado && d.nomeCompleto); // Filtra apenas registros com dados essenciais

      if (desligados.length === 0) {
        throw new Error('Nenhum registro válido encontrado no arquivo');
      }

      // Verificar quais funcionários já existem na base
      const idsContratados = desligados.map(d => d.idContratado);
      const checkResponse = await fetch(`${API_BASE}/desligados/check-existing`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ idsContratados })
      });

      if (!checkResponse.ok) {
        throw new Error('Erro ao verificar funcionários existentes');
      }

      const checkResult = await checkResponse.json();
      const existingIds = new Set(checkResult.data?.existingIds || []);
      const existingEmployees: ExistingEmployee[] = checkResult.data?.existing || [];

      // Separar novos funcionários dos existentes
      const newEmployees = desligados.filter(d => !existingIds.has(d.idContratado));

      // Salvar apenas os novos funcionários
      if (newEmployees.length > 0) {
        const saveResponse = await fetch(`${API_BASE}/desligados`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ desligados: newEmployees })
        });

        if (!saveResponse.ok) {
          throw new Error('Erro ao salvar funcionários desligados');
        }
      }

      return {
        success: true,
        existingEmployees,
        newEmployees
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao processar arquivo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    processarArquivoDesligados
  };
};
