import React, { useState, useEffect } from "react";
import {
    FaChevronLeft,
    FaBars,
    FaPlaneDeparture,
    FaFileInvoiceDollar,
    FaHandHoldingHeart,
    FaTshirt,
    FaSlideshare,
    FaComments,
    FaHome
} from "react-icons/fa";
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import VacationPanel from "./VacationPanel";
import VacationDashboard from "./VacationDashboard";
import Header from "../../components/Header/Header";
import '../../styles/Vacations.css';

const sidebarIcons = [
    { icon: <FaPlaneDeparture size={24} color="#0a2885" />, label: "Férias", key: "ferias" },
    { icon: <FaFileInvoiceDollar size={24} color="#0a2885" />, label: "Reembolsos", key: "reembolsos" },
    { icon: <FaHandHoldingHeart size={24} color="#0a2885" />, label: "Benefícios", key: "beneficios" },
    { icon: <FaTshirt size={24} color="#0a2885" />, label: "Uniformes", key: "uniformes" },
    { icon: <FaSlideshare size={24} color="#0a2885" />, label: "Treinamentos", key: "treinamentos" },
    { icon: <FaComments size={24} color="#0a2885" />, label: "RH Responde", key: "rhresponde" },
    { icon: <FaHome size={24} color="#0a2885" />, label: "Home", key: "homeresponde" },
];

interface VacationManagementProps {
    initialComponent?: string;
    onComponentChange: (componentName: string, subComponentName?: string) => void;
}

const headerMenus: any[] = []; // Ajuste conforme necessário

const VacationManagement: React.FC<VacationManagementProps> = ({ initialComponent, onComponentChange }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const [activeComponent, setActiveComponent] = useState<string>(initialComponent || "VacationPanel");

    useEffect(() => {
        if (initialComponent) setActiveComponent(initialComponent);
    }, [initialComponent]);

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    const handleSidebarIconClick = (key: string) => {
        if (key === "homeresponde") {
            onComponentChange("ShowCase");
        } else if (key === "ferias") {
            setActiveComponent("VacationPanel");
        } else if (key === "treinamentos") {
            setActiveComponent("VacationDashboard");
        }
        // Adicione outras ações conforme necessário
    };

    const handleOpenChat = () => {
        setNotificationCount(0);
        // lógica para abrir chat, se houver
    };

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

    // Renderização dos subcomponentes
    let MainComponent = <VacationPanel />;
    if (activeComponent === "VacationDashboard") MainComponent = <VacationDashboard />;

    return (
        <div className="app-container">
            <Header
                menus={headerMenus}
                showTooltip={showTooltip}
                setShowTooltip={setShowTooltip}
                notificationCount={notificationCount}
                onOpenChat={handleOpenChat}
                onMenuClick={setActiveComponent}
                activeMenu={activeComponent}
                onHomeClick={() => onComponentChange("ShowCase")}
            />
            <div className="job-search-layout" style={{ marginTop: 60 }}>
                <aside
                    className={`job-search-sidebar ${isSidebarOpen ? "open" : "closed"}`}
                    style={{
                        width: isSidebarOpen ? 240 : 64,
                        minWidth: isSidebarOpen ? 240 : 64,
                        maxWidth: isSidebarOpen ? 260 : 64,
                        transition: "width 0.2s",
                        height: "calc(100vh - 60px)",
                        background: "#fff",
                        borderRight: "1px solid #e0e0e0",
                        zIndex: 10,
                        overflow: "hidden",
                        boxSizing: "border-box",
                        top: 60,
                        position: "fixed",
                    }}
                >
                    <button
                        className="job-search-sidebar-toggle"
                        onClick={toggleSidebar}
                        aria-label={isSidebarOpen ? "Fechar menu lateral" : "Abrir menu lateral"}
                        style={{
                            margin: 0,
                            padding: 20,
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            width: "100%",
                            textAlign: isSidebarOpen ? "right" : "center"
                        }}
                    >
                        {isSidebarOpen ? <FaChevronLeft /> : <FaBars />}
                    </button>
                    {isSidebarOpen ? (
                        <div
                            className="job-search-sidebar-content"
                            style={{
                                marginTop: 0,
                                height: "calc(100vh - 60px)",
                                overflowY: "auto",
                                paddingRight: 8
                            }}
                        >
                            <h2>Pesquisa</h2>
                            {/* ... filtros ... */}
                            <hr style={{ margin: "24px 0" }} />
                            <h2>Funcionalidades</h2>
                            <ul style={{ listStyle: "none", padding: 0 }}>
                                {sidebarIcons.map(({ icon, label, key }) => (
                                    <li
                                        key={key}
                                        style={{ display: "flex", alignItems: "center", margin: "16px 0", cursor: "pointer" }}
                                        onClick={() => handleSidebarIconClick(key)}
                                    >
                                        <span style={{ marginRight: 12 }}>{icon}</span>
                                        <span style={{ color: "#0a2885", fontWeight: 200 }}>{label}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div
                            className="job-search-sidebar-icons"
                            style={{
                                marginTop: 24,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 24,
                                height: "calc(100vh - 60px)",
                                overflowY: "auto"
                            }}
                        >
                            {sidebarIcons.map(({ icon, key }) => (
                                <div
                                    key={key}
                                    title={key}
                                    style={{ marginBottom: 8, cursor: "pointer" }}
                                    onClick={() => handleSidebarIconClick(key)}
                                >
                                    {icon}
                                </div>
                            ))}
                        </div>
                    )}
                </aside>
                <main
                    className="job-search-main-content"
                    style={{
                        marginLeft: isSidebarOpen ? 240 : 120,
                        marginRight: isSidebarOpen ? 240 : 100,
                        transition: "margin-left 0.2s",
                        minHeight: "calc(100vh - 60px)",
                        background: "#f5f5f5",
                    }}
                >
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        {MainComponent}
                    </ThemeProvider>
                </main>
            </div>
        </div>
    );
};

export default VacationManagement;