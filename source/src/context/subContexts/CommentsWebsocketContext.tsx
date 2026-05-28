// Import React Dependencies
import {
  FC,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// Import Contexts
import { useAuth } from "./AuthContext";

// Import General Dependencies
import { Socket, io } from "socket.io-client";
import { IPropsContext } from "../AppProviders";
import { NewCommentEvent } from "../../types/CommentTypes.ts";

export interface ICommentsWebsocketContext {
  registerNewCommentEventCallback: (
    callback: (newCommentEvent: NewCommentEvent) => void
  ) => void;
}

// Create context
export const CommentsWebsocketContext =
  createContext<ICommentsWebsocketContext | null>(null);

// Page main functional component
const CommentsWebsocketContextProvider: FC<IPropsContext> = ({ children }) => {
  // Use Auth Context
  const { globalSelectedBackend, globalUser } = useAuth();

  // Use state variables
  const [socket, setSocket] = useState<Socket>(
    io(globalSelectedBackend + "/comments", {
      autoConnect: false,
      transports: ["websocket"],
      transportOptions: {
        websocket: {
          extraHeaders: {
            "Sec-WebSocket-Key": "dGhlIHNhbXBsZSBub25jZQ==",
            "Sec-WebSocket-Version": "13",
            "Sec-WebSocket-Protocol": "chat, superchat",
          },
        },
      },
    })
  );

  const [newCommentEventCallback, setNewCommentEventCallback] = useState<
    ((newCommentEvent: NewCommentEvent) => void) | null
  >(null);
  const [newCommentEvent, setNewCommentEvent] =
    useState<NewCommentEvent | null>(null);

  // Socket Reference
  const socketRef = useRef(socket);

  // Use Effect Functions
  useEffect(() => {
    if (globalUser.id) {
      handleSocketConnection(globalUser.id);

    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalUser]);

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  useEffect(() => {
    if (newCommentEventCallback && newCommentEvent) {
        newCommentEventCallback(newCommentEvent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newCommentEvent]);


  // Websocket functions
  const handleSocketConnection = (roomId: string) => {
    if (socket) {
      socket.connect();

      socket.on("connect", () => {
        onConnect();
        socket.emit("joinRoom", roomId);
      });
      socket.on("disconnect", onDisconnect);
      socket.on("newCommentEvent", onNewCommentEvent);

      return () => {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("newCommentEvent", onNewCommentEvent);
        socket.disconnect();
      };
    }
  };

  function onConnect() {}

  function onDisconnect() {}

  function onNewCommentEvent(value: any) {
    // DEBUG
    // console.log("New comment event", value);
    setNewCommentEvent(value);
  }


  // Register New Comment Event Callback (This is to notify when a new comment arrives)
  const registerNewCommentEventCallback = (
    callback: (newCommentEvent: NewCommentEvent) => void
  ) => {
    setNewCommentEventCallback(() => callback);
  };

  // JSX Return statement
  return (
    <CommentsWebsocketContext.Provider
      value={{
        registerNewCommentEventCallback,
      }}
    >
      {children}
    </CommentsWebsocketContext.Provider>
  );
};

export const useCommentsWebsocket = () => {
  const ctx = useContext(CommentsWebsocketContext);
  if (!ctx) {
    throw new Error(
      "useCommentsWebsocket must be used inside <AuthProvider></AuthProvider>"
    );
  }
  return ctx;
};

// Default exported function
export default CommentsWebsocketContextProvider;
