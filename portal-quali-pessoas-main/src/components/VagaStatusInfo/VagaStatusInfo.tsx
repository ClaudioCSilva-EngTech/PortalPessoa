import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { CheckCircle, PauseCircle, CancelOutlined } from '@mui/icons-material';

interface VagaStatusInfoProps {
  vaga: any;
}

const VagaStatusInfo: React.FC<VagaStatusInfoProps> = ({ vaga }) => {
  const renderFinalizadaInfo = () => {
    if (!vaga.contratado_nome) return null;
    
    return (
      <Alert severity="success" sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <CheckCircle sx={{ fontSize: 20 }} />
          <Typography variant="subtitle2" fontWeight={600}>
            Vaga Finalizada
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Contratado(a):</strong> {vaga.contratado_nome}
        </Typography>
        {vaga.data_finalizacao && (
          <Typography variant="body2">
            <strong>Data da Contratação:</strong> {new Date(vaga.data_finalizacao).toLocaleDateString('pt-BR')}
          </Typography>
        )}
      </Alert>
    );
  };

  const renderCongeladaInfo = () => {
    if (!vaga.motivo_congelamento) return null;
    
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <PauseCircle sx={{ fontSize: 20 }} />
          <Typography variant="subtitle2" fontWeight={600}>
            Vaga Congelada
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Motivo:</strong> {vaga.motivo_congelamento}
        </Typography>
        {vaga.data_congelamento && (
          <Typography variant="body2">
            <strong>Data do Congelamento:</strong> {new Date(vaga.data_congelamento).toLocaleDateString('pt-BR')}
          </Typography>
        )}
      </Alert>
    );
  };

  const renderCanceladaInfo = () => {
    if (!vaga.motivo_cancelamento) return null;
    
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <CancelOutlined sx={{ fontSize: 20 }} />
          <Typography variant="subtitle2" fontWeight={600}>
            Vaga Cancelada
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Motivo:</strong> {vaga.motivo_cancelamento}
        </Typography>
        {vaga.data_cancelamento && (
          <Typography variant="body2">
            <strong>Data do Cancelamento:</strong> {new Date(vaga.data_cancelamento).toLocaleDateString('pt-BR')}
          </Typography>
        )}
      </Alert>
    );
  };

  return (
    <Box>
      {renderFinalizadaInfo()}
      {renderCongeladaInfo()}
      {renderCanceladaInfo()}
    </Box>
  );
};

export default VagaStatusInfo;
