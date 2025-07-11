import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { CheckCircle, Cancel, Close } from '@mui/icons-material';
import DatePickerField from '../DatePickerField/DatePickerField';
import {
  phoneMask,
  cpfMask,
  validateEmail,
  validateCPF,
  validatePhone,
  calculateTrainingDate,
  formatDateToBR,
  parseBRDate
} from '../../utils/maskUtils';

interface FinalizarVagaModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (dadosContratado: {
    nome: string;
    telefone: string;
    email: string;
    rg: string;
    cpf: string;
    admissao: string;
    treinamento: string;
    hierarquia: string;
    temTreinamento: boolean;
  }) => Promise<void>;
  vaga: any;
}

const FinalizarVagaModal: React.FC<FinalizarVagaModalProps> = ({
  open,
  onClose,
  onConfirm,
  vaga
}) => {
  const [contratadoNome, setContratadoNome] = useState('');
  const [contratadoTelefone, setContratadoTelefone] = useState('');
  const [contratadoAdmissao, setContratadoAdmissao] = useState('');
  const [contratadoRg, setContratadoRg] = useState('');
  const [contratadoCpf, setContratadoCpf] = useState('');
  const [contratadoEmail, setContratadoEmail] = useState('');
  const [contratadoTreinamento, setContratadoTreinamento] = useState('');
  const [contratadoHierarquia, setContratadoHierarquia] = useState('');
  const [temTreinamento, setTemTreinamento] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Atualiza automaticamente a data de treinamento quando a admissão muda
  useEffect(() => {
    if (contratadoAdmissao && temTreinamento) {
      const admissionDate = parseBRDate(contratadoAdmissao);
      if (admissionDate) {
        const trainingDate = calculateTrainingDate(admissionDate);
        setContratadoTreinamento(formatDateToBR(trainingDate));
      }
    } else if (!temTreinamento) {
      setContratadoTreinamento('');
    }
  }, [contratadoAdmissao, temTreinamento]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validações obrigatórias
    if (!contratadoNome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!contratadoTelefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (!validatePhone(contratadoTelefone)) {
      newErrors.telefone = 'Telefone inválido';
    }

    if (!contratadoEmail.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!validateEmail(contratadoEmail)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!contratadoRg.trim()) {
      newErrors.rg = 'RG é obrigatório';
    }

    if (!contratadoCpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validateCPF(contratadoCpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    if (!contratadoAdmissao.trim()) {
      newErrors.admissao = 'Data de admissão é obrigatória';
    } else if (!parseBRDate(contratadoAdmissao)) {
      newErrors.admissao = 'Data de admissão inválida';
    }

    if (temTreinamento && !contratadoTreinamento.trim()) {
      newErrors.treinamento = 'Data de treinamento é obrigatória';
    } else if (temTreinamento && contratadoTreinamento && !parseBRDate(contratadoTreinamento)) {
      newErrors.treinamento = 'Data de treinamento inválida';
    }

    if (!contratadoHierarquia.trim()) {
      newErrors.hierarquia = 'Hierarquia é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      await onConfirm({
        nome: contratadoNome.trim(),
        telefone: contratadoTelefone,
        email: contratadoEmail.trim(),
        rg: contratadoRg.trim(),
        cpf: contratadoCpf,
        admissao: contratadoAdmissao,
        treinamento: temTreinamento ? contratadoTreinamento : '',
        hierarquia: contratadoHierarquia.trim(),
        temTreinamento
      });
      handleClose();
    } catch {
      setErrors({ submit: 'Erro ao finalizar vaga. Tente novamente.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setContratadoNome('');
    setContratadoTelefone('');
    setContratadoAdmissao('');
    setContratadoRg('');
    setContratadoCpf('');
    setContratadoEmail('');
    setContratadoTreinamento('');
    setContratadoHierarquia('');
    setTemTreinamento(true);
    setErrors({});
    onClose();
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = phoneMask(e.target.value);
    setContratadoTelefone(maskedValue);
    if (errors.telefone) {
      setErrors(prev => ({ ...prev, telefone: '' }));
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = cpfMask(e.target.value);
    setContratadoCpf(maskedValue);
    if (errors.cpf) {
      setErrors(prev => ({ ...prev, cpf: '' }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContratadoEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case 'nome':
        setContratadoNome(value);
        break;
      case 'rg':
        setContratadoRg(value);
        break;
      case 'admissao':
        setContratadoAdmissao(value);
        break;
      case 'treinamento':
        setContratadoTreinamento(value);
        break;
      case 'hierarquia':
        setContratadoHierarquia(value);
        break;
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle sx={{ color: 'success.main' }} />
          <Typography variant="h6" fontWeight={700}>
            Finalizar Vaga
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Você está prestes a finalizar a vaga:
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Código:</strong> {vaga?.codigo_vaga}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Posição:</strong> {vaga?.detalhe_vaga?.posicaoVaga}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>Setor:</strong> {vaga?.detalhe_vaga?.setor}
          </Typography>
        </Box>

        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Nome - obrigatório */}
          <TextField
            label="Nome do Contratado *"
            value={contratadoNome}
            onChange={(e) => handleFieldChange('nome', e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="Digite o nome completo do contratado"
            error={!!errors.nome}
            helperText={errors.nome}
            disabled={submitting}
          />

          {/* Telefone e E-mail - mesma linha */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Telefone *"
              value={contratadoTelefone}
              onChange={handleTelefoneChange}
              sx={{ flex: 1 }}
              variant="outlined"
              placeholder="(00) 0 0000-0000"
              error={!!errors.telefone}
              helperText={errors.telefone}
              disabled={submitting}
            />

            <TextField
              label="E-mail *"
              type="email"
              value={contratadoEmail}
              onChange={handleEmailChange}
              sx={{ flex: 1 }}
              variant="outlined"
              placeholder="email@exemplo.com"
              error={!!errors.email}
              helperText={errors.email}
              disabled={submitting}
            />
          </Box>

          {/* RG e CPF - mesma linha */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="RG *"
              value={contratadoRg}
              onChange={(e) => handleFieldChange('rg', e.target.value)}
              sx={{ flex: 1 }}
              variant="outlined"
              placeholder="00.000.000-0"
              error={!!errors.rg}
              helperText={errors.rg}
              disabled={submitting}
            />

            <TextField
              label="CPF *"
              value={contratadoCpf}
              onChange={handleCpfChange}
              sx={{ flex: 1 }}
              variant="outlined"
              placeholder="000.000.000-00"
              error={!!errors.cpf}
              helperText={errors.cpf}
              disabled={submitting}
            />
          </Box>

          <DatePickerField
            label="Data de Admissão"
            value={contratadoAdmissao}
            onChange={(value) => handleFieldChange('admissao', value)}
            error={!!errors.admissao}
            helperText={errors.admissao}
            disabled={submitting}
            required
          />

          {/* Checkbox de Treinamento */}
          <FormControlLabel
            control={
              <Checkbox
                checked={temTreinamento}
                onChange={(e) => setTemTreinamento(e.target.checked)}
                disabled={submitting}
              />
            }
            label="Possui treinamento agendado"
          />

          {/* Data de Treinamento e Hierarquia - mesma linha */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            {temTreinamento && (
              <DatePickerField
                label="Data de Treinamento"
                value={contratadoTreinamento}
                onChange={(value) => handleFieldChange('treinamento', value)}
                error={!!errors.treinamento}
                helperText={errors.treinamento || "Data calculada automaticamente (5 dias úteis antes da admissão)"}
                disabled={submitting}
                required={temTreinamento}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Hierarquia *"
              value={contratadoHierarquia}
              onChange={(e) => handleFieldChange('hierarquia', e.target.value)}
              sx={{ flex: 1 }}
              variant="outlined"
              placeholder="Ex: Analista Júnior, Coordenador, Gerente..."
              error={!!errors.hierarquia}
              helperText={errors.hierarquia}
              disabled={submitting}
              fullWidth
            />
          </Box>
        </Box>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Atenção:</strong> Ao finalizar a vaga, ela será movida para a coluna "Finalizada" 
            e não poderá mais receber candidatos. Todos os campos marcados com * são obrigatórios.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={submitting}
          startIcon={<Cancel />}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="success"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircle />}
        >
          {submitting ? 'Finalizando...' : 'Finalizar Vaga'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FinalizarVagaModal;
