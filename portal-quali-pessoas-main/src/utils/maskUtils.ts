/**
 * Utilitários para máscaras de campos de formulário
 */

/**
 * Aplica máscara para telefone
 * @param value - valor do telefone
 * @returns string com máscara aplicada
 */
export const phoneMask = (value: string): string => {
  // Remove todos os caracteres não numéricos
  const cleaned = value.replace(/\D/g, '');
  
  // Aplica a máscara baseada no tamanho
  if (cleaned.length <= 2) {
    return `(${cleaned}`;
  } else if (cleaned.length <= 3) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  } else if (cleaned.length <= 7) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 3)} ${cleaned.slice(3)}`;
  } else if (cleaned.length <= 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  } else {
    // Limita a 11 dígitos
    const truncated = cleaned.slice(0, 11);
    return `(${truncated.slice(0, 2)}) ${truncated.slice(2, 3)} ${truncated.slice(3, 7)}-${truncated.slice(7)}`;
  }
};

/**
 * Aplica máscara para CPF
 * @param value - valor do CPF
 * @returns string com máscara aplicada
 */
export const cpfMask = (value: string): string => {
  // Remove todos os caracteres não numéricos
  const cleaned = value.replace(/\D/g, '');
  
  // Aplica a máscara baseada no tamanho
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  } else if (cleaned.length <= 9) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  } else {
    // Limita a 11 dígitos
    const truncated = cleaned.slice(0, 11);
    return `${truncated.slice(0, 3)}.${truncated.slice(3, 6)}.${truncated.slice(6, 9)}-${truncated.slice(9)}`;
  }
};

/**
 * Valida se um email é válido
 * @param email - email a ser validado
 * @returns boolean indicando se é válido
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida se um CPF é válido
 * @param cpf - CPF a ser validado
 * @returns boolean indicando se é válido
 */
export const validateCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cleaned = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleaned.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  // Calcula o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) digit1 = 0;
  
  // Calcula o segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) digit2 = 0;
  
  // Verifica se os dígitos estão corretos
  return digit1 === parseInt(cleaned.charAt(9)) && digit2 === parseInt(cleaned.charAt(10));
};

/**
 * Valida se um telefone é válido
 * @param phone - telefone a ser validado
 * @returns boolean indicando se é válido
 */
export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  // Aceita telefones com 10 ou 11 dígitos (com ou sem 9 no celular)
  return cleaned.length >= 10 && cleaned.length <= 11;
};

/**
 * Calcula data de treinamento (5 dias úteis antes da admissão)
 * @param admissionDate - data de admissão
 * @returns data de treinamento
 */
export const calculateTrainingDate = (admissionDate: Date): Date => {
  const trainingDate = new Date(admissionDate);
  let businessDaysToSubtract = 5;
  
  while (businessDaysToSubtract > 0) {
    trainingDate.setDate(trainingDate.getDate() - 1);
    
    // Verifica se não é fim de semana (0 = domingo, 6 = sábado)
    if (trainingDate.getDay() !== 0 && trainingDate.getDay() !== 6) {
      businessDaysToSubtract--;
    }
  }
  
  return trainingDate;
};

/**
 * Formata data para string no formato brasileiro
 * @param date - data a ser formatada
 * @returns string no formato dd/mm/aaaa
 */
export const formatDateToBR = (date: Date): string => {
  return date.toLocaleDateString('pt-BR');
};

/**
 * Converte string de data brasileira para Date
 * @param dateString - string no formato dd/mm/aaaa
 * @returns Date object
 */
export const parseBRDate = (dateString: string): Date | null => {
  const parts = dateString.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
  const year = parseInt(parts[2], 10);
  
  const date = new Date(year, month, day);
  
  // Verifica se a data é válida
  if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
    return null;
  }
  
  return date;
};
