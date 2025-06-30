import React from "react";
import {
  Paper,
  Box,
  Avatar,
  Typography,
  Chip,
  Button,
  Stack,
  Grid,
  Container
} from "@mui/material";
import { FaUserTie } from "react-icons/fa";
import { styled } from '@mui/system';

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4, 35, 5, 10),
  margin: theme.spacing(0, 4, 0, 4),
  borderRadius: 24,
  boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.08)',
  background: "#fafbfc"
}));

/// INSCRITOS NO BANCO DE TALENTO
const DetailVacancy: React.FC = () => {
  const vacancy = {
    candidatePhoto: "",
    candidate: "Neymar Junior",
    cargo: "Engenheiro de Software Fullstack",
    location: "São Paulo - SP",
    salary: "R$ 12.000 - R$ 15.000",
    type: "Efetivo",
    modalityPreference: "Presencial",
    publishedDate: "27/05/2025",
    experience: "Desenvolvimento de sistemas web e APIs RESTful.",
    education: "Graduação em Ciência da Computação ou áreas correlatas.",
    skills: [
      { label: "React", color: "primary" },
      { label: "Node.js", color: "success" },
      { label: "TypeScript", color: "info" },
      { label: "Banco de Dados", color: "warning" },
    ],
    status: "Ativo",
    statusColor: "success",
    description:
      "Atuante na área de Engenheiro(a) de Software Fullstack com experiência de 10 anos com foco em qualidade e performance.",
  };

  return (
    <FormContainer>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700, color: '#1976d2', mb: 4 }}>
        Banco de Talentos
      </Typography>
      <Container maxWidth="lg" sx={{ py: 0 }}>
        <Box sx={{ p: 3, background: "#f7f8fa", minHeight: "100vh" }}>
          <Grid container justifyContent="center">
            <Grid>
              <Paper
                elevation={3}
                sx={{
                  borderRadius: 4,
                  p: { xs: 2, md: 4 },
                  mb: 4,
                  mt: 2,
                  background: "#fff",
                }}
              >
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    src={vacancy.candidatePhoto}
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: "#e0e0e0",
                      mr: 2,
                      fontSize: 32,
                    }}
                  >
                    <FaUserTie />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {vacancy.candidate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {vacancy.location} • {vacancy.type} • {vacancy.modalityPreference}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {vacancy.salary}
                    </Typography>
                  </Box>
                  <Box flex={1} />
                  <Chip
                    label={vacancy.status}
                    color={vacancy.statusColor as any}
                    sx={{ fontWeight: 600, fontSize: 15, px: 2 }}
                  />
                </Box>

                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{ mb: 1, color: "#222" }}
                >
                  {vacancy.experience}
                </Typography>

                <Typography variant="body1" sx={{ mb: 2 }}>
                  {vacancy.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Experiência:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {vacancy.experience}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Formação:
                  </Typography>
                  <Typography variant="body2">{vacancy.education}</Typography>
                </Box>

                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
                  {vacancy.skills.map((skill) => (
                    <Chip
                      key={skill.label}
                      label={skill.label}
                      color={skill.color as any}
                      variant="outlined"
                      sx={{ fontWeight: 500, mb: 1 }}
                    />
                  ))}
                </Stack>

                <Box display="flex" gap={2} mt={2}>
                  <Button variant="outlined" color="primary">
                    Ver mais
                  </Button>
                  <Button variant="contained" color="primary">
                    Classificar
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </FormContainer >
  );
};

export default DetailVacancy;