import React, { useState, useRef } from 'react';
import {
    Box,
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    TableSortLabel,
    Alert,
    CircularProgress,
    Divider
} from '@mui/material';
import UploadFile from '@mui/icons-material/UploadFile';
import Close from '@mui/icons-material/Close';
import '../../styles/IntegrationApData.scss';
import ApiServiceIntegracaoApData from '../../services/ApiServiceIntegracaoApData';


// Utilitário para exibir o chip de férias pendentes
/*const RecessoAbertoChip = ({ value }: { value: boolean }) => {
    const color =
        value === true ? 'error' : value === false ? 'success' : 'warning';
    return <Chip label={value ? 'Sim' : 'Não'} color={color} size="small" />;
};
*/

// Cabeçalhos da tabela
const headCells = [
    { id: 'id_apdata', label: 'Funcional', sortable: true },
    { id: 'nome', label: 'Nome', sortable: true },
    { id: 'setor', label: 'Setor', sortable: false },
    { id: 'gestorDireto', label: 'Gestor Direto', sortable: false },
    { id: 'cargo', label: 'Cargo', sortable: false },
    { id: 'colaboradorAtivo', label: 'Colaborador Ativo', sortable: false },
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

const initialListEmployee = [
    {
        id_apdata: "3246",
        nome: "Patrícia Gomes",
        setor: "Marketing",
        gestor: "Maria Oliveira",
        cargo: "Gerente de Mídias Sociais",
        dataAdmissao: "12 Set 2023",
        dataDesligamento: "",
        dataUltimoRecesso: "10 Jul 2024",
        recessoAberto: true,
        vinculo: "CLT",
        local: "QualiBanking"
    }
];


import { Tooltip } from '@mui/material';

const RecessoAbertoChip = ({ value, dataUltimoRecesso }: { value: boolean, dataUltimoRecesso: string }) => {
    const color = value === true ? 'error' : value === false ? 'success' : 'warning';
    return (
        <Tooltip title={dataUltimoRecesso ? `Último recesso: ${dataUltimoRecesso}` : ''} arrow>
            <Chip label={value ? 'Sim' : 'Não'} color={color} size="small" />
        </Tooltip>
    );
};

const ColaboradorAtivoCell = ({ dataDesligamento: dataRescisao, dataAdmissao }: { dataDesligamento: string, dataAdmissao: string }) => {
    const ativo = !dataRescisao;
    return ativo ? (
        <Tooltip title={dataAdmissao ? `Admitido em: ${dataAdmissao}` : ''} arrow>
            <Chip label="Sim" color="success" size="small" />
        </Tooltip>
    ) : (
        <Tooltip title={`Data de desligamento: ${dataRescisao}`} arrow>
            <Chip label="Não" color="error" size="small" />
        </Tooltip>
    );
};


const IntegrationApData: React.FC = () => {
    const [employee, setEmployee] = useState(initialListEmployee);
    const [order] = useState<'asc' | 'desc'>('asc');
    const [orderBy] = useState<keyof typeof initialListEmployee[0]>("nome");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success'|'error'|'info'|'warning'>('success');
    const [openUpload, setOpenUpload] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [previewRows, setPreviewRows] = useState<any[]>([]);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Carrega lista da API
    const fetchColaboradores = async () => {
        try {
            const res = await ApiServiceIntegracaoApData.listarColaboradores();
            console.log('Colaboradores response:', res);
            setEmployee(res.data || []);
        } catch {
            setSnackbarMsg('Erro ao carregar colaboradores');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    // Ao abrir modal, limpa preview
    const handleOpenUpload = () => {
        setOpenUpload(true);
        setUploadedFile(null);
        setPreviewRows([]);
        setPreviewError(null);
    };

    // Upload e preview
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadedFile(file);
        setUploading(true);
        setPreviewError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            // Preview: endpoint só para preview, não persiste
            const res = await ApiServiceIntegracaoApData.previewColaboradoresApData(formData);
            let preview = [];
            if (res.data && Array.isArray(res.data.preview)) {
                preview = res.data.preview;
            } else if (res.data && res.data.data && Array.isArray(res.data.data.preview)) {
                preview = res.data.data.preview;
            }
            setPreviewRows(preview);
            if (!preview || preview.length === 0) {
                setPreviewError('Arquivo processado, mas nenhum dado de preview retornado.');
            } else {
                setPreviewError(null);
            }
        } catch {
            setPreviewRows([]);
            setPreviewError('Erro ao processar arquivo.');
        } finally {
            setUploading(false);
        }
    };

    // Confirma upload e grava na base
    const handleConfirmUpload = async () => {
        if (!uploadedFile) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', uploadedFile);
            // Persistência só ocorre aqui!
            const res = await ApiServiceIntegracaoApData.importarColaboradoresApData(formData);
            if (res.data && (res.data.inseridos !== undefined || res.data.atualizados !== undefined || res.data.desconsiderados !== undefined)) {
                let msg = '';
                if (res.data.inseridos > 0) msg += `${res.data.inseridos} colaborador(es) incluído(s).\n`;
                if (res.data.atualizados > 0) msg += `${res.data.atualizados} colaborador(es) atualizado(s).\n`;
                if (res.data.desconsiderados > 0) msg += `${res.data.desconsiderados} registro(s) desconsiderado(s) por duplicidade.`;
                setSnackbarMsg(msg.trim());
                setSnackbarSeverity('info');
            } else if (res.data && res.data.message) {
                setSnackbarMsg(res.data.message);
                setSnackbarSeverity('info');
            } else {
                setSnackbarMsg('Colaboradores importados com sucesso!');
                setSnackbarSeverity('success');
            }
            setSnackbarOpen(true);
            setOpenUpload(false);
            fetchColaboradores();
        } catch {
            setSnackbarMsg('Erro ao importar colaboradores.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setUploading(false);
        }
    };

    React.useEffect(() => {
        fetchColaboradores();
    }, []);

    // Corrigir foco e aria-hidden: garantir que o foco não fique em elemento oculto
    React.useEffect(() => {
        if (!openUpload) {
            // Após fechar modal, mover foco para botão principal
            const btn = document.querySelector('.integration-btn-upload') as HTMLElement;
            if (btn) btn.focus();
        }
    }, [openUpload]);

    return (
        <Box className="people-department-container">
            <Box className="integration-main-container">
                <Box className="integration-header" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography className="integration-title">
                        Lista de Colaboradores Importados do ApData
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<UploadFile />}
                        className="integration-btn-upload"
                        onClick={handleOpenUpload}
                        sx={{ minWidth: 180 }}
                    >
                        Upload de Arquivo
                    </Button>
                </Box>
                <Box className="integration-table-container">
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
                                                    // Desabilitado: ordenação não implementada
                                                    // onClick={() => handleRequestSort(headCell.id as keyof typeof initialListEmployee[0])}
                                                    IconComponent={undefined}
                                                >
                                                    {String(headCell.label)}
                                                </TableSortLabel>
                                            ) : (
                                                String(headCell.label)
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stableSort(employee, getComparator(order, orderBy)).map((row, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell align="center">{row.id_apdata}</TableCell>
                                        <TableCell align="center">{row.nome}</TableCell>
                                        <TableCell align="center">{row.setor}</TableCell>
                                        <TableCell align="center">{row.gestor}</TableCell>
                                        <TableCell align="center">{row.cargo}</TableCell>
                                        <TableCell align="center">
                                            <ColaboradorAtivoCell dataDesligamento={row.dataDesligamento} dataAdmissao={row.dataAdmissao} />
                                        </TableCell>
                                        <TableCell align="center">
                                            <RecessoAbertoChip value={row.recessoAberto} dataUltimoRecesso={row.dataUltimoRecesso} />
                                        </TableCell>
                                        <TableCell align="center">{row.vinculo}</TableCell>
                                        <TableCell align="center">{row.local}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
                <Dialog
                    open={openUpload}
                    onClose={() => setOpenUpload(false)}
                    fullWidth
                    maxWidth="md"
                    PaperProps={{
                        sx: {
                            borderRadius: 4,
                            p: 0,
                            top: { xs: "auto", sm: 40 },
                            m: 0,
                            minWidth: { xs: '95vw', sm: 600, md: 900 },
                            width: { xs: '95vw', sm: 600, md: 900 },
                            maxWidth: '98vw',
                        }
                    }}
                >
                    <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 0 }}>
                        <Typography variant="h6" fontWeight={700}>Upload de Arquivo</Typography>
                        <IconButton onClick={() => setOpenUpload(false)}>
                            <Close />
                        </IconButton>
                    </DialogTitle>
                    <Divider />
                    <DialogContent sx={{ pt: 2 }}>
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Selecione um arquivo CSV ou Excel com os dados dos colaboradores
                            </Typography>
                            <Box
                                sx={{
                                    border: "2px dashed #bbb",
                                    borderRadius: 2,
                                    p: 3,
                                    bgcolor: "#fafafa",
                                    cursor: uploading ? 'not-allowed' : 'pointer',
                                    transition: "all 0.3s",
                                    mb: 2,
                                    position: 'relative',
                                    '&:hover': { borderColor: uploading ? '#bbb' : '#1976d2', bgcolor: uploading ? '#fafafa' : '#f5f5f5' }
                                }}
                                onClick={() => !uploading && fileInputRef.current?.click()}
                                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                                onDrop={e => {
                                    e.preventDefault(); e.stopPropagation();
                                    if (uploading) return;
                                    const file = e.dataTransfer.files?.[0];
                                    if (file) {
                                        const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
                                        handleFileChange(fakeEvent);
                                    }
                                }}
                            >
                                <input
                                    ref={fileInputRef}
                                    id="integration-upload"
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    style={{ display: "none" }}
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                                <UploadFile sx={{ fontSize: 48, color: "#bbb", mb: 2 }} />
                                <Typography variant="body1">
                                    Clique aqui ou arraste e solte o arquivo
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Formatos aceitos: CSV, Excel (.xlsx, .xls)
                                </Typography>
                            </Box>
                            {uploadedFile && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: "#e3f2fd", borderRadius: 1 }}>
                                    <Typography variant="body2">
                                        Arquivo selecionado: <strong>{uploadedFile.name}</strong>
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {(uploadedFile.size / 1024).toFixed(2)} KB
                                    </Typography>
                                </Box>
                            )}
                            {uploading && (
                                <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CircularProgress size={24} sx={{ mr: 2 }} />
                                    <Typography>Processando arquivo...</Typography>
                                </Box>
                            )}
                            {previewError && (
                                <Alert severity="error" sx={{ mt: 2 }}>{previewError}</Alert>
                            )}
                            {previewRows.length > 0 && !uploading && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Pré-visualização dos dados importados:</Typography>
                                    <Box sx={{ width: '100%', overflowX: 'auto' }}>
                                        <TableContainer component={Paper} sx={{ maxHeight: 320, minWidth: 600 }}>
                                            <Table size="small" stickyHeader>
                                                <TableHead>
                                                    <TableRow>
                                                        {Object.keys(previewRows[0]).map((col) => (
                                                            <TableCell key={col}>{col}</TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {previewRows.map((row, idx) => (
                                                        <TableRow key={idx}>
                                                            {Object.values(row).map((val, i) => (
                                                                <TableCell key={i}>{typeof val === 'string' || typeof val === 'number' ? val : String(val ?? '')}</TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                        <Button variant="outlined" onClick={() => setOpenUpload(false)} disabled={uploading}>Cancelar</Button>
                                        <Button variant="contained" color="primary" onClick={handleConfirmUpload} disabled={uploading} startIcon={<UploadFile />}>
                                            Confirmar e Importar
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </DialogContent>
                </Dialog>
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={4000}
                    onClose={() => setSnackbarOpen(false)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert severity={snackbarSeverity} sx={{ width: '100%' }}>{snackbarMsg}</Alert>
                </Snackbar>
            </Box>
        </Box>
    );
};

export default IntegrationApData;