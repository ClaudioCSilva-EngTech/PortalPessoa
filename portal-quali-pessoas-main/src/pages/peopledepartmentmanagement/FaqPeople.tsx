import React, { useState, useRef } from "react";
import {
    Box,
    Grid,
    Typography,
    Card,
    CardContent,
    Divider,
    TextField,
    InputAdornment,
    IconButton,
    Paper,
    Button,
    Fade,
    Popper,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Badge,
    Tooltip,
    Slide
} from "@mui/material";
import {
    FaRegHeart,
    FaRegClock,
    FaRegFileAlt,
    FaUmbrellaBeach,
    FaMoneyCheckAlt,
    FaRegHospital,
    FaSearch,
    FaExclamationCircle,
    FaRegBell,
    FaComments
} from "react-icons/fa";
//import { useChat } from "../../components/ChatWidget/ChatContext";

const faqData = [
    {
        icon: <FaRegHeart size={32} color="#1976d2" />,
        title: "Meus Benefícios",
        questions: [
            {
                q: "Como consultar meus benefícios?",
                a: "Acesse o menu de benefícios no portal e visualize todos os benefícios disponíveis para você."
            },
            {
                q: "Como solicitar um novo benefício?",
                a: "Clique em 'Solicitar Benefício', preencha o formulário e aguarde a aprovação do RH."
            },
            {
                q: "Quais documentos preciso para solicitar benefícios?",
                a: "Os documentos necessários estão listados na página de solicitação de cada benefício."
            },
            {
                q: "Como acompanhar o status da minha solicitação?",
                a: "O status pode ser acompanhado na área 'Minhas Solicitações' do portal."
            }
        ]
    },
    {
        icon: <FaRegClock size={32} color="#1976d2" />,
        title: "Jornada de Trabalho",
        questions: [
            {
                q: "Como consultar minha jornada?",
                a: "Sua jornada está disponível no menu 'Jornada' do portal."
            },
            {
                q: "Como registrar ponto?",
                a: "Utilize o aplicativo ou o terminal de ponto físico para registrar suas entradas e saídas."
            },
            {
                q: "Como solicitar ajuste de ponto?",
                a: "Acesse 'Ajuste de Ponto', informe o motivo e envie para aprovação."
            },
            {
                q: "Como funciona o banco de horas?",
                a: "O banco de horas acumula horas extras e pode ser consultado no portal."
            }
        ]
    },
    {
        icon: <FaRegFileAlt size={32} color="#1976d2" />,
        title: "Políticas e Condutas",
        questions: [
            {
                q: "Onde encontro o código de conduta?",
                a: "O código de conduta está disponível na seção 'Documentos' do portal."
            },
            {
                q: "Como reportar uma conduta inadequada?",
                a: "Utilize o canal de ética disponível no portal para reportar condutas."
            },
            {
                q: "Quais são as principais políticas da empresa?",
                a: "As principais políticas estão listadas na área de 'Políticas' do portal."
            },
            {
                q: "Como acessar o manual do colaborador?",
                a: "O manual está disponível para download na seção 'Documentos'."
            }
        ]
    },
    {
        icon: <FaUmbrellaBeach size={32} color="#1976d2" />,
        title: "Minhas Férias",
        questions: [
            {
                q: "Como solicitar férias?",
                a: "Clique em 'Solicitar Férias', escolha o período e envie para aprovação."
            },
            {
                q: "Como consultar saldo de férias?",
                a: "Seu saldo está disponível na área de férias do portal."
            },
            {
                q: "Como remarcar minhas férias?",
                a: "Solicite a remarcação pelo mesmo menu de férias, informando o novo período."
            },
            {
                q: "Qual o prazo para aprovação das férias?",
                a: "O prazo é de até 5 dias úteis após a solicitação."
            }
        ]
    },
    {
        icon: <FaMoneyCheckAlt size={32} color="#1976d2" />,
        title: "Solicitação de Reembolsos",
        questions: [
            {
                q: "Como solicitar um reembolso?",
                a: "Acesse 'Reembolsos', preencha o formulário e anexe os comprovantes."
            },
            {
                q: "Quais despesas são reembolsáveis?",
                a: "Consulte a política de reembolsos na área de documentos."
            },
            {
                q: "Como acompanhar o status do reembolso?",
                a: "O status pode ser acompanhado na área 'Meus Reembolsos'."
            },
            {
                q: "Qual o prazo para pagamento do reembolso?",
                a: "O prazo é de até 10 dias úteis após aprovação."
            }
        ]
    },
    {
        icon: <FaRegHospital size={32} color="#1976d2" />,
        title: "Licenças e Atestados",
        questions: [
            {
                q: "Como enviar um atestado médico?",
                a: "Acesse 'Atestados', faça o upload do documento e aguarde análise."
            },
            {
                q: "Como solicitar licença maternidade/paternidade?",
                a: "Solicite pelo menu de licenças, anexando os documentos necessários."
            },
            {
                q: "Como consultar minhas licenças?",
                a: "Todas as licenças estão listadas na área 'Minhas Licenças'."
            },
            {
                q: "Qual o prazo para análise do atestado?",
                a: "O prazo é de até 3 dias úteis após o envio."
            }
        ]
    }
];

// Simulação de mensagens recebidas
const initialMessages = [
    { from: "RH", text: "Olá! Como podemos ajudar?", received: true },
    /*{ from: "Você", text: "Meu nome é João, pode tirar minha duvida.", received: false }*/
];

// Receba via prop: onNewMessage
const FaqPeople: React.FC<{ onNewMessage: (msg: any) => void }> = ({ onNewMessage }) => {
    //const { sendMessage } = useChat();
    const [search, setSearch] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
    const [highlightedQuestion, setHighlightedQuestion] = useState<string | null>(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState("");
    const [notificationCount, setNotificationCount] = useState(1);
    const [chatHasNew, setChatHasNew] = useState(false);
    const anchorRef = useRef<HTMLInputElement | null>(null);

    // Atualiza sugestões conforme digita
    React.useEffect(() => {
        if (search.length > 0) {
            const lower = search.toLowerCase();
            const temas = faqData
                .filter(faq => faq.title.toLowerCase().includes(lower))
                .map(faq => faq.title);
            setSuggestions(temas);
        } else {
            setSuggestions([]);
        }
    }, [search]);

    // Ao selecionar tema, mostra perguntas do tema e destaca se houver pergunta
    const handleSuggestionClick = (theme: string) => {
        setSelectedTheme(theme);
        setHighlightedQuestion(null);
        setSuggestions([]);
        setSearch("");
    };
/*
    // Ao clicar em pergunta na sugestão, destaca
    const handleQuestionClick = (theme: string, question: string) => {
        setSelectedTheme(theme);
        setHighlightedQuestion(question);
        setSuggestions([]);
        setSearch("");
    };
*/
    // Envio de mensagem no chat
    const handleSendMessage = () => {
        if (newMessage.trim() === "") return;
        setMessages(prev => [...prev, { from: "Você", text: newMessage, received: false }]);
        setNewMessage("");
        setTimeout(() => {
            setMessages(prev => [
                ...prev,
                { from: "RH", text: "Recebemos sua dúvida! Em breve responderemos.", received: true }
            ]);
            setNotificationCount(c => c + 1);
            setChatHasNew(true);
        }, 1200);
        // Quando quiser enviar mensagem global:
        onNewMessage({ text: "Nova mensagem do FAQ!", received: true });
        //sendMessage({ text: "Mensagem do FAQ", received: true });
    };

    // Ao abrir o chat, remove notificação
    const handleOpenChat = () => {
        setChatOpen(true);
        setChatHasNew(false);
        setNotificationCount(0);
    };

    // Busca dados do tema selecionado
    const themeData = selectedTheme
        ? faqData.find(faq => faq.title === selectedTheme)
        : null;

    // Renderização dos cards
    const renderCards = () => {
        const data = themeData ? [themeData] : faqData;
        return (
            <Grid container spacing={4} justifyContent="center">
                {data.map((faq) => (
                    <Grid key={faq.title}>
                        <Card
                            elevation={3}
                            sx={{
                                borderRadius: 2,
                                minHeight: 400,
                                maxHeight: 400,
                                maxWidth: 400,
                                minWidth: 400,
                                mx: "auto",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "stretch"
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                    {faq.icon}
                                    <Typography variant="h6" fontWeight={700} sx={{ ml: 1 }}>
                                        {faq.title}
                                    </Typography>
                                </Box>
                                <Divider sx={{ mb: 1 }} />
                                {faq.questions.map((q) => (
                                    <Box key={q.q}>
                                        <ListItemButton
                                            sx={{
                                                borderRadius: 1,
                                                bgcolor:
                                                    highlightedQuestion === q.q
                                                        ? "#e3f2fd"
                                                        : "transparent",
                                                mb: 0.5,
                                                px: 1,
                                                py: 0.5
                                            }}
                                            onClick={() => setHighlightedQuestion(q.q)}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight:
                                                                highlightedQuestion === q.q ? 700 : 400,
                                                            color: "#222"
                                                        }}
                                                    >
                                                        {q.q}
                                                    </Typography>
                                                }
                                            />
                                        </ListItemButton>
                                        {/* Resposta expandida */}
                                        {highlightedQuestion === q.q && (
                                            <Fade in>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        bgcolor: "#f5f5f5",
                                                        p: 2,
                                                        mb: 1,
                                                        borderLeft: "4px solid #1976d2"
                                                    }}
                                                >
                                                    <Typography variant="body2" sx={{ color: "#333" }}>
                                                        {q.a}
                                                    </Typography>
                                                </Paper>
                                            </Fade>
                                        )}
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
    };

    return (
        <Box
            sx={{
                px: { xs: 1, sm: 2, md: 6, lg: 12 },
                py: { xs: 2, sm: 3, md: 4 },
                width: "100%",
                maxWidth: "100vw",
                minHeight: "60vh",
                bgcolor: "#f9f9f9",
                position: "relative"
            }}
        >
            {/* SINO NO HEADER */}
            <Box sx={{ position: "absolute", top: 24, right: 32, zIndex: 10 }}>
                <Tooltip title="Mensagens RH">
                    <Badge badgeContent={notificationCount} color="error">
                        <FaRegBell size={28} />
                    </Badge>
                </Tooltip>
            </Box>

            <Typography variant="h4" fontWeight={700} align="center" sx={{ mb: 2, color: "#1976d2" }}>
                Dúvidas Frequentes (FAQ)
            </Typography>

            {/* Campo de pesquisa */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3, position: "relative" }}>
                <TextField
                    inputRef={anchorRef}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Pesquisar tema..."
                    size="small"
                    sx={{ width: { xs: "100%", sm: 400 }, bgcolor: "#fff" }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton>
                                    <FaSearch />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
                {/* Sugestões */}
                <Popper
                    open={suggestions.length > 0}
                    anchorEl={anchorRef.current}
                    placement="bottom-start"
                    style={{ zIndex: 1200, width: anchorRef.current?.offsetWidth || 300 }}
                >
                    <Paper elevation={3}>
                        <List dense>
                            {suggestions.map((s) => (
                                <ListItem key={s} disablePadding>
                                    <ListItemButton
                                        onClick={() => handleSuggestionClick(s)}
                                    >
                                        <ListItemText primary={s} />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Popper>
            </Box>

            {/* Cards FAQ */}
            {renderCards()}

            {/* Botão Pergunte ao RH */}
            <Slide direction="up" in mountOnEnter unmountOnExit>
                <Box
                    sx={{
                        position: "fixed",
                        bottom: 32,
                        right: 32,
                        zIndex: 2000
                    }}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{
                            borderRadius: "50%",
                            width: 64,
                            height: 64,
                            boxShadow: 4,
                            p: 0,
                            animation: chatHasNew
                                ? "pulse 1s infinite alternate"
                                : undefined,
                            "@keyframes pulse": {
                                from: { boxShadow: "0 0 0 0 #1976d2" },
                                to: { boxShadow: "0 0 16px 8px #1976d2" }
                            }
                        }}
                        onClick={handleOpenChat}
                    >
                        {chatHasNew ? (
                            <FaExclamationCircle size={28} color="#fff" />
                        ) : (
                            <FaComments size={28} color="#fff" />
                        )}
                    </Button>
                </Box>
            </Slide>

            {/* Chat RH */}
            <Slide direction="left" in={chatOpen} mountOnEnter unmountOnExit>
                <Paper
                    elevation={6}
                    sx={{
                        position: "fixed",
                        bottom: 24,
                        right: 24,
                        width: { xs: 320, sm: 380 },
                        height: 420,
                        borderRadius: 3,
                        display: "flex",
                        flexDirection: "column",
                        zIndex: 3000
                    }}
                >
                    {/* Header do chat */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, bgcolor: "#1976d2", borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                        <Typography sx={{ color: "#fff", fontWeight: 700 }}>People Chat</Typography>
                        <IconButton size="small" sx={{ color: "#fff" }} onClick={() => setChatOpen(false)}>
                            ×
                        </IconButton>
                    </Box>
                    {/* Mensagens */}
                    <Box sx={{ flex: 1, p: 2, overflowY: "auto", bgcolor: "#f9f9f9" }}>
                        {messages.map((msg, idx) => (
                            <Box
                                key={idx}
                                sx={{
                                    display: "flex",
                                    flexDirection: msg.received ? "row" : "row-reverse",
                                    mb: 1
                                }}
                            >
                                <Paper
                                    sx={{
                                        p: 1,
                                        bgcolor: msg.received ? "#fff" : "#e3f2fd",
                                        borderRadius: 2,
                                        maxWidth: "80%"
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "#222",
                                            fontWeight: msg.received ? 400 : 600
                                        }}
                                    >
                                        {msg.text}
                                    </Typography>
                                </Paper>
                            </Box>
                        ))}
                    </Box>
                    {/* Campo de envio */}
                    <Box sx={{ p: 2, borderTop: "1px solid #eee", bgcolor: "#fafafa", display: "flex", gap: 1 }}>
                        <TextField
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder="Digite sua mensagem aqui..."
                            size="small"
                            fullWidth
                            onKeyDown={e => {
                                if (e.key === "Enter") handleSendMessage();
                            }}
                        />
                        <Button variant="contained" color="primary" onClick={handleSendMessage}>
                            Enviar
                        </Button>
                    </Box>
                </Paper>
            </Slide>
        </Box>
    );
};

export default FaqPeople;