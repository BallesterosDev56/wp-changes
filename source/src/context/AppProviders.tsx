import { ReactNode } from "react";

// Import Sub Contexts
import AuthContextProvider from "./subContexts/AuthContext";
import ChatWebsocketContextProvider from "./subContexts/ChatWebsocketContext";
import CommentsWebsocketContextProvider from "./subContexts/CommentsWebsocketContext";

// Declare types and interfaces
export type IPropsContext = {
  children: ReactNode;
};

export const AppProviders = ({ children }: IPropsContext) => {
  return (
    <AuthContextProvider>
      <ChatWebsocketContextProvider>
        <CommentsWebsocketContextProvider>
          {children}
        </CommentsWebsocketContextProvider>
      </ChatWebsocketContextProvider>
    </AuthContextProvider>
  );
};
