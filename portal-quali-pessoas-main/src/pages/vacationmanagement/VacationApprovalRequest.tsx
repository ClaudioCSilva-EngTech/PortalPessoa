import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  Chip,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonIcon from "@mui/icons-material/Person";

interface VacationApprovalRequestProps {
  open: boolean;
  onClose: () => void;
}

const gestoes = [
  {
    name: "Monica Ribeiro",
    role: "Product Manager",
    date: "01/07/2022",
    status: "pending",
    avatar: "",
    justification: "Só apenas e simplesmente não sou obrigada! Ela passou o mês inteiro me fazendo de besta.",
  },
  {
    name: "Amish Shiravadakar",
    role: "CEO",
    date: "15/06/2022",
    status: "approved",
    avatar: "",
    approvedDate: "18/06/2022",
  },
  {
    name: "Justine Marshall",
    role: "CEO",
    date: "04/05/2022",
    status: "approved",
    avatar: "",
    approvedDate: "04/05/2022",
  },
  {
    name: "Adoara Azubuike",
    role: "CEO",
    date: "21/04/2022",
    status: "rejected",
    avatar: "",
    rejectedDate: "21/04/2022",
  },
];

const steps = [
  "Aprovação do Gestor",
  "Aprovação do RH",
  "Contabilidade",
  "Assinatura",
];

const VacationApprovalRequest: React.FC<VacationApprovalRequestProps> = ({
  open,
  onClose,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 0 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Chip
            label="APROVAÇÃO DO GESTOR"
            color="warning"
            sx={{ fontWeight: 700, fontSize: 13 }}
          />
          <Chip
            label="1/4"
            color="primary"
            sx={{ fontWeight: 700, fontSize: 13, bgcolor: "#e3e3fa", color: "#7b2ff2" }}
          />
        </Stack>
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
        <Box mt={1} mb={2}>
          <Stepper activeStep={0} alternativeLabel>
            {steps.map((label, idx) => (
              <Step key={label} completed={idx < 0}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={2}
          mb={2}
        >
          <Box textAlign="center">
            <Typography variant="caption" color="text.secondary">
              INÍCIO DAS FÉRIAS
            </Typography>
            <Typography fontWeight={700} color="primary">
              TER 09/04/2020
            </Typography>
          </Box>
          <Divider flexItem sx={{ mx: 2 }} />
          <Box textAlign="center">
            <Typography variant="caption" color="text.secondary">
              FINAL DAS FÉRIAS
            </Typography>
            <Typography fontWeight={700} color="primary">
              QUI 23/04/2020
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={4} mb={2}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              PAGAMENTO DAS FÉRIAS
            </Typography>
            <Typography color="error" fontWeight={700}>
              Até dia 25/08/2020
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              TOTAL DE DIAS
            </Typography>
            <Typography fontWeight={700}>20 dias</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              ABONO PECUNIÁRIO
            </Typography>
            <Typography fontWeight={700}>15 dias</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              ANTECIPAR 1ª PARCELA DO 13º
            </Typography>
            <Typography fontWeight={700}>Sim</Typography>
          </Box>
        </Stack>
        <Box mb={2}>
          <Typography variant="caption" color="text.secondary">
            JUSTIFICATIVA
          </Typography>
          <Typography>
            Só apenas e simplesmente não sou obrigada! Ela passou o mês inteiro me fazendo de besta.
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle2" mb={1}>
          GESTORES
        </Typography>
        <Box>
          {gestoes.map((g, idx) => (
            <Box
              key={g.name}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={1}
              sx={{
                bgcolor: idx === 0 ? "#f7f8fa" : "transparent",
                borderRadius: 2,
                p: 1,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "#e1bee7" }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography fontWeight={700}>{g.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {g.role}
                  </Typography>
                </Box>
              </Stack>
              <Typography color={idx === 0 ? "error" : "text.secondary"} fontWeight={700}>
                {g.date}
              </Typography>
              <Box>
                {g.status === "pending" && (
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Aprovar">
                      <IconButton color="success">
                        <CheckCircleIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reprovar">
                      <IconButton color="error">
                        <CancelIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                )}
                {g.status === "approved" && (
                  <Chip
                    label={`APROVADA EM ${g.approvedDate}`}
                    color="success"
                    icon={<CheckCircleIcon />}
                  />
                )}
                {g.status === "rejected" && (
                  <Chip
                    label={`REPROVADA EM ${g.rejectedDate}`}
                    color="error"
                    icon={<CancelIcon />}
                  />
                )}
              </Box>
            </Box>
          ))}
        </Box>
        <Box mt={2}>
          <Typography variant="caption" color="text.secondary">
            JUSTIFICATIVA
          </Typography>
          <Typography>
            Só apenas e simplesmente não sou obrigada! Ela passou o mês inteiro me fazendo de besta.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
        <Button
          variant="contained"
          sx={{
            background: "linear-gradient(90deg,#7b2ff2,#f357a8)",
            px: 6,
            fontWeight: 700,
            fontSize: 16,
            borderRadius: 3,
          }}
        >
          AVANÇAR
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VacationApprovalRequest;