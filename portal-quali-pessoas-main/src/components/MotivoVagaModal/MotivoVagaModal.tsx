import React, { useState } from 'react';
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
  IconButton
} from '@mui/material';
import { Block, Cancel, Close, PauseCircle } from '@mui/icons-material';

interface MotivoVagaModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => Promise<void>;
  vaga: any;
  tipo: 'congelar' | 'cancelar'; // Tipo de ação
}

const MotivoVagaModal: React.FC<MotivoVagaModalProps> = ({
  open,
  onClose,
  onConfirm,
  vaga,
  tipo
}) => {
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const config = {
    congelar: {
      title: 'Congelar Vaga',
      icon: <PauseCircle sx={{ color: 'warning.main' }} />,
      color: 'warning' as const,
      action: 'congelar',
      actionText: 'Congelar',
      actioningText: 'Congelando...',
      description: 'Ao congelar a vaga, ela será pausada temporariamente e poderá ser reativada posteriormente.',
      placeholder: 'Ex: Aguardando aprovação de orçamento, reestruturação do setor...'
    },
    cancelar: {
      title: 'Cancelar Vaga',
      icon: <Block sx={{ color: 'error.main' }} />,
      color: 'error' as const,
      action: 'cancelar',
      actionText: 'Cancelar',
      actioningText: 'Cancelando...',
      description: 'Ao cancelar a vaga, ela será definitivamente encerrada e não poderá mais receber candidatos.',
      placeholder: 'Ex: Não há mais necessidade, mudança de estratégia da empresa...'
    }
  };

  const currentConfig = config[tipo];

  const handleSubmit = async () => {
    if (!motivo.trim()) {
      setError(`Motivo para ${currentConfig.action} é obrigatório`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onConfirm(motivo.trim());
      setMotivo('');
      onClose();
    } catch {
      setError(`Erro ao ${currentConfig.action} vaga. Tente novamente.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setMotivo('');
    setError('');
    onClose();
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
          {currentConfig.icon}
          <Typography variant="h6" fontWeight={700}>
            {currentConfig.title}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Você está prestes a {currentConfig.action} a vaga:
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

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label={`Motivo para ${currentConfig.action} *`}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          placeholder={currentConfig.placeholder}
          error={!!error && !motivo.trim()}
          helperText={!!error && !motivo.trim() ? "Campo obrigatório" : ""}
          disabled={submitting}
          sx={{ mb: 2 }}
        />

        <Alert severity={currentConfig.color} sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Atenção:</strong> {currentConfig.description}
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
          color={currentConfig.color}
          disabled={submitting || !motivo.trim()}
          startIcon={submitting ? <CircularProgress size={20} /> : currentConfig.icon}
        >
          {submitting ? currentConfig.actioningText : currentConfig.actionText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MotivoVagaModal;
