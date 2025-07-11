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
import { CheckCircle, Cancel, Close } from '@mui/icons-material';

interface FinalizarVagaModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (contratadoNome: string) => Promise<void>;
  vaga: any;
}

const FinalizarVagaModal: React.FC<FinalizarVagaModalProps> = ({
  open,
  onClose,
  onConfirm,
  vaga
}) => {
  const [contratadoNome, setContratadoNome] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!contratadoNome.trim()) {
      setError('Nome do contratado é obrigatório');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onConfirm(contratadoNome.trim());
      setContratadoNome('');
      onClose();
    } catch {
      setError('Erro ao finalizar vaga. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setContratadoNome('');
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

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Nome do Contratado *"
          value={contratadoNome}
          onChange={(e) => setContratadoNome(e.target.value)}
          fullWidth
          variant="outlined"
          placeholder="Digite o nome completo do contratado"
          error={!!error && !contratadoNome.trim()}
          helperText={!!error && !contratadoNome.trim() ? "Campo obrigatório" : ""}
          disabled={submitting}
          sx={{ mb: 2 }}
        />

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Atenção:</strong> Ao finalizar a vaga, ela será movida para a coluna "Finalizada" 
            e não poderá mais receber candidatos.
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
          disabled={submitting || !contratadoNome.trim()}
          startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircle />}
        >
          {submitting ? 'Finalizando...' : 'Finalizar Vaga'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FinalizarVagaModal;
