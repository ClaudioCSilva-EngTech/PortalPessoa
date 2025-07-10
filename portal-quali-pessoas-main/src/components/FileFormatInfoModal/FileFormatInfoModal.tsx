import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  IconButton,
  Alert
} from '@mui/material';
import { Close, Download } from '@mui/icons-material';

interface FileFormatInfoModalProps {
  open: boolean;
  onClose: () => void;
}

const FileFormatInfoModal: React.FC<FileFormatInfoModalProps> = ({ open, onClose }) => {
  const requiredColumns = [
    { position: 0, name: 'Razão Social da Empresa', example: 'QUALICONSIG PROMOTORA DE VENDAS LTDA' },
    { position: 1, name: 'Local', example: 'QUALICONSIG - Tatuapé' },
    { position: 3, name: 'Sufixo do CNPJ', example: '0001-72' },
    { position: 6, name: 'Id Contratado', example: '180' },
    { position: 8, name: 'Nome Completo', example: 'DIEGO OSTI ALVES' },
    { position: 11, name: 'Vínculo', example: 'Empregado - Geral CLT' },
    { position: 12, name: 'Data da Admissão', example: '06/02/2019' },
    { position: 13, name: 'Cargo', example: 'ANALISTA DE CONTROL DESK PLENO' },
    { position: 17, name: 'Código de Estrutura', example: '06' },
    { position: 18, name: 'Centro de Custo', example: 'INTELIGENCIA' },
    { position: 20, name: 'Situação', example: 'Em Atividade Normal' },
    { position: 21, name: 'Data Início na Situação', example: '01/02/2025' },
    { position: 22, name: 'Data da Rescisão', example: '01/02/2025' },
    { position: 23, name: 'Data do Nascimento', example: '14/03/1997' },
    { position: 29, name: 'Estado Civil', example: 'Solteiro' },
    { position: 30, name: 'Grau de Instrução', example: 'Ensino Médio Completo' },
    { position: 31, name: 'Sigla Sexo', example: 'M' },
    { position: 63, name: 'Segmento Étnico e Racial', example: 'Branco' },
    { position: 64, name: 'Id Hierarquia', example: '1136' },
    { position: 65, name: 'Hierarquia', example: 'WILLIAM REGIS CARACA MENDES' }
  ];

  const handleDownloadExample = () => {
    // URL do arquivo de exemplo
    const link = document.createElement('a');
    link.href = '/base_employee/desligados_exemplo.csv';
    link.download = 'exemplo_desligados.csv';
    link.click();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          Formato do Arquivo de Desligados
        </Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Importante:</strong> O arquivo deve ter exatamente 66 colunas separadas por ponto e vírgula (;). 
              O sistema irá extrair apenas as colunas listadas abaixo, ignorando as demais.
            </Typography>
          </Alert>
          
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            Colunas Obrigatórias (posições específicas):
          </Typography>
          
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Posição</strong></TableCell>
                  <TableCell><strong>Nome da Coluna</strong></TableCell>
                  <TableCell><strong>Exemplo</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requiredColumns.map((column, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{column.position}</TableCell>
                    <TableCell>{column.name}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{column.example}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Formatos Aceitos:
          </Typography>
          <Typography variant="body2">• CSV com delimitador ponto e vírgula (;)</Typography>
          <Typography variant="body2">• Excel (.xlsx, .xls)</Typography>
          
          <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
            Validações:
          </Typography>
          <Typography variant="body2">• Id Contratado e Nome Completo são obrigatórios</Typography>
          <Typography variant="body2">• Funcionários já existentes não serão duplicados</Typography>
          <Typography variant="body2">• O sistema mostra um resumo antes de processar</Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleDownloadExample}
        >
          Baixar Exemplo
        </Button>
        <Button variant="contained" onClick={onClose}>
          Entendi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileFormatInfoModal;
