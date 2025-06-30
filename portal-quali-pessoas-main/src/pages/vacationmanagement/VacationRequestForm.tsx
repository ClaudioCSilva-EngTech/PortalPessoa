import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Stack,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface VacationRequestFormProps {
  open: boolean;
  onClose: () => void;
}

const VacationRequestForm: React.FC<VacationRequestFormProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Novas férias
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Tipo de férias</InputLabel>
              <Select label="Tipo de férias" defaultValue="colaborador">
                <MenuItem value="colaborador">Para um colaborador</MenuItem>
                <MenuItem value="outro">Outro tipo</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Colaborador</InputLabel>
              <Select label="Colaborador" defaultValue="Nuria Pelayo">
                <MenuItem value="Nuria Pelayo">Nuria Pelayo</MenuItem>
                {/* Adicione outros colaboradores aqui */}
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={4} alignItems="center">
            <Box>
              <Typography variant="caption" color="text.secondary">
                Saldo
              </Typography>
              <Typography variant="h6" color="primary">
                18 dias
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Dias selecionados
              </Typography>
              <Typography variant="h6" color="secondary">
                21 dias
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Dias restantes
              </Typography>
              <Typography variant="h6">0 dia</Typography>
            </Box>
          </Stack>
          <Divider />
          {/* Calendário fictício */}
          <Box>
            <Typography variant="subtitle2" mb={1}>
              Período das férias
            </Typography>
            <Box display="flex" gap={4}>
              <Box>
                <Typography fontWeight={600}>JULHO 2022</Typography>
                {/* Aqui você pode usar um componente de calendário real */}
                <Box sx={{ bgcolor: "#f7f8fa", borderRadius: 2, p: 2, mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    [Calendário]
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography fontWeight={600}>AGOSTO 2022</Typography>
                <Box sx={{ bgcolor: "#f7f8fa", borderRadius: 2, p: 2, mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    [Calendário]
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Justificativa"
              fullWidth
              multiline
              minRows={2}
              placeholder="Justificativa"
            />
            <Box>
              <Typography variant="subtitle2" mb={1}>
                Antecipar 1ª parcela do 13º?
              </Typography>
              <RadioGroup row defaultValue="não">
                <FormControlLabel value="sim" control={<Radio />} label="Sim" />
                <FormControlLabel value="não" control={<Radio />} label="Não" />
              </RadioGroup>
              <Typography variant="subtitle2" mt={2} mb={1}>
                Enviar para contador?
              </Typography>
              <RadioGroup row defaultValue="sim">
                <FormControlLabel value="sim" control={<Radio />} label="Sim" />
                <FormControlLabel value="não" control={<Radio />} label="Não" />
              </RadioGroup>
            </Box>
          </Stack>
          <Box>
            <Typography variant="subtitle2" mb={1}>
              O período de férias precisa atender aos seguintes requisitos:
            </Typography>
            <Stack spacing={0.5}>
              <Typography color="error">• Os dias selecionados não devem exceder o saldo disponível.</Typography>
              <Typography color="error">• É necessário tirar todos os 18 dias disponíveis.</Typography>
              <Typography color="success.main">• O início do gozo das férias não pode ocorrer durante o período de dois dias que antecede descanso semanal remunerado ou feriado.</Typography>
              <Typography color="success.main">• É necessário ter um período com pelo menos 14 dias.</Typography>
              <Typography color="success.main">• A data solicitada não pode interceder diferentes períodos consecutivos.</Typography>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button variant="contained" color="primary">
          Solicitar férias
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VacationRequestForm;