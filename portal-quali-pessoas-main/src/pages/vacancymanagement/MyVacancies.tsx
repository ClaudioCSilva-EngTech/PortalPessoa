import React, { useState } from "react";
import {
    Paper,
    Grid,
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Typography,
    Avatar,
    Chip,
    Container,
    Box
} from "@mui/material";
import {
    FaMapMarkerAlt,
    FaBuilding,
    FaAccessibleIcon,
} from "react-icons/fa";
import StarIcon from "@mui/icons-material/Star";
import { styled } from '@mui/system';

const FormContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4, 18, 5, 8),
    margin: theme.spacing(0, 2, 0, 4),
    borderRadius: 24,
    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.08)',
    background: "#fafbfc"
}));

const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: (typeof theme.shape.borderRadius === 'number'
    ? theme.shape.borderRadius * 2 : parseInt(theme.shape.borderRadius, 10) * 2),
    boxShadow: '0 12px 20px 10px rgba(0,0,0,0.07)',
    position: 'relative',
    minHeight: 280,
    maxHeight: 280,
    maxWidth: 360,
    minWidth: 360,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'visible'
}));

const TalentBadge = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 20,
    right: 4,
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    background: '#e3f0ff',
    color: '#1976d2',
    borderRadius: (typeof theme.shape.borderRadius === 'number'
    ? theme.shape.borderRadius * 2 : parseInt(theme.shape.borderRadius, 10) * 2),
    padding: theme.spacing(0, 2, 0, 0),//'2px 10px',
    fontWeight: 500,
    fontSize: 12,
    boxShadow: '10 5px 4px rgba(25, 118, 210, 0.08)'
}));

const MyVacancies: React.FC = () => {
    const [jobs] = useState([
        {
            id: 1,
            title: "Engenheiro de Software Fullstack",
            location: "São Paulo - SP",
            type: "Presencial",
            workModel: "Efetivo",
            description: "Desenvolvedor(a) de Software fullstack com experiência em React e Node.js.",
            company: "QualiBanking",
            logo: "https://via.placeholder.com/50/ff007f/ffffff?text=Ach%C3%A9",
            publishedDate: "27/05/2025",
            isPcd: true,
            isAffirmative: false,
            bank: false,
        },
        {
            id: 2,
            title: "OPERADOR(A) Telemarketing",
            location: "Banco de Talentos",
            type: "Banco de Talentos",
            workModel: "",
            description: "",
            company: "#VemSerQuali",
            logo: "https://via.placeholder.com/50/228b22/ffffff?text=Eco",
            publishedDate: "27/05/2025",
            isPcd: false,
            isAffirmative: true,
            bank: true,
        },
        {
            id: 3,
            title: "Consultor de Vendas",
            location: "São Paulo - SP",
            type: "Presencial",
            workModel: "Efetivo",
            description: "Consultor de Vendas com foco em crédito Consignados.",
            company: "QualiConsig",
            logo: "https://via.placeholder.com/50/1e90ff/ffffff?text=EN",
            publishedDate: "27/05/2025",
            isPcd: false,
            isAffirmative: false,
            bank: false,
        },
        {
            id: 4,
            title: "Operador(a) de Telemarketing (Ativo)",
            location: "São Paulo - SP",
            type: "Presencial",
            workModel: "Estágio",
            description: "Formalização de contratos de crédito Consignados.",
            company: "QualiConsig",
            logo: "https://via.placeholder.com/50/1e90ff/ffffff?text=EN",
            publishedDate: "27/05/2025",
            isPcd: false,
            isAffirmative: true,
            bank: false,
        },
    ]);

    return (
        <FormContainer>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700, color: '#1976d2', mb: 4 }}>
                Minhas Vagas
            </Typography>
            <Container maxWidth="lg" sx={{ py: 2, margin: 8 }}>
                <Grid container spacing={3}>
                    {jobs.map((job) => (
                        <Grid key={job.id}>
                            <StyledCard>
                                {/* Selo Banco de Talentos */}
                                {job.bank && (
                                    <TalentBadge>
                                        <StarIcon sx={{ fontSize: 14, color: "#1976d2", mr: 0.5 }} />
                                        Banco de Talentos
                                    </TalentBadge>
                                )}
                                <CardHeader
                                    avatar={
                                        <Avatar src={job.logo} alt={job.company} sx={{ width: 48, height: 48 }} />
                                    }
                                    title={
                                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#222", fontSize: 17, mb: 0.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>
                                            {job.company}
                                        </Typography>
                                    }
                                    sx={{ pb: 0, alignItems: "flex-start" }}
                                />
                                <CardContent sx={{ pt: 1 }}>
                                    <Typography variant="h6" fontWeight={600} sx={{ mb: 1, fontSize: 16, color: "#222", minHeight: 48, whiteSpace: "pre-line", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {job.title}
                                    </Typography>
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
                                        <Chip
                                            icon={<FaMapMarkerAlt />}
                                            label={job.location}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontWeight: 500, bgcolor: "#fff" }}
                                        />
                                        <Chip
                                            icon={<FaBuilding />}
                                            label={job.type}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontWeight: 500, bgcolor: "#fff" }}
                                        />
                                        {job.workModel && (
                                            <Chip
                                                label={job.workModel}
                                                size="small"
                                                color="info"
                                                variant="outlined"
                                                sx={{ fontWeight: 500, bgcolor: "#fff" }}
                                            />
                                        )}
                                        {job.isPcd && (
                                            <Chip
                                                icon={<FaAccessibleIcon />}
                                                label="Também p/ PcD"
                                                size="small"
                                                color="success"
                                                variant="outlined"
                                                sx={{ fontWeight: 500, bgcolor: "#fff" }}
                                            />
                                        )}
                                    </Box>
                                    {job.description && (
                                        <Typography variant="body2" color="text.secondary" sx={{ minHeight: 32 }}>
                                            {job.description}
                                        </Typography>
                                    )}
                                </CardContent>
                                <CardActions sx={{ justifyContent: "flex-start", px: 2, pb: 2, pt: 0 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Publicada em: {job.publishedDate}
                                    </Typography>
                                </CardActions>
                            </StyledCard>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </FormContainer>
    );
};

export default MyVacancies;