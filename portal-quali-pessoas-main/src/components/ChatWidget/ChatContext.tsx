import { createContext, useContext } from "react";

export const ChatContext = createContext({
  sendMessage: (msg: string) => {},
});

export const useChat = () => useContext(ChatContext);