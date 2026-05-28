// Import React Dependencies
import {
  Dispatch,
  FC,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// Import Contexts
import { useAuth } from "./AuthContext";

// Import General Dependencies
import Cookies from "universal-cookie";
import { Socket, io } from "socket.io-client";

// Declare types and interfaces
import {
  ESuperClientState,
  ISuperClient,
  ISuperClientFilter,
  ISuperClientWithShop,
} from "../../types/ClientType";
import { ISource } from "../../pages/chats/Chat";
import {
  getSuperClientLatestMessage,
  haveCommonElement,
} from "../../utils/utils.ts";
import { IPropsContext } from "../AppProviders";

export interface IChatWebsocketContext {
  init: IInit;
  socketEmit: (
    topic: string,
    payload: any,
    retries?: number,
    delay?: number
  ) => Promise<void>;
  registerSuperClientChatCallback: (
    callback: (superClient: ISuperClient) => void
  ) => void;
  registerSuperClientNotificationCallback: (
    callback: (superClient: ISuperClient) => void
  ) => void;
  registerHeartbeatCallback: (
    callback: (heartbeat: IHeartbeatAnswer) => void
  ) => void;
  setNewAudioNotification: () => void;
  audioNotification: boolean;
  setPendingMessageFlag: Dispatch<SetStateAction<boolean>>;
  pendingMessageFlag: boolean;
}

export type IInit = {
  init: string;
};

export type IHeartbeatAnswer = {
  dbWebsocketId: string;
  actualWebsocketId: string;
};

// Create context
export const ChatWebsocketContext = createContext<IChatWebsocketContext | null>(
  null
);

// Page main functional component
const ChatWebsocketContextProvider: FC<IPropsContext> = ({ children }) => {
  // Use Auth Context
  const { globalSelectedBackend, globalShop, globalUser } = useAuth();

  // Use state variables
  const [init, setInit] = useState<IInit>({
    init: "",
  });
  const [socket, setSocket] = useState<Socket>(
    io(globalSelectedBackend + "/livechat", {
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
  const [superCLientChatCallback, setSuperCLientChatCallback] = useState<
    ((superClient: ISuperClient) => void) | null
  >(null);
  const [superClientNotificationCallback, setSuperCLientNotificationCallback] =
    useState<((superClient: ISuperClient) => void) | null>(null);
  const [heartbeatCallback, setHeartbeatCallback] = useState<
    ((superClient: IHeartbeatAnswer) => void) | null
  >(null);
  const [newSuperClientUpdate, setNewSuperclientUpdate] = useState<any | null>(
    null
  );
  const [newHeartbeatUpdate, setNewHeartbeatUpdate] = useState<any | null>(
    null
  );
  const [audioNotification, setAudioNotification] = useState<boolean>(true);
  const [pendingMessageFlag, setPendingMessageFlag] = useState<boolean>(false);

  // Socket Reference
  const socketRef = useRef(socket);

  // Constants
  const cookies = new Cookies();

  // Use Effect Functions
  useEffect(() => {
    if (globalUser.id) {
      handleSocketConnection(globalUser.id);
      console.log('Esto se creo para el usuario: ', globalUser.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalUser.id]);

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  useEffect(() => {
    if (heartbeatCallback) {
      heartbeatCallback(newHeartbeatUpdate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newHeartbeatUpdate]);

  //
  useEffect(() => {
    if (newSuperClientUpdate) {
      try {
        const newSuperClient: ISuperClientWithShop =
          newSuperClientUpdate.superClient;
        // If the super client is from the shop
        if (newSuperClient.shop.domain === globalShop.domain) {
          const superClientLatestMessage =
            getSuperClientLatestMessage(newSuperClient);

          const storageKey = `wizySuperClientSources_${globalShop.id}_${globalUser.id}`;
          const cookieKey = `wizySuperClientSources_${globalShop.id}_${globalUser.id}`;

          const savedSourcesLocal = localStorage.getItem(storageKey);
          const savedSourcesCookie = cookies.get(cookieKey);
          const savedFilters: ISuperClientFilter | null = cookies.get(
            `wizySuperClientFilter_${globalShop.id}_${globalUser.id}`
          );

          const savedSources: ISource[] | null = savedSourcesLocal
            ? (() => {
                console.log("context source from localstorage");
                return JSON.parse(savedSourcesLocal);
              })()
            : savedSourcesCookie
              ? (() => {
                  // If there's no localstorage, go to cookie
                  const cookieValue =
                    typeof savedSourcesCookie === "string"
                      ? savedSourcesCookie
                      : JSON.stringify(savedSourcesCookie);

                  const trimmed = cookieValue.trim();

                  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                    console.log("Sources from valid cookie");
                    // from cookie to localStorage just once
                    localStorage.setItem(storageKey, trimmed);
                    return JSON.parse(trimmed);
                  } else {
                    console.warn("Invalid JSON. cookie ignored");
                  }
                })()
              : null;
          // If the shop has source filters, only pass those updates where the last message is from a filtered channel
          if (
            (savedSources &&
              savedSources
                .filter((source) => source.filter && !source.onlyMonitoring)
                .flatMap((source) => source.sourceId ?? [globalShop.id, "null"])
                .includes(superClientLatestMessage.sourceId ?? "null")) ||
            !savedSources
          ) {
            // If the shop has only my departments filter, only pass those updates that have a ticket from the assigned departments
            const superClientTickets = newSuperClient.clients.flatMap(
              (client) => client.tickets ?? []
            );

            const hasActiveTickets = superClientTickets.some(
              (ticket: any) => !ticket.state
            );

            const hasTestClient = newSuperClient.clients.some(
              (client) => client.isTest
            );
            if (
              // If there is conversation routing notify if:
              // It is open
              // AND
              // 1. It is assigned to you
              // 2. It has a transferRequest for you
              // 3. It is not assigned to anyone
              // 4. It is assigned to ai and there are active tickets
              (!hasTestClient &&
                globalShop.setup?.conversationRouting &&
                newSuperClient.state === ESuperClientState.OPEN &&
                (newSuperClient.temporaryAssignedTo?.id === globalUser.id ||
                  newSuperClient.defaultAssignedTo?.id === globalUser.id ||
                  !newSuperClient.temporaryAssignedTo ||
                  (newSuperClient.temporaryAssignedTo.isAiAgent &&
                    hasActiveTickets))) ||
              // Notify everyone if there is no conversation routing
              (!hasTestClient && !globalShop.setup?.conversationRouting)
            ) {
              // Also if there is the onlyMyDepartments flag, only notify if corresponding department
              if (
                (savedFilters &&
                  savedFilters.onlyMyDepartments &&
                  globalUser.departmentUserRecords &&
                  superClientTickets.find((ticket) =>
                    haveCommonElement<string>(
                      ticket.departments.map((dept) => dept.id),
                      (globalUser.departmentUserRecords ?? []).map(
                        (record) => record.department.id
                      )
                    )
                  )) ||
                !savedFilters ||
                !savedFilters.onlyMyDepartments
              ) {
                if (superClientNotificationCallback) {
                  superClientNotificationCallback(newSuperClient);
                }
                setPendingMessageFlag(true);
              }
            }
            if (superCLientChatCallback) {
              superCLientChatCallback(newSuperClient);
            }
          }
        }
      } catch (e) {
        console.log(e);
        console.log(newSuperClientUpdate);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newSuperClientUpdate]);


  // Websocket functions
  const handleSocketConnection = (roomId: string) => {
    if (socket) {
      socket.connect()

      socket.on("connect", () => {
        onConnect();
        socket.emit("joinRoom", roomId);
      });
      socket.on("disconnect", onDisconnect);
      socket.on("superClientUpdate", onSuperClientUpdate);
      socket.on("newHeartbeat", onHeartbeatUpdate);
      socket.on("init", onInit);

      return () => {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("superClientUpdate", onSuperClientUpdate);
        socket.off("newHeartbeat", onHeartbeatUpdate);
        socket.off("init", onInit);
        socket.disconnect();
      };
    }
  };

  function onConnect() {}

  function onDisconnect() {}

  function onSuperClientUpdate(value: any) {
    console.log(value);
    setNewSuperclientUpdate(value);
  }

  function onHeartbeatUpdate(value: any) {
    setNewHeartbeatUpdate(value);
  }

  function onInit(value: string) {
    setInit({
      init: value,
    });
  }

   const socketEmit = (topic: string, payload: any): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      let isAcknowledged = false;

      // Emit event with ack callback
      socketRef.current.emit(topic, payload, (response: any) => {
        if (!isAcknowledged) {
          isAcknowledged = true;
          resolve();
        }
      });

      // Timeout after 5 seconds if no ack
      setTimeout(() => {
        if (!isAcknowledged) {
          console.error("❌ Emit failed: no response from server.");
          resolve();
        }
      }, 5000);
    });
  };

  const setNewAudioNotification = async () => {
    setAudioNotification(!audioNotification);
    cookies.set("audioNotification", !audioNotification, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  };

  // Register Superclient Chat Callback (This is to notify to the chat when a message arrives)
  const registerSuperClientChatCallback = (
    callback: (superClient: ISuperClient) => void
  ) => {
    setSuperCLientChatCallback(() => callback);
  };

  // Register Heartbeat in case a signal brom the backend arrives
  const registerHeartbeatCallback = (
    callback: (superClient: IHeartbeatAnswer) => void
  ) => {
    setHeartbeatCallback(() => callback);
  };

  // Register Superclient Notification Callback (This is to notify to the navbar when a message arrives)
  const registerSuperClientNotificationCallback = (
    callback: (superClient: ISuperClient) => void
  ) => {
    setSuperCLientNotificationCallback(() => callback);
  };

  // JSX Return statement
  return (
    <ChatWebsocketContext.Provider
      value={{
        init,
        socketEmit,
        registerSuperClientChatCallback,
        registerSuperClientNotificationCallback,
        registerHeartbeatCallback,
        setNewAudioNotification,
        audioNotification,
        setPendingMessageFlag,
        pendingMessageFlag,
      }}
    >
      {children}
    </ChatWebsocketContext.Provider>
  );
};

export const useChatWebsocket = () => {
  const ctx = useContext(ChatWebsocketContext);
  if (!ctx) {
    throw new Error(
      "useAuth must be used inside <AuthProvider></AuthProvider>",
    );
  }
  return ctx;
};

// Default exported function
export default ChatWebsocketContextProvider;
