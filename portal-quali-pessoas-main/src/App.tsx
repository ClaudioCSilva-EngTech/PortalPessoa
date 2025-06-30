import React, { useState, useCallback, useEffect } from "react";
import { ChatContext } from "./components/ChatWidget/ChatContext";
import ShowCase from "./pages/ShowCase";
import PeopleDepartmentManagement from "./pages/peopledepartmentmanagement/PeopleDepartmentManagement";
import VacationManagement from "./pages/vacationmanagement/VacationManagement";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Sidebar from "./components/Sidebar/Sidebar";
import ChatWidget from "./components/ChatWidget/ChatWidget";
import VacancyManagement from "./pages/vacancymanagement/VacancyManagement";
import { useAuth } from "./context/AuthContext";
import Login from "./components/Login/Login";

const WELCOME_MSG = { text: "Olá! Como podemos ajudar?", received: true };
//const AUTO_REPLY = { text: "Recebemos sua dúvida! Em breve responderemos.", received: true };

// Simulação de usuários do Departamento Pessoal
const PERSONAL_DEPARTMENT_USERS = [
  "Ana",
  "Bruno",
  "Carlos",
  "Diana",
  "Eduardo"
];

export default function App() {
  const [page, setPage] = useState<{ name: string; sub?: string }>({ name: "ShowCase" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [chatHasNew, setChatHasNew] = useState(false);
  const [currentAttendant, setCurrentAttendant] = useState<string | null>(null); // Novo estado para o atendente
  const [isChatActive, setIsChatActive] = useState(false); // Novo estado para controle da sessão de chat
  const [attendantReplyCount, setAttendantReplyCount] = useState(0); // Novo contador de respostas do atendente.

  const { isAuthenticated, user } = useAuth();

  const allowedPages = React.useMemo(() => {
    if (!user) return [];
    if (user.data.detalhes.setor === "admin") return ["ShowCase", "PeopleDepartmentManagement", "VacancyManagement", "VacationManagement"];
    if (user.data.detalhes.setor === "rh") return ["ShowCase", "PeopleDepartmentManagement", "VacancyManagement"];
    if (user.data.detalhes.setor === "colaborador") return ["ShowCase", "VacationManagement"];
    return ["ShowCase", "PeopleDepartmentManagement", "VacancyManagement", "VacationManagement"]//["ShowCase"];
  }, [user]);

  const handleComponentChange = useCallback((componentName: string, subComponentName?: string) => {
    setPage({ name: componentName, sub: subComponentName });
  }, []);

  /*
  const handleComponentChangeOLD = (componentName: string, subComponentName?: string) => {
    if (componentName === "ShowCase") setPage({ name: "ShowCase" });
    else if (componentName === "Home") setPage({ name: "Home" });
    else if (componentName === "PeopleDepartmentManagement")
      setPage({ name: "PeopleDepartmentManagement", sub: subComponentName });
    else if (componentName === "VacationManagement")
      setPage({ name: "VacationManagement", sub: subComponentName });
    else if (componentName === "VacancyManagement")
      setPage({ name: "VacancyManagement", sub: subComponentName });
    else setPage({ name: componentName as any });
  };
  */

  // Abrir chat (pelo sino ou botão flutuante)
  const handleOpenChat = useCallback(() => {
    setChatOpen(true);
    // Zera o contador de notificação e o alerta ao abrir o chat
    setNotificationCount(0);
    setChatHasNew(false);
  }, []);

  const handleCloseChat = useCallback(() => {
    setChatOpen(false);
  }, [])

  // Função centralizada para adicionar mensagens e gerenciar notificações
  const handleNewMessage = useCallback((msg: any) => {
    setMessages((prev) => {
      const newMessages = [...prev, msg];
      if (msg.received && !chatOpen) {
        setNotificationCount((prevCount) => prevCount + 1);
        setChatHasNew(true);
      }
      return newMessages;
    });
    // Incrementa o contador de respostas do atendente
    if (msg.received && !msg.isSystem) {
      setAttendantReplyCount(prevCount => prevCount + 1);
    }
  }, [chatOpen]);

  // Função para atribuir um atendente
  const assignAttendant = useCallback(() => {
    if (currentAttendant === null) {
      const randomIndex = Math.floor(Math.random() * PERSONAL_DEPARTMENT_USERS.length);
      const attendant = PERSONAL_DEPARTMENT_USERS[randomIndex];
      setCurrentAttendant(attendant);
      setIsChatActive(true); // Inicia a sessão de chat ativa
      setAttendantReplyCount(0); // Zera o contador para a nova sessão

      const assignmentMsg = {
        text: `Olá! Seu atendimento foi iniciado com ${attendant} do Departamento Pessoal.`,
        received: true,
        isSystem: true
      };
      // Adiciona a mensagem do sistema imediatamente
      handleNewMessage(assignmentMsg);

      // Simula a primeira resposta do atendente
      setTimeout(() => {
        handleNewMessage({
          text: `Olá, ${user?.data?.detalhes?.nome}! Como posso ajudar?`,
          received: true,
        });
      }, 500);
    }
  }, [currentAttendant, handleNewMessage, user]);

  // Função para finalizar o atendimento
  const endChatSession = useCallback(() => {
    const endMsg = {
      text: "Atendimento encerrado pelo usuário. Obrigado!",
      received: true,
      isSystem: true,
      hasEndButton: false, // Garante que o botão seja removido
    };
    setMessages(prev => [...prev, endMsg]);
    setCurrentAttendant(null);
    setIsChatActive(false);
    setAttendantReplyCount(0); // Reseta o contador
    // Garante que todas as mensagens anteriores não tenham o botão
    setMessages(prevMessages => prevMessages.map(msg => ({ ...msg, hasEndButton: false })));
  }, []);


  // Função de envio de mensagem do usuário
  const handleSendMessage = useCallback((msg: any) => {
    // Adiciona a mensagem do usuário
    setMessages((prev) => [...prev, { ...msg, received: false }]);

    // Se o chat ainda não tiver uma sessão ativa, inicia o atendimento
    if (!isChatActive) {
      assignAttendant();
    } else {
      // Se já houver um atendente, simula a resposta dele
      setTimeout(() => {
        const replyMsg = {
          text: `Mensagem de ${currentAttendant}: Recebi sua mensagem.`,
          received: true,
          hasEndButton: false,
        };

        // Verifica se é hora de adicionar o botão "Encerrar Atendimento"
        if (attendantReplyCount >= 2 && !messages.some(m => m.hasEndButton)) {
          replyMsg.text = `${replyMsg.text} Se sua dúvida foi resolvida, por favor, clique em "Encerrar atendimento".`;
          replyMsg.hasEndButton = true;
        }

        handleNewMessage(replyMsg);
      }, 1200);
    }

  }, [isChatActive, assignAttendant, currentAttendant, handleNewMessage, attendantReplyCount, messages]);

  // Efeito para adicionar a mensagem de boas-vindas ao abrir o chat se for a primeira vez
  useEffect(() => {
    if (chatOpen && messages.length === 0) {
      handleNewMessage(WELCOME_MSG);
    }
  }, [chatOpen, messages, handleNewMessage]);

  if (!isAuthenticated) {
    return <Login />;
  }

  const menu = [];

  let content;
  if (!allowedPages.includes(page.name)) {
    console.log("Entrou no AllowedPages: " + page.name);
    content = <ShowCase onComponentChange={handleComponentChange} />;
  } else {
    switch (page.name) {
      case "PeopleDepartmentManagement":
        content = <PeopleDepartmentManagement initialComponent={page.sub} onComponentChange={handleComponentChange} />;//initialComponent={page.sub} />;
        break;
      case "VacancyManagement":
        content = <VacancyManagement initialComponent={page.sub} onComponentChange={handleComponentChange} />; //VacancyManagement initialComponent={page.sub} onHomeClick={handleHomeClick}/>;
        break;
      case "VacationManagement":
        content = <VacationManagement initialComponent={page.sub} onComponentChange={handleComponentChange} />;// initialComponent={page.sub} />;
        break;
      // ...demais casos
      default:
        content = <ShowCase onComponentChange={handleComponentChange} />;
    }
  }

  const showSidebar = page.name !== "ShowCase" && page.name !== "Home";
  const sidebarWidthOpen = 220;
  const sidebarWidthClosed = 56;

  /*
    const { currentUser, login, logout, isLoading } = useAuth();
  if (isLoading) {
    return <div>Carregando...</div>;
  }
  if (!currentUser) {
    return <Login onLogin={login} />;
  }
    */
  return (
    <ChatContext.Provider value={{ sendMessage: handleNewMessage }}>
      <div
        className="app-container"
        style={{
          // Define a variável CSS para ser usada no CSS
          "--sidebar-width": showSidebar
            ? `${sidebarOpen ? sidebarWidthOpen : sidebarWidthClosed}px`
            : "0px",
        } as React.CSSProperties}
      >
        <Header
          notificationCount={notificationCount}
          onOpenChat={handleOpenChat}
          showTooltip={showTooltip}
          setShowTooltip={setShowTooltip}
          activeMenu={""}
          onHomeClick={() => handleComponentChange("ShowCase")}
        />
        {showSidebar && (
          <Sidebar
            open={sidebarOpen}
            onToggle={() => setSidebarOpen((open) => !open)}
            onNavigate={handleComponentChange}
            current={page.name}
          />
        )}
        <main className="app-main">{content}</main>
        <ChatWidget
          open={chatOpen}
          onOpen={handleOpenChat}
          onClose={handleCloseChat}
          messages={messages}
          onSendMessage={handleSendMessage} // A mensagem do usuário
          hasNew={chatHasNew} // Passa o estado de alerta para o widget
          onEndChat={endChatSession} // Passa a função para finalizar o chat
          isChatActive={isChatActive} // Passa o estado da sessão
          isInputDisabled={!isChatActive && messages.length > 1 && !messages.some(m => m.isSystem && m.text.includes("Atendimento encerrado"))} // Nova prop para o ChatWidget
        />
        <Footer />
      </div>
    </ChatContext.Provider>
  );
}