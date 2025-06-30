import React, { useState, useRef, useEffect } from "react";
import { FaComments, FaExclamationCircle } from "react-icons/fa";
import "./ChatWidget.scss";

//const WELCOME_MSG = { text: "Olá! Como podemos ajudar?", received: true };
//const AUTO_REPLY = { text: "Recebemos sua dúvida! Em breve responderemos.", received: true };

interface ChatWidgetProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  messages: any[];
  onSendMessage: (msg: any) => void;
  hasNew: boolean;
  onEndChat: () => void; // Nova prop para finalizar o chat
  isChatActive: boolean; // Nova prop para o estado da sessão
  isInputDisabled: boolean; // Nova prop para desativar o input
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
   open,
  onOpen,
  onClose,
  messages,
  onSendMessage,
  hasNew,
  onEndChat,
  isChatActive,
  isInputDisabled,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Efeito de rolagem para a última mensagem
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

/*
  // Efeito para rolar para a última mensagem
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
/*
  const handleOpen = () => {
    onOpen();
    // A lógica de redefinir o alerta agora está no componente pai
  };
*/

 const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newMessage.trim().length > 0) {
      handleSend();
    }
  };

  const handleSend = () => {
    if (newMessage.trim().length > 0) {
      const msg = { text: newMessage };
      onSendMessage(msg);
      setNewMessage("");
    }
  };

  return (
    <>
      {!open && (
        <button
          className={`chat-fab ${hasNew ? "chat-fab-alert" : ""}`}
          onClick={onOpen}
          aria-label="Abrir chat"
        >
          {hasNew ? (
            <FaExclamationCircle size={32} color="#d32f2f" style={{ background: "#fff", borderRadius: "50%" }} />
          ) : (
            <FaComments size={32} color="#fff" />
          )}
        </button>
      )}
      {open && (
        <div className="chat-popup">
          <div className="chat-header">
            <span>People Chat</span>
            <button onClick={onClose} aria-label="Fechar chat" className="chat-close">×</button>
          </div>
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-bubble ${msg.received ? "received" : "sent"} ${msg.isSystem ? "system" : ""}`}
              >
                {msg.text}
                {msg.hasEndButton && isChatActive && (
                  <button onClick={onEndChat} className="end-chat-button">
                    Encerrar atendimento
                  </button>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input">
            <input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isChatActive ? "Digite sua mensagem aqui..." : "Aguardando um atendente..."}
              autoFocus
               disabled={isInputDisabled} // Usa a nova prop para desativar              
            />
            <button
               className="chat-send"
              onClick={handleSend}
              disabled={newMessage.trim().length === 0 || isInputDisabled}
            >
              ENVIAR
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;