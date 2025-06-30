import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  TextField, Button, Select, MenuItem, FormControl, InputLabel, Paper, Typography, Grid, Snackbar, Alert,
} from '@mui/material';
import '../../styles/PeopleDepartmentManagement.css';

const validationSchema = yup.object({
  tipoSolicitacao: yup.string().required('O Tipo de Solicitação é obrigatório'),
  // ...demais validações
});

const colaboradoresList = [
  'Monike kinberly Souza Santos',
  'Arnold Schwarzenegger da Silva',
  // ...demais nomes
];

const FormRequestApData: React.FC = () => {
  // ...lógica do formulário (igual ao seu arquivo)
  // Remova estilos inline dos elementos e use classes CSS para ajustes de layout

  return (
    <Paper className="form-request-ap-container">
      <Typography variant="h4" align="center" gutterBottom>
        Gestão de Equipes - ApData
      </Typography>
      <form>
        {/* ...demais campos */}
        <Button variant="contained" color="success" type="submit">
          Enviar Solicitação
        </Button>
      </form>
      {/* Snackbar e outros componentes */}
    </Paper>
  );
};

export default FormRequestApData;