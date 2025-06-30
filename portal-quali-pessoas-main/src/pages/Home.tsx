import React, { useState, useCallback } from "react";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Sidebar from "../components/Sidebar/Sidebar";
//import ChatWidget from "../components/ChatWidget/ChatWidget"; // Componente do chat global
//import { ChatContext } from "../components/ChatWidget/ChatContext";
import "../styles/global.css";

//const emptyMenus: any[] = [];

const Home: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeComponent, setActiveComponent] = useState<string>("ShowCase");
 // const [activeSub, setActiveSub] = useState<string | undefined>(undefined);
  //const [chatOpen, setChatOpen] = useState(false);
 // const [messages, setMessages] = useState([]);
  //const [notificationCount, setNotificationCount] = useState(0);

  // const { sendMessage } = useContext(ChatContext);

 const handleComponentChange = useCallback((componentName: string) => {
    setActiveComponent(componentName);
   // setActiveSub(subComponentName);

    // Sidebar fechado ao abrir páginas centrais
    if (
      componentName === "PeopleDepartmentManagement" ||
      componentName === "VacancyManagement" ||
      componentName === "VacationManagement"
    ) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true); // Aberto para outras páginas, se desejar
    }
  }, []);

  // Função para adicionar mensagem de qualquer componente
 /* const handleNewMessage = (msg: string) => {
    setMessages((prev) => [...prev, msg]);
    setNotificationCount((count) => count + 1);
  };
*/
  // Função para abrir o chat (zera notificações)
 /* const handleOpenChat = () => {
    setChatOpen(true);
    setNotificationCount(0);
  };

  
  const handleHomeClick = () => {
     console.log("HandleHomeClick_HOME: " + activeComponent)
    // Aqui você pode validar o token/sessionStorage se quiser
    const user = sessionStorage.getItem('user');
    if (user) {
      setActiveComponent("ShowCase");
      setActiveSub(undefined);
      console.log("HandleHomeClick_HOME: " + activeComponent)
    }
  };


  let content: React.ReactNode;
  switch (activeComponent) {
    case "PeopleDepartmentManagement":
      content = <PeopleDepartmentManagement initialComponent={activeSub} />;
      break;
    case "VacancyManagement":
      content = <VacancyManagement initialComponent={activeSub} onHomeClick={handleHomeClick}/>;
      break;
    case "VacationManagement":
      content = <VacationManagement initialComponent={activeSub} />;
      break;
    default:
      content = <ShowCase onComponentChange={handleComponentChange} />;
  }
*/
  return (
    <div className="app-container">
      <Header
        notificationCount={0}
          showTooltip={showTooltip}
          setShowTooltip={setShowTooltip}
          activeMenu={""}
          onHomeClick={() => handleComponentChange("ShowCase")}
      />
      {activeComponent !== "ShowCase" && activeComponent !== "Home" && (
        <Sidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((open) => !open)}
          onNavigate={handleComponentChange}
          current={activeComponent}
        />
        
      )}
      <main
        className="app-main"
        style={{
          marginLeft: sidebarOpen ? 220 : 56,
          transition: "margin-left 0.2s",
        }}
      >
      {/*  {content} */}
      </main>
    {/*}  <ChatWidget
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={messages}
        onSendMessage={(msg) => setMessages((prev) => [...prev, msg])}
      />*/}
      <Footer />
    </div>
  );
};

export default Home;