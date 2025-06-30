import React, { useState, useEffect } from "react";
import {
    FaChevronLeft, FaBars, FaPlaneDeparture, FaFileInvoiceDollar, FaHandHoldingHeart,
    FaTshirt, FaSlideshare, FaComments, FaHome//, FaEarlybirds, FaSearch, FaUserPlus, FaSignInAlt
} from "react-icons/fa";
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import DashBoardVacancies from "./DashBoardVacancies";
import Header from "../../components/Header/Header";

import "../../styles/VacancyManagement.scss"; // Use global styles

interface Props {
    initialComponent?: string;
    onComponentChange: (componentName: string, subComponentName?: string) => void;
    // onHomeClick: () => void;
}


const sidebarIcons = [
    { icon: <FaPlaneDeparture size={24} color="#0a2885" />, label: "Férias", key: "ferias" },
    { icon: <FaFileInvoiceDollar size={24} color="#0a2885" />, label: "Reembolsos", key: "reembolsos" },
    { icon: <FaHandHoldingHeart size={24} color="#0a2885" />, label: "Benefícios", key: "beneficios" },
    { icon: <FaTshirt size={24} color="#0a2885" />, label: "Uniformes", key: "uniformes" },
    { icon: <FaSlideshare size={24} color="#0a2885" />, label: "Treinamentos", key: "treinamentos" },
    { icon: <FaComments size={24} color="#0a2885" />, label: "RH Responde", key: "rhresponde" },
    { icon: <FaHome size={24} color="#0a2885" />, label: "Home", key: "homeresponde" },
];

const VacancyManagement: React.FC<Props> = ({ initialComponent, onComponentChange }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeComponent, setActiveComponent] = useState<string>(initialComponent || "Vacancies");
    //const [activeSub, setActiveSub] = useState<string | undefined>(undefined);
    const [showTooltip, setShowTooltip] = useState(false);
    //const [chatOpen, setChatOpen] = useState(false);
   //const [messages, setMessages] = useState([]);
   // const [notificationCount, setNotificationCount] = useState(0);

    //const [showTooltip, setShowTooltip] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    const handleSidebarIconClick = (key: string) => {
        // Implemente a navegação ou lógica desejada
        if (key === "homeresponde") {
            setActiveComponent("Vacancies");
        }
        // Adicione outras ações conforme necessário
    };
   /* const handleOpenChat = () => {
        setChatOpen(true);
        setNotificationCount(0);
    };
    /*
        const handleHomeClick = () => {
            // Aqui você pode validar o token/sessionStorage se quiser
            const user = sessionStorage.getItem('user');
            console.log(activeComponent)
            console.log(activeSub)
            if (user) {
                setActiveComponent("ShowCase");
                setActiveSub(undefined);
            } else setActiveComponent("ShowCase");
        };
    */
    const theme = createTheme({
        palette: {
            primary: { main: '#1976d2' },
            secondary: { main: '#dc004e' },
            success: { main: '#4caf50' },
        },
        components: {
            MuiTextField: {
                defaultProps: { variant: 'outlined' },
            },
        },
    });

    useEffect(() => {
        if (initialComponent) setActiveComponent(initialComponent);
    }, [initialComponent]);

    // Renderização dos componentes principais
    const MainComponent = <DashBoardVacancies />;
   // if (activeComponent === "Minhas Aprovações" || activeComponent === "aprovacoes") MainComponent = <ApprovalVacancies />;
   // else if (activeComponent === "Abrir Vagas" || activeComponent === "abrir-vagas") MainComponent = <NewVacancy />;
   // else if (activeComponent === "Minhas Vagas" || activeComponent === "minhas-vagas") MainComponent = <MyVacancy />;
   // else if (activeComponent === "Banco de Talentos" || activeComponent === "banco-talentos") MainComponent = <DetailVacancy />;

    return (
        <div className="app-container">
            <Header
                showTooltip={showTooltip}
                setShowTooltip={setShowTooltip}
                notificationCount={0}
                onMenuClick={setActiveComponent}
                activeMenu={activeComponent}
                onHomeClick={() => onComponentChange("ShowCase")}
            />
            <div className="job-search-layout">
                <aside className={`job-search-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
                    <button
                        className="job-search-sidebar-toggle"
                        onClick={toggleSidebar}
                        aria-label={isSidebarOpen ? "Fechar menu lateral" : "Abrir menu lateral"}
                    >
                        {isSidebarOpen ? <FaChevronLeft /> : <FaBars />}
                    </button>
                    {isSidebarOpen ? (
                        <div className="job-search-sidebar-content">
                            <h2>Pesquisa</h2>
                            <div className="filter-group">
                                <label htmlFor="company">Empresa</label>
                                <select id="company" className="filter-select">
                                    <option>Selecione ou digite</option>
                                    <option>QualiConsig</option>
                                    <option>QualiBanking</option>
                                    <option>GrupoQuali</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label htmlFor="jobType">Tipo de Vaga</label>
                                <select id="jobType" className="filter-select">
                                    <option>Selecione</option>
                                    <option>Temporária</option>
                                    <option>Estágio</option>
                                    <option>Efetivo</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>
                                    <input type="checkbox" /> Vagas Afirmativas
                                </label>
                            </div>
                            <hr style={{ margin: "24px 0" }} />
                            <h2>Funcionalidades</h2>
                            <ul style={{ listStyle: "none", padding: 0 }}>
                                {sidebarIcons.map(({ icon, label, key }) => (
                                    <li
                                        key={key}
                                        className="sidebar-func-item"
                                        onClick={() => handleSidebarIconClick(key)}
                                    >
                                        <span className="sidebar-func-icon">{icon}</span>
                                        <span className="sidebar-func-label">{label}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="job-search-sidebar-icons">
                            {sidebarIcons.map(({ icon, key }) => (
                                <div
                                    key={key}
                                    title={key}
                                    className="sidebar-icon"
                                    onClick={() => handleSidebarIconClick(key)}
                                >
                                    {icon}
                                </div>
                            ))}
                        </div>
                    )}
                </aside>
                <main className={`job-search-main-content ${isSidebarOpen ? "" : "full-width"}`}>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        {MainComponent}
                    </ThemeProvider>
                </main>
            </div>
        </div>
    );
};

export default VacancyManagement;