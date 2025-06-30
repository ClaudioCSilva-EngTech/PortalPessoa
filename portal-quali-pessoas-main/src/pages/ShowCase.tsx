import React from "react";
import {
  FaSyncAlt, FaPlaneDeparture, FaTshirt, FaHandHoldingHeart,
  FaFileInvoiceDollar, FaComments, FaSlideshare
} from "react-icons/fa";
import Header from "../components/Header/Header";
//import ChatWidget from "../components/ChatWidget/ChatWidget";
import "../styles/Recruitment.css";

// Feature toggle para liberar cards
const FEATURE_TOGGLE_EM_BREVE = true;

interface ShowCaseProps {
  onComponentChange: (componentName: string, subComponentName?: string) => void;
}

const ShowCase: React.FC<ShowCaseProps> = ({ onComponentChange }) => {
  /*const [showTooltip, setShowTooltip] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  //const [activeComponent, setActiveComponent] = useState<string>("ShowCase");
  // const [activeSub, setActiveSub] = useState<string | undefined>(undefined);

  // Função para abrir e fechar o chat (zera notificações)
  const handleOpenChat = () => {
    setChatOpen(true);
    setNotificationCount(0);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
  };

  const handleSendMessage = (msg: any) => {
    setMessages(prev => [...prev, msg]);
    // Se for mensagem recebida e chat fechado, incrementa notificação
    if (msg.received && !chatOpen) {
      setNotificationCount(prev => prev + 1);
    }
  };
*/
  const currentUser = (() => {
    try {
      const userStr = sessionStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  })();

  const NAME_DP_RH = 'DEPARTAMENTOPESSOAL';

  const EmBreveTag = () => (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(40,40,40,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
        borderRadius: 16
      }}
    >
      <span style={{
        color: "#d32f2f",
        fontWeight: "bold",
        fontSize: "1.3em",
        letterSpacing: 2,
        textShadow: "0 1px 4px #000"
      }}>
        EM BREVE
      </span>
    </div>
  );

  const SectionRH: React.FC<{ onComponentChange: ShowCaseProps["onComponentChange"] }> = ({ onComponentChange }) => (
    <section id="functionHR" className="benefits-section">
      <h3>Funções RH</h3>
      <div className="benefits-grid">
        <div className="benefit-item" style={{ position: "relative" }}>
          {FEATURE_TOGGLE_EM_BREVE && <EmBreveTag />}
          <FaSyncAlt size={48} color="#FFD700" />
          <h3>Meus Chamados</h3>
          <p>Todas solicitações em um só lugar</p>
          <button
            className="cta-button"
            onClick={() => onComponentChange("PeopleDepartmentManagement", "ApprovalRequest")}
            disabled={FEATURE_TOGGLE_EM_BREVE}
          >
            Meu Painel
          </button>
        </div>
        <div className="benefit-item" style={{ position: "relative" }}>
          {FEATURE_TOGGLE_EM_BREVE && <EmBreveTag />}
          <FaPlaneDeparture size={48} color="#00CED1" />
          <h3>Integração APDATA</h3>
          <p>Sincronize sua base de colaboradores</p>
          <button
            className="cta-button"
            onClick={() => onComponentChange("PeopleDepartmentManagement", "IntegrationApData")}
            disabled={FEATURE_TOGGLE_EM_BREVE}
          >
            Sincronizar
          </button>
        </div>
      </div>
    </section>
  );

  return (
    <main className="recruitment-main-content">
      <Header
        setShowTooltip={() => { }}
        notificationCount={0}
        onHomeClick={() => onComponentChange("ShowCase")}
      />
      <section className="benefits-section">
        <h2>Bem-vindo ao Portal Pessoas {currentUser.data.detalhes.nome}</h2>
        <h3>Mais utilizadas</h3>
        <div className="benefits-grid">
          <div className="benefit-item">
            <FaSyncAlt size={48} color="#FFD700" />
            <h3>Vagas</h3>
            <p>Abra e gerencie suas vagas!</p>
            <button className="cta-button" onClick={() => onComponentChange("VacancyManagement", "DashBoardVacancies")}>Meu Painel</button>
          </div>

          <div className="benefit-item">
            {FEATURE_TOGGLE_EM_BREVE && <EmBreveTag />}
            <FaPlaneDeparture size={48} color="#00CED1" />
            <h3>Férias</h3>
            <p>Agendamentos e acompanhamento</p>
            <button
              className="cta-button"
              onClick={() => onComponentChange("VacationManagement", "VacationPanel")}
              disabled={FEATURE_TOGGLE_EM_BREVE}
            >Gerenciar</button>
          </div>

          <div className="benefit-item">
            {FEATURE_TOGGLE_EM_BREVE && <EmBreveTag />}
            <FaSyncAlt size={48} color="#FFD700" />
            <h3>APDATA</h3>
            <p>Solicite alteração de Senha e Hierarquia</p>
            <button
              className="cta-button"
              onClick={() => onComponentChange("PeopleDepartmentManagement", "FormRequestApData")}
              disabled={FEATURE_TOGGLE_EM_BREVE}
            >Solicitar</button>
          </div>

          <div className="benefit-item">
            {FEATURE_TOGGLE_EM_BREVE && <EmBreveTag />}
            <FaComments size={48} color="#9370DB" />
            <h3>RH Responde</h3>
            <p>Fale com o RH e tire suas dúvidas</p>
            <button
              className="cta-button"
              onClick={() => onComponentChange("PeopleDepartmentManagement", "FaqPeople")}
              disabled={FEATURE_TOGGLE_EM_BREVE}
            >Fale Conosco</button>
          </div>

        </div>
      </section>
      <section className="benefits-section">
        <h3>Solicitações</h3>
        <div className="benefits-grid">
          <div className="benefit-item">
            {FEATURE_TOGGLE_EM_BREVE && <EmBreveTag />}
            <FaSlideshare size={48} color="#9370DB" />
            <h3>Treinamentos</h3>
            <p>
              Solicite e acompanhe seus treinamentos
            </p>
            <button
              className="cta-button"
              onClick={() => onComponentChange("Trainings")}
              disabled={FEATURE_TOGGLE_EM_BREVE}
            >
              Solicitar
            </button>
          </div>

          <div className="benefit-item">
            {FEATURE_TOGGLE_EM_BREVE && <EmBreveTag />}
            <FaFileInvoiceDollar size={48} color="#9370DB" />
            <h3>Reembolsos</h3>
            <p>
              Solicite e acompanhe seus pedidos
            </p>
            <button
              className="cta-button"
              onClick={() => onComponentChange("Reimbursements")}
              disabled={FEATURE_TOGGLE_EM_BREVE}
            >
              Meus Pedidos
            </button>
          </div>

          <div className="benefit-item">
            {FEATURE_TOGGLE_EM_BREVE && <EmBreveTag />}
            <FaHandHoldingHeart size={48} color="#9370DB" />
            <h3>Benefícios</h3>
            <p>
              Solicite e consulte seus pedidos de mudanças.
            </p>
            <button
              className="cta-button"
              onClick={() => onComponentChange("Benefits")}
              disabled={FEATURE_TOGGLE_EM_BREVE}
            >
              Meus Benefícios
            </button>
          </div>

          <div className="benefit-item">
            {FEATURE_TOGGLE_EM_BREVE && <EmBreveTag />}
            <FaTshirt size={48} color="#9370DB" />
            <h3>Uniformes</h3>
            <p>
              Consultar e provisionar estoque de uniformes
            </p>
            <button
              className="cta-button"
              onClick={() => onComponentChange("Uniforms")}
              disabled={FEATURE_TOGGLE_EM_BREVE}
            >
              Gerir estoque
            </button>
          </div>
        </div>

      </section>
      <section className="benefits-section">
        <h3>Para você Gestor</h3>
        <div className="benefits-grid">
          <div className="benefit-item">
            {FEATURE_TOGGLE_EM_BREVE && <EmBreveTag />}
            <FaSlideshare size={48} color="#9370DB" />
            <h3>Medida Disciplinar</h3>
            <p>
              Registre medidas disciplinares se necessário
            </p>
            <button
              className="cta-button"
              onClick={() => onComponentChange("PeopleDepartmentManagement", "DisciplinaryMeasure")}
              disabled={FEATURE_TOGGLE_EM_BREVE}
            >
              Registrar
            </button>
          </div>

          <div className="benefit-item">
            {FEATURE_TOGGLE_EM_BREVE && <EmBreveTag />}
            <FaSlideshare size={48} color="#9370DB" />
            <h3>Desligamentos</h3>
            <p>
              Abra sua solicitação de desligamentos.
            </p>
            <button
              className="cta-button"
              onClick={() => onComponentChange("PeopleDepartmentManagement", "EmployeeTermination")}
              disabled={FEATURE_TOGGLE_EM_BREVE}
            >
              Registrar
            </button>
          </div>
        </div>
      </section>
      {currentUser?.data?.detalhes?.setor?.toUpperCase() === NAME_DP_RH && (
        <SectionRH onComponentChange={onComponentChange} />
      )}
   {/*}   <ChatWidget
        open={chatOpen}
        onOpen={handleOpenChat}
        onClose={handleCloseChat}
        messages={messages}
        onSendMessage={handleSendMessage}
        notificationCount={notificationCount}
      />*/}
    </main>
  );
};

export default ShowCase;