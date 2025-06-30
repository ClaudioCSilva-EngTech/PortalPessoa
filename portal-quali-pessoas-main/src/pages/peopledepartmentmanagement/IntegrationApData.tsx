import React, { useState } from 'react';
import {
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Chip,
    Box,
    Snackbar,
    Alert,
} from '@mui/material';
import { Button, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { UploadFile, Close } from '@mui/icons-material';

const initialListEmployee = [{
    idColaborador: "3246",
    nome: "Patrícia Gomes",
    setor: "Marketing",
    gestorDireto: "Maria Oliveira",
    cargo: "Gerente de Mídias Sociais",
    dataAdmissao: "12 Set 2023",
    dataDesligamento: "",
    dataUltimoRecesso: "",
    recessoAberto: true,
    tipoContrato: "CLT",
    empresa: "QualiBanking"
}];

// Define os cabeçalhos da tabela
const headCells = [
    { id: 'idColaborador', label: 'Funcional', sortable: true },
    { id: 'nome', label: 'Nome', sortable: true },
    { id: 'setor', label: 'Setor', sortable: false },
    { id: 'gestorDireto', label: 'Gestor Direto', sortable: false },
    { id: 'cargo', label: 'Cargo', sortable: false },
    { id: 'dataAdmissao', label: 'Data de Admissão', sortable: false },
    { id: 'dataDesligamento', label: 'Data de Desligamento', sortable: false },
    { id: 'dataUltimoRecesso', label: 'Data Último Recesso', sortable: false },
    { id: 'recessoAberto', label: 'Férias Pendentes', sortable: true },
    { id: 'tipoContrato', label: 'Tipo Contrato', sortable: false },
    { id: 'empresa', label: 'Empresa', sortable: true },
];

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator<Key extends keyof unknown | string>(
    order: 'asc' | 'desc',
    orderBy: Key
): (a: { [key in Key]: unknown }, b: { [key in Key]: unknown }) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

const RecessoAbertoChip = ({ value }: { value: boolean }) => {
    const color =
        value === true ? 'error' : value === false ? 'success' : 'warning';
    return <Chip label={value} color={color} size="small" />;
};

const IntegrationApData: React.FC = () => {
    const [employee, setEmployee] = useState(initialListEmployee);
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [orderBy, setOrderBy] = useState<keyof typeof initialListEmployee[0]>("nome");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [lastUpload, setLastUpload] = useState<Date | null>(null);
    const [openUpload, setOpenUpload] = useState(false);

    const handleRequestSort = (property: keyof typeof initialListEmployee[0]) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // CSV upload handler
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            // Simple CSV parsing (assume header matches headCells order)
            const lines = text.split('\n').filter(Boolean);
            const data = lines.slice(1).map(line => {
                const values = line.split(',');
                return {
                    idColaborador: values[0],
                    nome: values[1],
                    setor: values[2],
                    gestorDireto: values[3],
                    cargo: values[4],
                    dataAdmissao: values[5],
                    dataDesligamento: values[6],
                    dataUltimoRecesso: values[7],
                    recessoAberto: values[8]?.trim().toLowerCase() === 'true',
                    tipoContrato: values[9],
                    empresa: values[10],
                };
            });
            setEmployee(data);
            setSnackbarOpen(true);
            setLastUpload(new Date());
            setOpenUpload(false);
        };
        reader.readAsText(file);
    };

    // Componente de upload para modal
    const UploadDialogContent = (
        <Box
            sx={{
                width: { xs: '100%', sm: 420 },
                bgcolor: "#fff",
                borderRadius: 3,
                boxShadow: 2,
                p: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 2
            }}
        >
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Upload de Arquivo de Integração
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
                Clique ou arraste e solte o arquivo
            </Typography>
            <Box
                sx={{
                    border: "2px dashed #bbb",
                    borderRadius: 2,
                    width: "100%",
                    height: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                    bgcolor: "#fafafa",
                    position: "relative",
                    cursor: "pointer"
                }}
                onDragOver={e => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onDrop={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                        const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
                        handleFileUpload(fakeEvent);
                    }
                }}
            >
                <label
                    htmlFor="csv-upload-modal"
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        position: "absolute",
                        top: 0,
                        left: 0
                    }}
                >
                    <input
                        id="csv-upload-modal"
                        type="file"
                        accept=".csv"
                        style={{ display: "none" }}
                        onChange={handleFileUpload}
                    />
                    <Box sx={{ fontSize: 40, color: "#bbb", mb: 1 }}>
                        <UploadFile fontSize="inherit" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        No File Uploaded
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        0.00 KB
                    </Typography>
                </label>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 4 }, minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700, color: '#1976d2', mb: 4 }}>
                Lista de Colaboradores Importados do ApData
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<UploadFile />}
                    onClick={() => setOpenUpload(true)}
                >
                    Upload de Arquivo
                </Button>
            </Box>
            {employee.length === 0 ? (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                    <Typography variant="h6" color="text.secondary" component="h1" gutterBottom align="center" sx={{ fontWeight: 700, color: '#1976d2', mb: 2 }}>
                        Carregue a lista de colaboradores extraída do ApData
                    </Typography>
                    {/* Upload UI */}
                    {UploadDialogContent}
                </Box>
            ) : (
                <Box>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mb: 1 }}>
                        {lastUpload && (
                            <Typography variant="caption" color="text.secondary">
                                Último upload: {lastUpload.toLocaleString()}
                            </Typography>
                        )}
                    </Box>
                    <TableContainer component={Paper} elevation={0}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {headCells.map((headCell) => (
                                        <TableCell
                                            key={headCell.id}
                                            align="center"
                                            sx={{ fontWeight: 'bold' }}
                                            sortDirection={orderBy === headCell.id ? order : false}
                                        >
                                            {headCell.sortable ? (
                                                <TableSortLabel
                                                    active={orderBy === headCell.id}
                                                    direction={orderBy === headCell.id ? order : 'asc'}
                                                    onClick={() => handleRequestSort(headCell.id as keyof typeof initialListEmployee[0])}
                                                    IconComponent={undefined}
                                                >
                                                    {headCell.label}
                                                </TableSortLabel>
                                            ) : (
                                                headCell.label
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stableSort(employee, getComparator(order, orderBy)).map((row, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell align="center">{row.idColaborador}</TableCell>
                                        <TableCell align="center">{row.nome}</TableCell>
                                        <TableCell align="center">{row.setor}</TableCell>
                                        <TableCell align="center">{row.gestorDireto}</TableCell>
                                        <TableCell align="center">{row.cargo}</TableCell>
                                        <TableCell align="center">{row.dataAdmissao}</TableCell>
                                        <TableCell align="center">{row.dataDesligamento}</TableCell>
                                        <TableCell align="center">{row.dataUltimoRecesso}</TableCell>
                                        <TableCell align="center">
                                            <RecessoAbertoChip value={row.recessoAberto} />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={row.tipoContrato}
                                                color={
                                                    row.tipoContrato === 'CLT'
                                                        ? 'primary'
                                                        : row.tipoContrato === 'PJ'
                                                            ? 'error'
                                                            : row.tipoContrato === 'Estágio'
                                                                ? 'warning'
                                                                : 'info'
                                                }
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="center">{row.empresa}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}
            <Dialog
                open={openUpload}
                onClose={() => setOpenUpload(false)}
                fullWidth
                maxWidth="xs"
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        p: 0,
                        top: { xs: "auto", sm: 40 },
                        m: 0,
                    }
                }}
            >
                <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 0 }}>
                    <Typography variant="h6" fontWeight={700}>Upload de Arquivo</Typography>
                    <IconButton onClick={() => setOpenUpload(false)}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 0 }}>
                    {UploadDialogContent}
                </DialogContent>
            </Dialog>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    Upload Realizado
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default IntegrationApData;