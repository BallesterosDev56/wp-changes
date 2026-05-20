// Import React Dependencies
import React, { FC, useEffect, useRef, useState } from "react";
import Cookies from "universal-cookie";
import { Socket, io } from "socket.io-client";

// Import phone input dependencies
import { PhoneInput } from "react-international-phone";

// Import extra ui components
import Add2Cart from "../extraUIcomponents/Add2Cart/Add2Cart";
import ShopifyWidgetCart from "../extraUIcomponents/ShopifyWidgetCart";
import RecommendationCarousel from "../extraUIcomponents/RecommendationCarousel/RecommendationCarousel";
import AddToCartWithSubscriptions from "../extraUIcomponents/AddToCartWithSubscriptions/Add2CartWithSubscriptions";
import AddMedia from "../extraUIcomponents/AddMedia/AddMedia";

// Import types
import {
  EMessageRole,
  EMessageSourceTypes,
  EMessageStatus,
  IMessage,
  IMessageBackend,
  IWidgetMessage,
} from "../types/MessageType";
import {
  EExtraUIComponentTypes,
  ENewExtraUIComponentTypes,
  getNewExtraUIComponentTitle,
  ICollectionCard,
  INewAddToCartExtraUIComponent,
  INewAddToCartWithSubscriptionsExtraUIComponent,
  INewClientProductCartExtraUIComponent,
  INewProductCardExtraUIComponent,
  INewRecommendationCarouselExtraUIComponent,
  INewAddMediaExtraUIComponent,
  IProductCard,
  isExtraUIComponentType,
} from "../extraUIcomponents/extraUIComponentTypes";
import ProductCard from "../extraUIcomponents/ProductCard/ProductCard";
import ProductCart from "../extraUIcomponents/ProductCart/ProductCart";
import WidgetMedia from "./WidgetMedia";

// Define types
type ShopifyWidgetProps = {
  domain: string;
  widget: IWidgetVariables;
  isTest: boolean;
  isDashboard: boolean;
  isAdmin: boolean;
  isRelative: boolean;
  ipRegistryKey: string;
  globalSelectedBackend: string;
  chatProfileImage: string;
  curvyBorderImage: string;
  wizyLogoImage: string;
  noImageImage: string;
  widgetLoader: string;
  shopifyRootPath: string | null;
  shopifyCurrentPath: string;
  isShopifyForeing: boolean;
  isRedirect: boolean;
  redirectionLink: string;
  marketId?: string;
  languageCode?: string;
  languageUrl?: string;
  showNewMessage: () => void;
  hideNewMessage: () => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  platform?: string;
  wizyCartId?: string;
  onMessagesUpdate?: (messages: IWidgetMessage[]) => void;
};

export type IWidgetVariables = {
  domain: string;
  setup: ISetupWidget;
};

export type ISetupWidget = {
  primaryColor: string;
  secondaryColor: string;
  fontColor: string;
  agentName: string;
  onlinePhrase: string;
  mainLanguage: EMainLanguage;
  side: ESide;
  paddingBottom: number;
  paddingSide: number;
  image: string;
  isVisible: boolean;
  emailRetrievalMethod: EEmailRetrievalMethod;
  dataRetrievalType: EDataRetrievalType;
  dataRetrievalCustomPrompt: string;
  isRedirect: boolean;
  redirectionLink: string;
  isOverLimitBudget: boolean;
  limitBudgetAction: ELimitBudgetAction;
  limitBudgetRedirectionLink: string;
  hideNotificationSign: boolean;
  hideWizybotBanner: boolean;
  hideOutboundMessage: boolean;
  preventSaleNoteCreation: boolean;
  customWidgetCode: string;
  pagesToExcludeWidget: string;
  defaultCountryCode: string;
};

export type ICart = {
  totalPrice: number;
  currency: string;
  items: ICartItem[];
};

export type ICartItem = {
  id: number;
  quantity: number;
  productTitle: string;
  variantTitle: string;
  linePrice: number;
  image: string;
  url: string;
};

export type IInit = {
  init: string;
  type: EConnectionType;
};

// Define enums
enum EChatState {
  close = "close",
  open = "open",
}

enum EVisibleMessageState {
  visible = "visible",
  invisible = "invisible",
}

enum ECreateClientState {
  visible = "visible",
  invisible = "invisible",
}

enum ECartState {
  visible = "visible",
  invisible = "invisible",
}

enum EActionsMenuState {
  visible = "visible",
  invisible = "invisible",
}

enum ECreateClientBackendState {
  send = "send",
  loading = "loading",
}

enum EConnectionType {
  initial = "initial",
  message = "message",
  brute = "brute",
}

export enum EMainLanguage {
  SPANISH = "Spanish",
  ENGLISH = "English",
  PORTUGUESE = "Portuguese",
  FRENCH = "French",
  GERMAN = "German",
  ITALIAN = "Italian",
}

export enum ESide {
  RIGHT = "Right",
  LEFT = "Left",
}

export enum EEmailRetrievalMethod {
  MANDATORY = "Mandatory",
  SEMANTIC = "Semantic",
  NONE = "None",
}

export enum EDataRetrievalType {
  NAME = "Name",
  EMAIL = "Email",
  PHONE = "Phone",
  BOTH = "Both",
  NAME_EMAIL = "Name_Email",
  NAME_PHONE = "Name_Phone",
  NAME_EMAIL_PHONE = "Name_Email_Phone",
  CUSTOM = "Custom",
}

export enum ELimitBudgetAction {
  WIDGET_OFF = "widget off",
  AI_OFF = "ai off",
  DEFAULT_MESSAGE = "default message",
  REDIRECT = "redirect",
}

// Page main functional component
const ShopifyWidget: FC<ShopifyWidgetProps> = ({
  domain,
  widget,
  isTest,
  isDashboard,
  isAdmin,
  isRelative,
  ipRegistryKey,
  globalSelectedBackend,
  chatProfileImage,
  curvyBorderImage,
  wizyLogoImage,
  noImageImage,
  widgetLoader,
  shopifyRootPath,
  isRedirect,
  redirectionLink,
  shopifyCurrentPath,
  isShopifyForeing,
  showNewMessage,
  hideNewMessage,
  setIsOpen,
  marketId,
  languageCode,
  languageUrl,
  platform,
  wizyCartId,
  onMessagesUpdate,
}) => {
  // Track observability messages in a ref for performance
  const observabilityMessagesRef = useRef<IWidgetMessage[]>([]);
  // Track if WordPress sale intent has been created this session (for returning clients)
  const wordpressSaleCreatedRef = useRef<boolean>(false);
  // file input reference for image upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  // actions menu container reference for outside click detection
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  // Helper function to update observability messages
  const updateObservabilityMessages = (
    updater: (prev: IWidgetMessage[]) => IWidgetMessage[],
  ) => {
    if (onMessagesUpdate) {
      observabilityMessagesRef.current = updater(
        observabilityMessagesRef.current,
      );
      onMessagesUpdate(observabilityMessagesRef.current);
    }
  };

  // Use State Variables
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isNewMessage, setIsNewMessage] = useState<boolean>(false);
  const [init, setInit] = useState<IInit>({
    init: "",
    type: EConnectionType.initial,
  });
  const [chatState, setChatState] = useState<EChatState>(
    isRelative ? EChatState.open : EChatState.close,
  );
  const [chatStateVisibility, setChatStateVisibility] = useState<EChatState>(
    isRelative ? EChatState.open : EChatState.close,
  );
  const [visibleMessage, setVisibleMessage] = useState<string>("");
  const [visibleMessageState, setVisibleMessageState] =
    useState<EVisibleMessageState>(EVisibleMessageState.invisible);
  const [visibleMessageOpacity, setVisibleMessageOpacity] =
    useState<EVisibleMessageState>(EVisibleMessageState.invisible);
  const [createClientState, setCreateClientState] =
    useState<ECreateClientState>(ECreateClientState.invisible);
  const [cartState, setCartState] = useState<ECartState>(ECartState.invisible);
  const [actionsMenuState, setActionsMenuState] = useState<EActionsMenuState>(
    EActionsMenuState.invisible,
  );
  const [createClientBackendState, setCreateClientBackendState] =
    useState<ECreateClientBackendState>(ECreateClientBackendState.send);
  const [isLoaded, setIsLoaded] = useState(false);
  const [socket, setSocket] = useState<Socket>(
    io(
      globalSelectedBackend +
        "/shopifywidget?domain=" +
        domain +
        "&&path=" +
        shopifyCurrentPath +
        "&&marketId=" +
        marketId +
        "&&languageCode=" +
        languageCode,
      {
        forceNew: true,
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
      },
    ),
  );
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [nameError, setNameError] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<boolean>(false);
  const [phoneError, setPhoneError] = useState<boolean>(false);
  const [subscriptionState, setSubscriptionState] = useState<boolean>(false);
  const [cart, setCart] = useState<ICart | null>(null);
  const [isCartLoaded, setIsCartLoaded] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isSendButtonActive, setIsSendButtonActive] = useState<boolean>(true);
  const [isCreatingClient, setIsCreatingClient] = useState<boolean>(false);
  const [clientCreated, setClientCreated] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Socket Reference
  const socketRef = useRef(socket);

  // Constants
  const cookies = new Cookies();
  const ecommerceEmojis = [
    "😊",
    "🛍️",
    "📦",
    "💳",
    "🤑",
    "🛒",
    "💬",
    "👍",
    "📢",
    "📆",
    "✉️",
    "🔍",
    "🎁",
    "📱",
    "💻",
    "📋",
    "🌟",
    "💬",
    "❓",
    "💯",
    "🐗",
  ];

  /**
   * actions menu configuration
   * to add new items, simply add a new object to this array with:
   * - id: unique identifier
   * - label: display text
   * - icon: svg icon component
   * - onClick: handler function
   */
  const actionsMenuItems = [
    {
      id: "image",
      label: "Image",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
            fill="#666"
          />
        </svg>
      ),
      onClick: () => {
        fileInputRef.current?.click();
        handleCloseActionsMenu();
      },
    },
    // example: add video option
    // {
    //   id: "video",
    //   label: "Video",
    //   icon: (
    //     <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    //       <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" fill="#666" />
    //     </svg>
    //   ),
    //   onClick: () => {
    //     // handle video upload
    //     handleCloseActionsMenu();
    //   },
    // },
  ];

  // Initial functions

  // 1. Initialize websocket parameteres

  useEffect(() => {
    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionsMenuRef.current &&
        !actionsMenuRef.current.contains(event.target as Node)
      ) {
        handleCloseActionsMenu();
      }
    };

    if (actionsMenuState === EActionsMenuState.visible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [actionsMenuState]);

  // cleanup image preview url on unmount
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const initializeChat = async () => {
    // Check for params in the url
    const urlParams = new URLSearchParams(window.location.search);
    // Get Wizyopen parameter
    const wizyOpen = urlParams.get("wizyopen");

    // If there is a wizyopen true parameter
    if (wizyOpen === "true") {
      handleToggleChat();
    }

    // Start backend comunication
    const clientCookie = cookies.get(
      isAdmin ? "WIZY_CLIENT_ADMIN_" + domain : "WIZY_CLIENT_" + domain,
    );

    // If there is a cookie initizalize the websocket
    if (clientCookie !== undefined) {
      setClientCreated(true);
      handleSocketConnection(EConnectionType.initial);
      setIsLoaded(true);
      // If there isn't a cookie only get the outboundmessage
    } else {
      getOutboundMessage(domain, shopifyCurrentPath);
    }
  };

  // 2.1 If a client is already created then initialize websocket

  // Websocket functions
  // conections and mesage process
  const handleSocketConnection = (connectionType: EConnectionType) => {
    // Connections can be initial, message attempting or brute (in case of failure)
    if (
      connectionType === EConnectionType.initial ||
      connectionType === EConnectionType.message
    ) {
      // If websocket is already initiated
      if (socket) {
        // Handle connection
        socket.connect();

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("newMessage", onMessageEvent);
        socket.on("typing", onTyping);
        socket.on(
          "init",
          connectionType === EConnectionType.initial
            ? onInitInitial
            : onInitMessage,
        );

        return () => {
          socket.off("connect", onConnect);
          socket.off("disconnect", onDisconnect);
          socket.off("newMessage", onMessageEvent);
          socket.off("typing", onTyping);
          socket.off(
            "init",
            connectionType === EConnectionType.initial
              ? onInitInitial
              : onInitMessage,
          );
          socket.disconnect();
        };
      }
    } else if (connectionType === EConnectionType.brute) {
      // Initialize a provisional websocket
      const provisionalSocket = io(
        globalSelectedBackend +
          "/shopifywidget?domain=" +
          domain +
          "&&path=" +
          shopifyCurrentPath,
        {
          forceNew: true,
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
        },
      );
      // Handle connection
      provisionalSocket.connect();

      provisionalSocket.on("connect", onConnect);
      provisionalSocket.on("disconnect", onDisconnect);
      provisionalSocket.on("newMessage", onMessageEvent);
      provisionalSocket.on("typing", onTyping);
      provisionalSocket.on("init", onInitBrute);

      setSocket(provisionalSocket);

      return () => {
        provisionalSocket.off("connect", onConnect);
        provisionalSocket.off("disconnect", onDisconnect);
        provisionalSocket.off("newMessage", onMessageEvent);
        provisionalSocket.off("typing", onTyping);
        provisionalSocket.off("init", onInitBrute);
        provisionalSocket.disconnect();
      };
    }
  };

  // Websocket connections
  function onConnect() {}

  function onDisconnect() {}

  // Websocket message events
  function onMessageEvent(value: any) {
    setLastMessage(value);
  }

  function onTyping(value: string) {
    setIsTyping(true);
  }

  // Websocket initial handshakes (Differente types)
  function onInitInitial(value: string) {
    setInit({
      init: value,
      type: EConnectionType.initial,
    });
  }

  function onInitMessage(value: string) {
    setInit({
      init: value,
      type: EConnectionType.message,
    });
  }

  function onInitBrute(value: string) {
    setInit({
      init: value,
      type: EConnectionType.brute,
    });
  }

  // 2.2 If a client was not connected already then get outbound message

  const getOutboundMessage = async (
    domain: string,
    path: string,
  ): Promise<void> => {
    try {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({
        domain: domain,
        path: path,
        marketId: marketId,
        languageCode: languageCode,
      });

      const response = await fetch(
        globalSelectedBackend + "/shopifywidgetrest/outboundmessage",
        {
          method: "POST",
          headers: myHeaders,
          body: raw,
          credentials: "include",
          redirect: "follow",
        },
      );
      if (!response.ok) {
        let errorText = await response.text();
        console.log(errorText);
      } else {
        setLastMessage(JSON.parse(await response.text()));
        setIsLoaded(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // 3. Either way run custom code

  useEffect(() => {
    if (isLoaded) {
      // Some times people want the widget to do weird stuff, and as an inclusive company, we do not judge, we just do it
      // Example: "I want the widget to suck my client's dick"
      // This snap of code allows you to run custom javascript code from a string saved in thye db without having to do a
      // new release or keep contaminating our codebase with weird flags such as shouldSuckDick.

      // Here is an example of a string that changes the color of something inside and outside the iframe:

      // OUTSIDE OF THE IFRAME
      // document.getElementsByClassName("Test__reset__outter")[0].style.backgroundColor = "#000000";

      // INSIDE OF THE IFRAME
      // var iframe = document.getElementById('WizybotShopifyWidget__iframe__outter__id');
      // var innerDoc = iframe.contentWindow.document;
      // innerDoc.getElementsByClassName("WizybotShopifyWidget__open__button__notification")[0].style.backgroundColor = "#000000";

      // Here is an example of how to extract variables from the backend:

      // const dataDiv = document.getElementById("WizybotShopifyWidget__data__div");
      // const data = dataDiv?.dataset;
      // console.log(JSON.parse(data.storesetup).setup.isRedirect);

      if (isNotBlank(widget.setup.customWidgetCode)) {
        // eslint-disable-next-line
        eval(
          `try { ${widget.setup.customWidgetCode} } catch (e) { console.log("Error in custom widget script") }`,
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  // Use Effect runtime functions
  // Check if cart is loaded
  useEffect(() => {
    setIsCartLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  // Receive a new message
  useEffect(() => {
    if (lastMessage !== null) {
      // Create message for observability if callback is provided
      const newObservabilityMessage: IWidgetMessage | null = onMessagesUpdate
        ? {
            id: lastMessage.id,
            content: lastMessage.content,
            createDate: lastMessage.createDate,
            role: lastMessage.role,
            name: lastMessage.name || undefined,
            toolCalls: lastMessage.toolCalls || undefined,
            extraUIComponents: lastMessage.extraUIComponents
              ? JSON.parse(lastMessage.extraUIComponents)
              : null,
            extraUIComponentReference: lastMessage.extraUIComponentReference,
            hasMedia: lastMessage.hasMedia,
            interpretationForLLM: lastMessage.interpretationForLLM || undefined,
            status: lastMessage.status,
            showLogs: false,
            messageLogs: lastMessage.messageLogs
              ? typeof lastMessage.messageLogs === "string"
                ? JSON.parse(lastMessage.messageLogs)
                : lastMessage.messageLogs
              : null,
          }
        : null;

      // Only add visible messages to local state (for widget display)
      // console.log(lastMessage);
      const hasVisibleContent =
        (lastMessage.content && lastMessage.content !== "") ||
        lastMessage.hasMedia ||
        lastMessage.extraUIComponents ||
        lastMessage.extraUIComponentReference;

      if (hasVisibleContent) {
        if (clientCreated) {
          // Append to local state and update observability
          if (onMessagesUpdate && newObservabilityMessage) {
            updateObservabilityMessages((previous: IWidgetMessage[]) => [
              ...previous,
              newObservabilityMessage,
            ]);
          }
          setMessages((previous) => [
            ...previous,
            {
              id: lastMessage.id ? lastMessage.id : "",
              content: lastMessage.content,
              createDate: lastMessage.createDate,
              role: lastMessage.role,
              name: lastMessage.name,
              functionCall: lastMessage.functionCall,
              toolCalls: lastMessage.toolCalls,
              toolCallId: lastMessage.toolCallId,
              extraUIComponents: lastMessage.extraUIComponents
                ? JSON.parse(lastMessage.extraUIComponents)
                : null,
              extraUIComponentReference: lastMessage.extraUIComponentReference,
              sourceType: lastMessage.sourceType,
              sourceId: lastMessage.sourceId,
              hasMedia: lastMessage.hasMedia,
              status: lastMessage.status,
              isAsset: lastMessage.isAsset,
            },
          ]);
          setIsNewMessage(true);
          setIsTyping(false);
        } else {
          // Reset local state and update observability (first message)
          if (onMessagesUpdate && newObservabilityMessage) {
            updateObservabilityMessages(() => [newObservabilityMessage]);
          }
          setMessages([
            {
              id: lastMessage.id ? lastMessage.id : "",
              content: lastMessage.content,
              createDate: lastMessage.createDate,
              role: lastMessage.role,
              name: lastMessage.name,
              functionCall: lastMessage.functionCall,
              toolCalls: lastMessage.toolCalls,
              toolCallId: lastMessage.toolCallId,
              extraUIComponents: lastMessage.extraUIComponents
                ? JSON.parse(lastMessage.extraUIComponents)
                : null,
              extraUIComponentReference: lastMessage.extraUIComponentReference,
              sourceType: lastMessage.sourceType,
              sourceId: lastMessage.sourceId,
              hasMedia: lastMessage.hasMedia,
              status: lastMessage.status,
              isAsset: lastMessage.isAsset,
            },
          ]);
          setIsNewMessage(true);
          setIsTyping(false);
        }
      } else {
        // Message not visible in widget, but add for observability
        if (onMessagesUpdate && newObservabilityMessage) {
          if (clientCreated) {
            updateObservabilityMessages((previous) => [
              ...previous,
              newObservabilityMessage,
            ]);
          } else {
            updateObservabilityMessages(() => [newObservabilityMessage]);
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage]);

  // When a new message is received then show it as a outbound message
  useEffect(() => {
    if (isLoaded) {
      if (chatState === EChatState.close && !widget.setup.hideOutboundMessage) {
        const lastMessage = messages.at(-1);
        let lastVisibleMessage = lastMessage?.content ?? "";

        // Display the product title as the visible message for the product card
        if (lastMessage?.extraUIComponents) {
          if (
            lastMessage.extraUIComponents[0]?.type ===
            EExtraUIComponentTypes.PRODUCT_CARD
          ) {
            lastVisibleMessage = lastMessage.extraUIComponents[0].content.title;
          }
        }

        // Display the product title as the visible message for the new product card
        if (lastMessage?.extraUIComponentReference?.[0]) {
          lastVisibleMessage = getNewExtraUIComponentTitle(
            lastMessage.extraUIComponentReference[0],
            widget.setup.mainLanguage,
          );
        }

        setVisibleMessage(lastVisibleMessage);
        setVisibleMessageState(EVisibleMessageState.visible);
        showNewMessage();
        setTimeout(() => {
          setVisibleMessageOpacity(EVisibleMessageState.visible);
        }, 100);
        setTimeout(() => {
          setVisibleMessageOpacity(EVisibleMessageState.invisible);
        }, 5000);
        setTimeout(() => {
          setVisibleMessageState(EVisibleMessageState.invisible);
          hideNewMessage();
        }, 5800);
      } else {
        const clientCookie = cookies.get(
          isAdmin ? "WIZY_CLIENT_ADMIN_" + domain : "WIZY_CLIENT_" + domain,
        );
        if (chatState === EChatState.open && clientCookie !== undefined) {
          socketEmit("clientRead", {
            clientId: cookies.get(
              isAdmin ? "WIZY_CLIENT_ADMIN_" + domain : "WIZY_CLIENT_" + domain,
            ),
            shopDomain: domain,
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewMessage]);

  // Update client init when it is recieved
  useEffect(() => {
    if (isLoaded) {
      if (init.type === EConnectionType.message) {
        handleMessageSend();
      } else {
        updateClient(init.init);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [init]);

  // Reset reference to new websocket in case it gets updated
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  // Internal Functions
  // Function to emit in a safe way, it asures that the message is actually sent
  const socketEmit = (
    topic: string,
    payload: any,
    retries = 3,
    delay = 1000,
  ) => {
    return new Promise<void>((resolve, reject) => {
      const attemptEmit = (attempt: number) => {
        let isAcknowledged = false; // Track if we receive a response

        // Emit the event with an acknowledgment callback
        socketRef.current.emit(topic, payload, (response: any) => {
          isAcknowledged = true; // Mark acknowledgment as received
          resolve(); // Successfully resolved
        });

        // Set a timeout to check if the server responded in 3 seconds
        setTimeout(() => {
          if (!isAcknowledged) {
            if (attempt < retries - 1) {
              console.warn(`No response, retrying in ${delay}ms...`);
              handleSocketConnection(EConnectionType.brute);
              setTimeout(() => attemptEmit(attempt + 1), delay); // Retry with backoff
            } else {
              console.error("Emit failed after maximum retries.");
              reject(new Error("Server did not respond after retries."));
            }
          }
        }, 3000); // 3 seconds timeout
      };

      attemptEmit(0); // Start with the first attempt
    });
  };

  // Send message
  // Helper: upload image to S3 and emit socket message with media info
  const uploadImageAndEmit = async (
    content: string,
    clientId: string,
    image: File,
  ) => {
    // Use existing helper to get client IP/location info
    const clientInfo = JSON.parse(await getClientIpInfo());
    const location: string =
      clientInfo?.location?.city +
      ", " +
      clientInfo?.location?.country?.name +
      " " +
      clientInfo?.location?.country?.flag?.emoji;
    const computer: string =
      window.navigator.platform === undefined ? "" : window.navigator.platform;

    //create formData with all the info needed
    const formData = new FormData();
    formData.append("file", image);
    formData.append("clientId", clientId);
    formData.append("location", location);
    formData.append("computer", computer);

    const uploadResponse = await fetch(
      globalSelectedBackend + "/shopifywidgetrest/mediaupload/" + domain,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      },
    );

    if (!uploadResponse.ok) {
      if (uploadResponse.status === 403) {
        throw new Error("Upload limit reached. Please try again later.");
      }
      console.error("Failed to upload image:", uploadResponse);
      throw new Error("Failed to upload image");
    }

    const responseJson = await uploadResponse.json();
    const { mediaId } = responseJson;

    // 4. Emit via socket WITH media info (await to catch delivery failures)
    await socketEmit("newMessage", {
      content: content,
      clientId: clientId,
      isTest: isTest,
      shopDomain: domain,
      path: shopifyCurrentPath,
      media: {
        mediaId: mediaId,
        mediaType: image.type,
        mediaName: image.name,
      },
    });
  };

  // Helper: get localized upload error message
  const getUploadErrorMessage = (error?: unknown): string => {
    const isIpBlocked =
      error instanceof Error &&
      error.message === "Upload limit reached. Please try again later.";

    if (isIpBlocked) {
      switch (widget.setup.mainLanguage) {
        case "Spanish":
          return "Tu dirección IP ha sido bloqueada por exceder el límite de envíos. ";
        case "French":
          return "Votre adresse IP a été bloquée pour avoir dépassé la limite d'envoi.";
        case "Portuguese":
          return "Seu endereço IP foi bloqueado por exceder o limite de envios.";
        case "German":
          return "Ihre IP-Adresse wurde gesperrt, da das Sendelimit überschritten wurde.";
        case "Italian":
          return "Il tuo indirizzo IP è stato bloccato per aver superato il limite di invio.";
        default:
          return "Your IP address has been blocked due to exceeding the upload limit.";
      }
    }

    switch (widget.setup.mainLanguage) {
      case "Spanish":
        return "Error al enviar la imagen. Por favor, intenta de nuevo.";
      case "French":
        return "Erreur lors de l'envoi de l'image. Veuillez réessayer.";
      case "Portuguese":
        return "Erro ao enviar a imagem. Por favor, tente novamente.";
      case "German":
        return "Fehler beim Senden des Bildes. Bitte versuchen Sie es erneut.";
      case "Italian":
        return "Errore nell'invio dell'immagine. Per favore, riprova.";
      default:
        return "Error sending the image. Please try again.";
    }
  };

  const handleMessageSend = async () => {
    if (socket.connected) {
      if (!isCreatingClient) {
        const hasImage = selectedImage !== null;
        const hasText = newMessage.replaceAll(" ", "") !== "";

        // Must have at least text OR image to send
        if (!hasText && !hasImage) return;

        const clientId = cookies.get(
          isAdmin ? "WIZY_CLIENT_ADMIN_" + domain : "WIZY_CLIENT_" + domain,
        );

        if (clientId !== undefined) {
          // === EXISTING CLIENT FLOW ==
          // For WordPress returning clients, register sale intent with current cart UUID on first message
          if (platform === "WORDPRESS" && !isDashboard && !wordpressSaleCreatedRef.current) {
            wordpressSaleCreatedRef.current = true;
            createSaleOption(clientId);
          }
          const content = newMessage ?? '';
          const currentImage = selectedImage;
          const currentPreviewUrl = imagePreviewUrl;

          // Create local message for immediate UI display
          const userMessage = {
            content: content ?? "",
            createDate: new Date().toISOString(),
            role: EMessageRole.user,
            name: null,
            functionCall: null,
            toolCalls: null,
            toolCallId: null,
            extraUIComponents: [],
            extraUIComponentReference: [],
            sourceType: EMessageSourceTypes.SHOPIFY_WIDGET,
            sourceId: null,
            hasMedia: hasImage,
            localMediaUrl:
              hasImage && currentPreviewUrl ? currentPreviewUrl : undefined,
            isAsset: false,
            status: EMessageStatus.SENT,
          };

          // Update both local state and observability
          setMessages((previous) => [...previous, userMessage]);
          if (onMessagesUpdate) {
            updateObservabilityMessages((previous) => [
              ...previous,
              {
                content: content,
                createDate: new Date().toISOString(),
                role: EMessageRole.user,
                showLogs: false,
                messageLogs: null,
                hasMedia: hasImage,
                localMedia:
                  hasImage && selectedImage ? selectedImage : undefined,
              },
            ]);
          }

          // Clear input state immediately for responsiveness
          setNewMessage("");
          if (hasImage) {
            handleClearImageSelection();
          }

          if (hasImage && currentImage) {
            // IMAGE FLOW (with no text caption)
            try {
              await uploadImageAndEmit(content, clientId, currentImage);
            } catch (error) {
              console.error("Error uploading image:", error);

              // Rollback: remove the optimistic message
              setMessages((previous) => previous.slice(0, -1));
              if (onMessagesUpdate) {
                updateObservabilityMessages((previous) =>
                  previous.slice(0, -1),
                );
              }

              // Restore input state so user can retry
              setNewMessage(content);
              setSelectedImage(currentImage);
              setImagePreviewUrl(currentPreviewUrl);

              // Show localized error message in chat
              const errorMsg: IMessage = {
                id: "",
                content: getUploadErrorMessage(error),
                createDate: new Date().toISOString(),
                role: EMessageRole.ai,
                name: "",
                functionCall: "",
                toolCalls: "",
                toolCallId: "",
                extraUIComponents: null,
                extraUIComponentReference: null,
                sourceType: EMessageSourceTypes.SHOPIFY_WIDGET,
                sourceId: null,
                hasMedia: false,
                isAsset: false,
                status: EMessageStatus.SENT,
              };
              setMessages((previous) => [...previous, errorMsg]);
            }
          } else {
            // TEXT-ONLY FLOW (existing behavior)
            socketEmit("newMessage", {
              content: content,
              clientId: clientId,
              isTest: isTest,
              shopDomain: domain,
              path: shopifyCurrentPath,
            });
          }
        } else {
          // === NO CLIENT COOKIE ===
          if (clientCreated) {
            const errorMessage = {
              id: "",
              content:
                "We are sorry, but the widget has to be tested in your own web [page](https://" +
                domain +
                "). Enter now! It's already available!",
              createDate: messages[0].createDate,
              role: EMessageRole.ai,
              name: "",
              functionCall: "",
              toolCalls: "",
              toolCallId: "",
              extraUIComponents: null,
              extraUIComponentReference: null,
              sourceType: EMessageSourceTypes.SHOPIFY_WIDGET,
              sourceId: null,
              hasMedia: false,
              isAsset: false,
              status: EMessageStatus.SENT,
            };

            // Update both local state and observability
            setMessages((previous) => [...previous, errorMessage]);
            if (onMessagesUpdate) {
              updateObservabilityMessages((previous) => [
                ...previous,
                {
                  id: "",
                  content: errorMessage.content,
                  createDate: errorMessage.createDate,
                  role: EMessageRole.ai,
                  showLogs: false,
                  messageLogs: null,
                },
              ]);
            }

            setIsNewMessage(true);
            setIsTyping(false);
          } else {
            if (widget.setup.emailRetrievalMethod === "Mandatory") {
              handleToogleCreateClient();
            } else {
              // === AUTO-CREATE CLIENT FLOW (with image support) ===
              const content = newMessage ?? "";
              const currentImage = selectedImage;
              const currentPreviewUrl = imagePreviewUrl;

              const userMessage = {
                content: content ?? "",
                createDate: new Date().toISOString(),
                role: EMessageRole.user,
                name: null,
                functionCall: null,
                toolCalls: null,
                toolCallId: null,
                extraUIComponents: [],
                extraUIComponentReference: [],
                sourceType: EMessageSourceTypes.SHOPIFY_WIDGET,
                sourceId: null,
                hasMedia: hasImage,
                localMediaUrl:
                  hasImage && currentPreviewUrl ? currentPreviewUrl : undefined,
                isAsset: false,
                status: EMessageStatus.SENT,
              };

              // Update local state immediately for widget display
              setMessages((previous) => [...previous, userMessage]);

              // Clear input state
              setNewMessage("");
              if (hasImage) {
                handleClearImageSelection();
              }

              // Create client first (sets cookie)
              await createClientAuto();

              // Get the newly created clientId from cookie
              const newClientId = cookies.get(
                isAdmin
                  ? "WIZY_CLIENT_ADMIN_" + domain
                  : "WIZY_CLIENT_" + domain,
              );

              if (!newClientId) return;

              // Update observability AFTER client is created
              if (onMessagesUpdate) {
                updateObservabilityMessages((previous) => [
                  ...previous,
                  {
                    content: content,
                    createDate: new Date().toISOString(),
                    role: EMessageRole.user,
                    showLogs: false,
                    messageLogs: null,
                    hasMedia: hasImage,
                    localMedia:
                      hasImage && currentImage ? currentImage : undefined,
                  },
                ]);
              }

              if (hasImage && currentImage) {
                // IMAGE FLOW after client creation
                try {
                  await uploadImageAndEmit(content, newClientId, currentImage);
                } catch (error) {
                  console.error("Error uploading image:", error);

                  // Rollback: remove the optimistic message
                  setMessages((previous) => previous.slice(0, -1));
                  if (onMessagesUpdate) {
                    updateObservabilityMessages((previous) =>
                      previous.slice(0, -1),
                    );
                  }

                  // Restore input state so user can retry
                  setNewMessage(content);
                  setSelectedImage(currentImage);
                  setImagePreviewUrl(currentPreviewUrl);

                  const errorMsg: IMessage = {
                    id: "",
                    content: getUploadErrorMessage(error),
                    createDate: new Date().toISOString(),
                    role: EMessageRole.ai,
                    name: "",
                    functionCall: "",
                    toolCalls: "",
                    toolCallId: "",
                    extraUIComponents: null,
                    extraUIComponentReference: null,
                    sourceType: EMessageSourceTypes.SHOPIFY_WIDGET,
                    sourceId: null,
                    hasMedia: false,
                    isAsset: false,
                    status: EMessageStatus.SENT,
                  };
                  setMessages((previous) => [...previous, errorMsg]);
                }
              } else {
                // TEXT-ONLY FLOW after client creation
                socketEmit("newMessage", {
                  content: content,
                  clientId: newClientId,
                  isTest: isTest,
                  shopDomain: domain,
                  path: shopifyCurrentPath,
                });
              }
            }
          }
        }
      }
    } else {
      handleSocketConnection(EConnectionType.message);
    }
  };

  // toggle actions menu visibility
  const handleToggleActionsMenu = () => {
    setActionsMenuState((prevState) =>
      prevState === EActionsMenuState.invisible
        ? EActionsMenuState.visible
        : EActionsMenuState.invisible,
    );
  };

  // close actions menu
  const handleCloseActionsMenu = () => {
    setActionsMenuState(EActionsMenuState.invisible);
  };

  // handle image selection and validation
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      // show error message based on language
      const errorContent =
        widget.setup.mainLanguage === "English"
          ? "Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP)."
          : widget.setup.mainLanguage === "Spanish"
            ? "Tipo de archivo no válido. Por favor, sube una imagen (JPEG, PNG, GIF o WebP)."
            : widget.setup.mainLanguage === "French"
              ? "Type de fichier invalide. Veuillez télécharger une image (JPEG, PNG, GIF ou WebP)."
              : widget.setup.mainLanguage === "Portuguese"
                ? "Tipo de arquivo inválido. Por favor, envie uma imagem (JPEG, PNG, GIF ou WebP)."
                : widget.setup.mainLanguage === "German"
                  ? "Ungültiger Dateityp. Bitte laden Sie ein Bild hoch (JPEG, PNG, GIF oder WebP)."
                  : widget.setup.mainLanguage === "Italian"
                    ? "Tipo di file non valido. Si prega di caricare un'immagine (JPEG, PNG, GIF o WebP)."
                    : "Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP).";

      const errorMessage: IMessage = {
        id: "",
        content: errorContent,
        createDate: new Date().toISOString(),
        role: EMessageRole.ai,
        name: "",
        functionCall: "",
        toolCalls: "",
        toolCallId: "",
        extraUIComponents: null,
        extraUIComponentReference: null,
        sourceType: EMessageSourceTypes.SHOPIFY_WIDGET,
        sourceId: null,
        hasMedia: false,
        isAsset: false,
        status: EMessageStatus.SENT,
      };

      // update both local state and observability
      setMessages((previous) => [...previous, errorMessage]);
      if (onMessagesUpdate) {
        updateObservabilityMessages((previous) => [
          ...previous,
          {
            id: "",
            content: errorMessage.content,
            createDate: errorMessage.createDate,
            role: EMessageRole.ai,
            showLogs: false,
            messageLogs: null,
          },
        ]);
      }

      // reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    // validate file size (5mb limit)
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      // show error message based on language
      const errorContent =
        widget.setup.mainLanguage === "English"
          ? "File size exceeds the limit. Please upload an image smaller than 5MB."
          : widget.setup.mainLanguage === "Spanish"
            ? "El tamaño del archivo excede el límite. Por favor, sube una imagen menor a 5MB."
            : widget.setup.mainLanguage === "French"
              ? "La taille du fichier dépasse la limite. Veuillez télécharger une image de moins de 5 Mo."
              : widget.setup.mainLanguage === "Portuguese"
                ? "O tamanho do arquivo excede o limite. Por favor, envie uma imagem menor que 5MB."
                : widget.setup.mainLanguage === "German"
                  ? "Die Dateigröße überschreitet das Limit. Bitte laden Sie ein Bild unter 5 MB hoch."
                  : widget.setup.mainLanguage === "Italian"
                    ? "La dimensione del file supera il limite. Si prega di caricare un'immagine inferiore a 5 MB."
                    : "File size exceeds the limit. Please upload an image smaller than 5MB.";

      const errorMessage: IMessage = {
        id: "",
        content: errorContent,
        createDate: new Date().toISOString(),
        role: EMessageRole.ai,
        name: "",
        functionCall: "",
        toolCalls: "",
        toolCallId: "",
        extraUIComponents: null,
        extraUIComponentReference: null,
        sourceType: EMessageSourceTypes.SHOPIFY_WIDGET,
        sourceId: null,
        hasMedia: false,
        isAsset: false,
        status: EMessageStatus.SENT,
      };

      // update both local state and observability
      setMessages((previous) => [...previous, errorMessage]);
      if (onMessagesUpdate) {
        updateObservabilityMessages((previous) => [
          ...previous,
          {
            id: "",
            content: errorMessage.content,
            createDate: errorMessage.createDate,
            role: EMessageRole.ai,
            showLogs: false,
            messageLogs: null,
          },
        ]);
      }

      // reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    // create preview url
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
    setSelectedImage(file);
    setNewMessage("");

    // close actions menu
    handleCloseActionsMenu();
  };

  // remove image preview (revokes blob URL - used when user cancels selection)
  const handleRemoveImagePreview = () => {
    // revoke object url to free memory
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
    setSelectedImage(null);

    // reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // clear image selection without revoking blob URL (used after send -
  // the blob URL is still referenced by localMediaUrl in the sent message)
  const handleClearImageSelection = () => {
    setImagePreviewUrl(null);
    setSelectedImage(null);

    // reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Open and close chat
  const handleToggleChat = () => {
    if (isRedirect) {
      // Check if there is any additional text for redirection link
      // This additional text can be added dinamically from store to store using custom scripts this way:

      // const dataDiv = document.getElementById("WizybotShopifyWidget__data__div");
      // const text = "?text=Hello520there!"
      // dataDiv.setAttribute('data-additionaltextredirectionlink', text)

      const dataDiv = document.getElementById(
        "WizybotShopifyWidget__data__div",
      );
      const additionalText: any =
        dataDiv?.dataset.additionaltextredirectionlink;

      // Add additional text if is the case
      if (additionalText) {
        window.open(redirectionLink + additionalText, "_blank");
      } else {
        window.open(redirectionLink, "_blank");
      }
    } else {
      if (chatState === EChatState.close) {
        setChatState(EChatState.open);
        setChatStateVisibility(EChatState.open);
        setIsOpen(true);
        setIsNewMessage(false);
        const clientCookie = cookies.get(
          isAdmin ? "WIZY_CLIENT_ADMIN_" + domain : "WIZY_CLIENT_" + domain,
        );
        if (clientCookie !== undefined) {
          try {
            socketEmit("clientRead", {
              clientId: cookies.get(
                isAdmin
                  ? "WIZY_CLIENT_ADMIN_" + domain
                  : "WIZY_CLIENT_" + domain,
              ),
              shopDomain: domain,
            });
          } catch (e) {}
        }
      } else {
        setChatState(EChatState.close);
        setTimeout(() => {
          setIsOpen(false);
          setChatStateVisibility(EChatState.close);
        }, 800);
      }
    }
  };

  // Open and close obligatory create client prompt
  const handleToogleCreateClient = () => {
    if (createClientState === ECreateClientState.invisible) {
      setCreateClientState(ECreateClientState.visible);
      setIsNewMessage(false);
      setIsSendButtonActive(false);
    } else {
      setIsSendButtonActive(true);
      setCreateClientState(ECreateClientState.invisible);
    }
  };

  // Open and close cart view from widget
  const handleToggleCartState = async () => {
    if (cartState === ECartState.invisible) {
      getCart().then(() => {
        setCartState(ECartState.visible);
      });
      setIsSendButtonActive(false);
    } else {
      setIsSendButtonActive(true);
      setCartState(ECartState.invisible);
    }
  };

  // Add random emoji from the list
  const addRandomNiceEmoji = () => {
    const randomIndex = Math.floor(Math.random() * ecommerceEmojis.length);
    const randomEmoji = ecommerceEmojis[randomIndex];
    setNewMessage(newMessage + randomEmoji);
  };

  // Get cart content in the moment
  const getCart = async () => {
    if (shopifyRootPath !== null && shopifyRootPath !== "") {
      setIsCartLoaded(false);
      await fetch(shopifyRootPath + "cart.js", {
        method: "GET",
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          setCart({
            totalPrice: data.total_price,
            currency: data.currency,
            items: data.items.map((item: any) => {
              return {
                id: item.id,
                quantity: item.quantity,
                productTitle: item.product_title,
                variantTitle: item.variant_title,
                linePrice: item.line_price,
                image: item.image,
                url: item.url,
              };
            }),
          });
        })
        .catch((error) => {
          console.error("Error:", error);
          setIsCartLoaded(true);
        });
    } else {
      console.log("Not in shopify");
      setIsCartLoaded(true);
    }
  };

  // Update cart content with new quantity
  const updateCart = async (cartToUpdate: ICart) => {
    setIsCartLoaded(false);
    if (
      shopifyRootPath !== null &&
      shopifyRootPath !== "" &&
      cartToUpdate !== null
    ) {
      const updates = cartToUpdate.items.reduce(
        (a, v) => ({ ...a, [v.id]: v.quantity }),
        {},
      );
      fetch(shopifyRootPath + "cart/update.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updates }),
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          setCart({
            totalPrice: data.total_price,
            currency: data.currency,
            items: data.items.map((item: any) => {
              return {
                id: item.id,
                quantity: item.quantity,
                productTitle: item.product_title,
                variantTitle: item.variant_title,
                linePrice: item.line_price,
                image: item.image,
                url: item.url,
              };
            }),
          });
          const clientId = cookies.get(
            isAdmin ? "WIZY_CLIENT_ADMIN_" + domain : "WIZY_CLIENT_" + domain,
          );
          if (clientId) {
            fetch(globalSelectedBackend + "/carts/" + clientId, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                total: data.total_price / 100,
                sourceType: "shopify widget",
                cartToken: data.token,
                items: data.items.map((item: any) => ({
                  shopifyVariantId: String(item.id),
                  unitPrice:
                    item.quantity > 0
                      ? item.line_price / item.quantity / 100
                      : 0,
                  quantity: item.quantity,
                })),
              }),
            }).catch((e) => console.error("Error syncing cart to backend:", e));
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          setIsCartLoaded(true);
        });
    } else {
      console.log("Not in shopify");
      setIsCartLoaded(true);
    }
  };

  // Create client sale option
  const createSaleOption = async (clientId: string) => {
    if (shopifyRootPath !== null && shopifyRootPath !== "" && !isDashboard) {
      await fetch(shopifyRootPath + "cart/update.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attributes: { wizybot: true },
          note: widget.setup.preventSaleNoteCreation ? "" : "Wizybot sale!",
        }),
      })
        .then(async (response) => {
          await fetch(shopifyRootPath + "cart.js", {
            method: "GET",
          })
            .then((response) => {
              return response.json();
            })
            .then(async (data) => {
              var raw = JSON.stringify({
                cartId: data.token.split("?")[0],
              });
              var myHeaders = new Headers();
              myHeaders.append("Content-Type", "application/json");
              await fetch(
                globalSelectedBackend +
                  "/sale/" +
                  domain +
                  "/" +
                  clientId +
                  "/createsale",
                {
                  method: "POST",
                  headers: myHeaders,
                  body: raw,
                  credentials: "include",
                  redirect: "follow",
                },
              )
                .then(async (response) => {
                  if (!response.ok) {
                    let errorText = await response.text();
                    let errorJSON = JSON.parse(errorText);
                    throw new Error(errorJSON.message);
                  } else {
                    return response.text();
                  }
                })
                .then((result) => JSON.parse(result))
                .then((JSONresult) => {})
                .catch((error) => {
                  console.log("Error:", error);
                });
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else if (platform === "WORDPRESS" && !isDashboard) {
      try {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        await fetch(
          globalSelectedBackend + "/sale/" + domain + "/" + clientId + "/createsale",
          {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify({ cartId: wizyCartId || null }),
            credentials: "include",
            redirect: "follow",
          }
        );
      } catch (error) {
        console.error("Error creating WordPress sale:", error);
      }
    }
  };

  const nameRequired = [
    EDataRetrievalType.NAME,
    EDataRetrievalType.NAME_EMAIL,
    EDataRetrievalType.NAME_PHONE,
    EDataRetrievalType.NAME_EMAIL_PHONE,
  ].includes(widget.setup.dataRetrievalType as EDataRetrievalType);

  const emailRequired = [
    EDataRetrievalType.EMAIL,
    EDataRetrievalType.BOTH,
    EDataRetrievalType.NAME_EMAIL,
    EDataRetrievalType.NAME_EMAIL_PHONE,
  ].includes(widget.setup.dataRetrievalType as EDataRetrievalType);

  const phoneRequired = [
    EDataRetrievalType.PHONE,
    EDataRetrievalType.BOTH,
    EDataRetrievalType.NAME_PHONE,
    EDataRetrievalType.NAME_EMAIL_PHONE,
  ].includes(widget.setup.dataRetrievalType as EDataRetrievalType);

  // Create client from obligatory prompt
  const createClient = async () => {
    if (isCreatingClient) return;
    setIsCreatingClient(true);

    const emptyName = nameRequired && name.trim() === "";
    const emptyEmail = emailRequired && email.trim() === "";
    const emptyPhone = phoneRequired && phone === "";

    if (emptyName || emptyEmail || emptyPhone) {
      setNameError(emptyName);
      setEmailError(emptyEmail);
      setPhoneError(emptyPhone);
      setIsCreatingClient(false);
      return;
    }

    const invalidFields = await getContactDataValidation(
      { required: phoneRequired, value: phone },
      { required: emailRequired, value: email },
      { required: nameRequired, value: name },
    );

    setNameError(invalidFields.includes("name"));
    setEmailError(invalidFields.includes("email"));
    setPhoneError(invalidFields.includes("phone"));

    if (invalidFields.length > 0) {
      setIsCreatingClient(false);
      return;
    }

    if (
      cookies.get(
        isAdmin ? "WIZY_CLIENT_ADMIN_" + domain : "WIZY_CLIENT_" + domain,
      ) !== undefined
    ) {
      setIsCreatingClient(false);
      return;
    }

    setCreateClientBackendState(ECreateClientBackendState.loading);

    const clientInfo = JSON.parse(await getClientIpInfo());

    const superClientId = cookies.get("WIZY_SUPERCLIENT_" + domain);
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      firstName: name.trim(),
      lastName: "",
      email: email.trim(),
      phone: phone.replace(/^\+/, ""),
      location:
        clientInfo.location.city +
        ", " +
        clientInfo.location.country.name +
        " " +
        clientInfo.location.country.flag.emoji,
      computer:
        window.navigator.platform === undefined
          ? ""
          : window.navigator.platform,
      ipAddress: clientInfo.ip,
      lastMessageDate: messages[0].createDate,
      lastMessage: messages[0].content,
      subscriptionState: subscriptionState,
      isShopRead: false,
      isClientRead: true,
      isAiEnabled: true,
      websocketId: init.init,
      isTest: isTest,
      superClient: superClientId ? { id: superClientId } : null,
    });

    await fetch(
      globalSelectedBackend +
        "/clients/" +
        domain +
        (isDashboard ? "/private" : ""),
      {
        method: "POST",
        headers: myHeaders,
        body: raw,
        credentials: "include",
        redirect: "follow",
      },
    )
      .then(async (response) => {
        if (!response.ok) {
          let errorText = await response.text();
          let errorJSON = JSON.parse(errorText);
          throw new Error(errorJSON.message);
        } else {
          return response.text();
        }
      })
      .then((result) => JSON.parse(result))
      .then((JSONresult) => {
        if (JSONresult.superClient?.id) {
          cookies.set(
            "WIZY_SUPERCLIENT_" + domain,
            JSONresult.superClient?.id,
            {
              path: "/",
              maxAge: 60 * 60 * 24 * 365,
            },
          );
          document.cookie = `WIZY_SUPERCLIENT_${domain}=${JSONresult.superClient?.id}; path=/; max-age=${60*60*24*365}`;
        }
        cookies.set(
          isAdmin ? "WIZY_CLIENT_ADMIN_" + domain : "WIZY_CLIENT_" + domain,
          JSONresult.id,
          { path: "/", maxAge: 60 * 60 * 24 * 365 },
        );
        document.cookie = `${isAdmin ? "WIZY_CLIENT_ADMIN_" + domain : "WIZY_CLIENT_" + domain}=${JSONresult.id}; path=/; max-age=${60*60*24*365}`;
        handleToogleCreateClient();
        createSaleOption(JSONresult.id);
        setCreateClientBackendState(ECreateClientBackendState.send);
        setClientCreated(true);
        setIsCreatingClient(false);
        handleMessageSend();
      })
      .catch((error) => {
        console.log(error);
        setIsCreatingClient(false);
      });
  };

  // Create client automatically from the start of the conversation
  const createClientAuto = async () => {
    setIsCreatingClient(true);
    if (
      cookies.get(
        isAdmin ? "WIZY_CLIENT_ADMIN_" + domain : "WIZY_CLIENT_" + domain,
      ) === undefined
    ) {
      setCreateClientBackendState(ECreateClientBackendState.loading);

      // Get client IP info
      const clientInfo = JSON.parse(await getClientIpInfo());
      setEmailError(false);

      // Check if there is a superclient cookie,
      const superClientId = cookies.get("WIZY_SUPERCLIENT_" + domain);

      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      var raw = JSON.stringify({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        location:
          clientInfo.location.city +
          ", " +
          clientInfo.location.country.name +
          " " +
          clientInfo.location.country.flag.emoji,
        computer:
          window.navigator.platform === undefined
            ? ""
            : window.navigator.platform,
        ipAddress: clientInfo.ip,
        lastMessageDate: messages[0].createDate,
        lastMessage: messages[0].content,
        subscriptionState: subscriptionState,
        isShopRead: false,
        isClientRead: true,
        isAiEnabled: true,
        isTest: isTest,
        websocketId: init.init,
        superClient: superClientId ? { id: superClientId } : null,
        marketId: marketId,
        languageCode: languageCode,
        languageUrl: languageUrl,
      });

      await fetch(
        globalSelectedBackend +
          "/clients/" +
          domain +
          (isDashboard ? "/private" : ""),
        {
          method: "POST",
          headers: myHeaders,
          body: raw,
          credentials: "include",
          redirect: "follow",
        },
      )
        .then(async (response) => {
          if (!response.ok) {
            let errorText = await response.text();
            let errorJSON = JSON.parse(errorText);
            throw new Error(errorJSON.message);
          } else {
            return response.text();
          }
        })
        .then((result) => JSON.parse(result))
        .then((JSONresult) => {
          if (JSONresult.superClient?.id) {
            cookies.set(
              "WIZY_SUPERCLIENT_" + domain,
              JSONresult.superClient.id,
              {
                path: "/",
                maxAge: 60 * 60 * 24 * 365,
              },
            );
            document.cookie = `WIZY_SUPERCLIENT_${domain}=${JSONresult.superClient.id}; path=/; max-age=${60*60*24*365}`;
          }
          cookies.set(
            isAdmin ? "WIZY_CLIENT_ADMIN_" + domain : "WIZY_CLIENT_" + domain,
            JSONresult.id,
            {
              path: "/",
              maxAge: 60 * 60 * 24 * 365,
            },
          );
          document.cookie = `${isAdmin ? "WIZY_CLIENT_ADMIN_" + domain : "WIZY_CLIENT_" + domain}=${JSONresult.id}; path=/; max-age=${60*60*24*365}`;
          createSaleOption(JSONresult.id);
          setCreateClientBackendState(ECreateClientBackendState.send);
          setClientCreated(true);
          setIsCreatingClient(false);
        })
        .catch((error) => {
          console.log(error);
          setIsCreatingClient(false);
        });
    } else {
      setEmailError(true);
      setPhoneError(true);
      setIsCreatingClient(false);
      setCreateClientBackendState(ECreateClientBackendState.send);
    }
  };

  // Get Client info from the ip (location. country, flag)
  const getClientIpInfo = async (): Promise<string> => {

    if (platform === "WORDPRESS") {
      return JSON.stringify({
        ip: "",
        location: {
          city: "",
          country: { name: "", flag: { emoji: "" } },
        },
      });
    }

    let clientInfo = "";
    await fetch("https://api.ipregistry.co/?key=" + ipRegistryKey, {
      method: "GET",
      redirect: "follow",
    })
      .then(async (response) => {
        if (!response.ok) {
          let errorText = await response.text();
          let errorJSON = JSON.parse(errorText);
          throw new Error(errorJSON.message);
        } else {
          return response.text();
        }
      })
      .then((result) => JSON.parse(result))
      .then((JSONresult) => {
        clientInfo = JSON.stringify(JSONresult);
      })
      .catch((err) => {
        console.log(err);
      });
    return clientInfo;
  };

  // Update client init
  const updateClient = async (selectedInit: string) => {
    if (
      cookies.get(
        isAdmin ? "WIZY_CLIENT_ADMIN_" + domain : "WIZY_CLIENT_" + domain,
      ) !== undefined
    ) {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({
        websocketId: selectedInit,
      });
      await fetch(
        globalSelectedBackend +
          "/clients/" +
          cookies.get(
            isAdmin ? "WIZY_CLIENT_ADMIN_" + domain : "WIZY_CLIENT_" + domain,
          ) +
          "/websocketid",
        {
          method: "PATCH",
          headers: myHeaders,
          body: raw,
          credentials: "include",
          redirect: "follow",
        },
      )
        .then(async (response) => {
          if (!response.ok) {
            let errorText = await response.text();
            let errorJSON = JSON.parse(errorText);
            throw new Error(errorJSON.message);
          } else {
            return response.text();
          }
        })
        .then((result) => JSON.parse(result))
        .then((JSONresult) => {
          if (JSONresult.messages.length > 0 && messages.length === 0) {
            const sortedMessages = JSONresult.messages.sort(
              (a: IMessageBackend, b: IMessageBackend) =>
                Date.parse(a.createDate) - Date.parse(b.createDate),
            );

            // Update observability with ALL messages (no filter)
            if (onMessagesUpdate) {
              updateObservabilityMessages(() =>
                sortedMessages.map((msg: IMessageBackend) => ({
                  id: msg.id,
                  content: msg.content,
                  createDate: msg.createDate,
                  role: msg.role,
                  name: msg.name || undefined,
                  toolCalls: msg.toolCalls || undefined,
                  extraUIComponents: msg.extraUIComponents
                    ? JSON.parse(msg.extraUIComponents)
                    : null,
                  extraUIComponentReference: msg.extraUIComponentReference,
                  hasMedia: msg.hasMedia,
                  interpretationForLLM: msg.interpretationForLLM || undefined,
                  status: msg.status,
                  showLogs: false,
                  messageLogs: msg.messageLogs
                    ? typeof msg.messageLogs === "string"
                      ? JSON.parse(msg.messageLogs)
                      : msg.messageLogs
                    : null,
                })),
              );
            }

            // Update local state with FILTERED messages for widget display
            setMessages([]);
            sortedMessages
              .filter((message: IMessageBackend) => {
                if (
                  (message.role === EMessageRole.ai ||
                    message.role === EMessageRole.assistant ||
                    message.role === EMessageRole.user) &&
                  ((isNotBlank(message.content) &&
                    !message.content?.includes("{wizy_asset_reference}")) ||
                    message.hasMedia ||
                    (message.extraUIComponents?.length ?? 0) > 0 ||
                    (message.extraUIComponentReference?.length ?? 0) > 0)
                ) {
                  return true;
                } else {
                  return false;
                }
              })
              .forEach((message: IMessageBackend) => {
                setMessages((previous) => [
                  ...previous,
                  {
                    id: message.id,
                    content: message.content,
                    createDate: message.createDate,
                    role: message.role,
                    name: message.name,
                    functionCall: message.functionCall,
                    toolCalls: message.toolCalls,
                    toolCallId: message.toolCallId,
                    extraUIComponents: message.extraUIComponents
                      ? JSON.parse(message.extraUIComponents)
                      : null,
                    extraUIComponentReference:
                      message.extraUIComponentReference,
                    sourceType: message.sourceType,
                    sourceId: message.sourceId,
                    hasMedia: message.hasMedia,
                    isAsset: message.isAsset,
                    status: message.status,
                  },
                ]);
              });
            setIsNewMessage(!JSONresult.isClientRead);
          }
        })
        .catch((error) => {
          console.log(error);
          cookies.remove(
            isAdmin ? "WIZY_CLIENT_ADMIN_" + domain : "WIZY_CLIENT_" + domain,
          );
        });
    }
  };

  // Change link format
  const convertToHTMLLink = (text: string): JSX.Element => {
    // Matches either markdown links or bold:
    // 1) [anchor](url)
    // 2) **bold**
    const tokenRegex =
      /\[([^[\]]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)|\*\*([^*]+)\*\*/g;

    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(text)) !== null) {
      const index = match.index;

      // Push preceding text (React will escape it safely)
      if (index > lastIndex) {
        nodes.push(text.slice(lastIndex, index));
      }

      // Markdown link: match[1]=anchor, match[2]=url
      if (match[1] && match[2]) {
        const anchorText = match[1];
        const url = match[2];

        nodes.push(
          <a
            key={`link-${index}-${url}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline" }}
          >
            {anchorText}
          </a>,
        );
      }
      // Bold: match[3]=boldText
      else if (match[3]) {
        const boldText = match[3];
        nodes.push(<strong key={`bold-${index}`}>{boldText}</strong>);
      }

      lastIndex = index + match[0].length;
    }

    // Remaining tail text
    if (lastIndex < text.length) {
      nodes.push(text.slice(lastIndex));
    }

    // Your “double line break -> single line break” behavior:
    // If you actually want to preserve paragraphs, remove this step.
    const normalized = nodes; // keep as-is; CSS handles line breaks

    return <div style={{ whiteSpace: "pre-line" }}>{normalized}</div>;
  };

  // Check whether or not a variable is blank
  const isNotBlank = (value: any): boolean => {
    return value !== null && value !== undefined && value !== "";
  };

  type InvalidField = "name" | "email" | "phone";
  const getContactDataValidation = async (
    phone: { required: boolean; value: string },
    email: { required: boolean; value: string },
    name: { required: boolean; value: string },
  ): Promise<InvalidField[]> => {
    try {
      const response = await fetch(
        globalSelectedBackend + "/shopifywidgetrest/validatecontactdataform/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, phone, name }),
          credentials: "include",
          redirect: "follow",
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        const errorJSON = JSON.parse(errorText);
        throw new Error(errorJSON.message);
      }

      const data: { invalidFields: InvalidField[] } = await response.json();

      return data.invalidFields ?? [];
    } catch (error) {
      console.error("Error in contact data validation");
      console.error(error);

      return [];
    }
  };

  // JSX Return statement
  if (isLoaded) {
    return (
      <React.Fragment>
        {/* This image is here with display none just to load it */}
        <img
          src={widgetLoader}
          className="ProtectedRoute__loader"
          alt="ProtectedRoute__loader"
          id="ProtectedRoute__loader"
          style={{
            display: "none",
          }}
        />
        <div
          className="WizybotShopifyWidget__open__button__outter"
          style={{
            right:
              widget.setup.side === ESide.RIGHT ? "0px" : "calc(100% - 80px)",
            visibility:
              chatStateVisibility === EChatState.close ? "visible" : "hidden",
            opacity: chatStateVisibility === EChatState.close ? "1" : "0",
          }}
        >
          <div
            className="WizybotShopifyWidget__open__button__inner"
            style={{
              background:
                "linear-gradient(135deg, " +
                widget.setup.primaryColor +
                " 0%, " +
                widget.setup.secondaryColor +
                " 100%)",
            }}
            onClick={() => {
              if (chatState === EChatState.close) {
                handleToggleChat();
              } else {
                handleMessageSend();
              }
            }}
          >
            <div
              className="WizybotShopifyWidget__open__button__notification rise-shake"
              style={{
                opacity:
                  chatStateVisibility === EChatState.close && isNewMessage
                    ? "1"
                    : "0",
                display: widget.setup.hideNotificationSign ? "none" : "block",
              }}
            >
              !
            </div>
            {isRedirect &&
            (redirectionLink.includes("wa") ||
              redirectionLink.includes("whatsapp")) ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 50 50"
                width="50"
                height="50"
                fill="none"
                className="WizybotShopifyWidget__open__button__image"
              >
                <path
                  d="M25,2C12.318,2,2,12.318,2,25c0,3.96,1.023,7.854,2.963,11.29L2.037,46.73c-0.096,0.343-0.003,0.711,0.245,0.966 C2.473,47.893,2.733,48,3,48c0.08,0,0.161-0.01,0.24-0.029l10.896-2.699C17.463,47.058,21.21,48,25,48c12.682,0,23-10.318,23-23 S37.682,2,25,2z M36.57,33.116c-0.492,1.362-2.852,2.605-3.986,2.772c-1.018,0.149-2.306,0.213-3.72-0.231 c-0.857-0.27-1.957-0.628-3.366-1.229c-5.923-2.526-9.791-8.415-10.087-8.804C15.116,25.235,13,22.463,13,19.594 s1.525-4.28,2.067-4.864c0.542-0.584,1.181-0.73,1.575-0.73s0.787,0.005,1.132,0.021c0.363,0.018,0.85-0.137,1.329,1.001 c0.492,1.168,1.673,4.037,1.819,4.33c0.148,0.292,0.246,0.633,0.05,1.022c-0.196,0.389-0.294,0.632-0.59,0.973 s-0.62,0.76-0.886,1.022c-0.296,0.291-0.603,0.606-0.259,1.19c0.344,0.584,1.529,2.493,3.285,4.039 c2.255,1.986,4.158,2.602,4.748,2.894c0.59,0.292,0.935,0.243,1.279-0.146c0.344-0.39,1.476-1.703,1.869-2.286 s0.787-0.487,1.329-0.292c0.542,0.194,3.445,1.604,4.035,1.896c0.59,0.292,0.984,0.438,1.132,0.681 C37.062,30.587,37.062,31.755,36.57,33.116z"
                  fill={widget.setup.fontColor}
                />
              </svg>
            ) : isRedirect && redirectionLink.includes("m.me") ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 50 50"
                width="50"
                height="50"
                fill="none"
                className="WizybotShopifyWidget__open__button__image"
              >
                <path
                  d="M41,4H9C6.24,4,4,6.24,4,9v32c0,2.76,2.24,5,5,5h32c2.76,0,5-2.24,5-5V9C46,6.24,43.76,4,41,4z M37,19h-2c-2.14,0-3,0.5-3,2 v3h5l-1,5h-4v15h-5V29h-4v-5h4v-3c0-4,2-7,6-7c2.9,0,4,1,4,1V19z"
                  fill={widget.setup.fontColor}
                />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="WizybotShopifyWidget__open__button__image"
              >
                <path
                  d="M2 5C2 3.89543 2.89543 3 4 3H11C12.1046 3 13 3.89543 13 5V9C13 10.1046 12.1046 11 11 11H9L6 14V11H4C2.89543 11 2 10.1046 2 9V5Z"
                  fill={widget.setup.fontColor}
                />
                <path
                  d="M15 7V9C15 11.2091 13.2091 13 11 13H9.82843L8.06173 14.7667C8.34154 14.9156 8.66091 15 9 15H11L14 18V15H16C17.1046 15 18 14.1046 18 13V9C18 7.89543 17.1046 7 16 7H15Z"
                  fill={widget.setup.fontColor}
                />
              </svg>
            )}
          </div>
          {visibleMessageState === EVisibleMessageState.visible ? (
            <div
              className="WizybotShopifyWidget__new__visible__message__outter"
              style={{
                opacity:
                  visibleMessageOpacity === EVisibleMessageState.visible
                    ? "1"
                    : "0",
                left: widget.setup.side === "Left" ? "-100%" : "0",
                transform:
                  widget.setup.side === "Left"
                    ? "translate(130px, -100%)"
                    : "translate(-110%, -100%)",
              }}
            >
              <div className="WisybotShopifyWidget__new__visible__message__inner">
                {visibleMessage}
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
        <div
          className="WizybotShopifyWidget__outter__outter"
          style={{
            position: "absolute",
            visibility:
              chatStateVisibility === EChatState.close ? "hidden" : "visible",
            opacity: chatStateVisibility === EChatState.close ? "0" : "1",
          }}
        >
          <div
            className={
              chatState === EChatState.open
                ? widget.setup.side === "Left"
                  ? "WizybotShopifyWidget__outter__open__left"
                  : "WizybotShopifyWidget__outter__open__right"
                : "WizybotShopifyWidget__outter__close"
            }
          >
            {/* image preview - absolute to main container */}
            {imagePreviewUrl && selectedImage && (
              <div
                style={{
                  position: "absolute",
                  bottom: "110px",
                  left: "15px",
                  right: "70px",
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  padding: "8px 10px",
                  zIndex: 100,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  height: "50px",
                }}
              >
                <img
                  src={imagePreviewUrl}
                  alt="Preview"
                  style={{
                    width: "30px",
                    height: "40px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginBottom: "2px",
                      color: "#333",
                    }}
                  >
                    {selectedImage.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "#999" }}>
                    {(selectedImage.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <div
                  onClick={handleRemoveImagePreview}
                  style={{
                    cursor: "pointer",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    backgroundColor: "#f5f5f5",
                    transition: "all 0.2s",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#e8e8e8";
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f5f5f5";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 6L6 18M6 6l12 12"
                      stroke="#666"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            )}
            <div
              className="WizybotShopifyWidget__header"
              style={{
                background:
                  "linear-gradient(135deg, " +
                  widget.setup.primaryColor +
                  " 0%, " +
                  widget.setup.secondaryColor +
                  " 100%)",
              }}
            >
              <div className="WizybotShopifyWidget__header__inner">
                <div className="WizybotShopifyWidget__header__inner__inner">
                  <div className="WizybotShopifyWidget__header__picture__name">
                    <img
                      src={
                        widget.setup.image === ""
                          ? chatProfileImage
                          : widget.setup.image
                      }
                      alt="wizy_chat_profile"
                      className="WizybotShopifyWidget__header__profile__image"
                    />
                    <div className="WizybotShopifyWidget__header__name__outter">
                      <div
                        className="WizybotShopifyWidget__header__chat__with"
                        style={{ color: widget.setup.fontColor }}
                      >
                        {widget.setup.mainLanguage === "English"
                          ? "Chat with"
                          : widget.setup.mainLanguage === "Spanish"
                            ? "Habla con"
                            : widget.setup.mainLanguage === "French"
                              ? "Parler avec"
                              : widget.setup.mainLanguage === "Portuguese"
                                ? "Conversar com"
                                : widget.setup.mainLanguage === "German"
                                  ? "Chatten Sie mit"
                                  : widget.setup.mainLanguage === "Italian"
                                    ? "Chat con"
                                    : "Chat with"}
                      </div>
                      <div
                        className="WizybotShopifyWidget__header__agent__name"
                        style={{ color: widget.setup.fontColor }}
                      >
                        {" "}
                        {widget.setup.agentName}{" "}
                      </div>
                    </div>
                  </div>
                  <div className="WizybotShopifyWidget__header__close__arrow__outter">
                    {createClientState === ECreateClientState.visible ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="WizybotShopifyWidget__header__options__dots__image"
                        onClick={() => {
                          handleToogleCreateClient();
                        }}
                      >
                        <path
                          d="M2 5C2 3.89543 2.89543 3 4 3H11C12.1046 3 13 3.89543 13 5V9C13 10.1046 12.1046 11 11 11H9L6 14V11H4C2.89543 11 2 10.1046 2 9V5Z"
                          fill={widget.setup.fontColor}
                        />
                        <path
                          d="M15 7V9C15 11.2091 13.2091 13 11 13H9.82843L8.06173 14.7667C8.34154 14.9156 8.66091 15 9 15H11L14 18V15H16C17.1046 15 18 14.1046 18 13V9C18 7.89543 17.1046 7 16 7H15Z"
                          fill={widget.setup.fontColor}
                        />
                      </svg>
                    ) : cartState === ECartState.visible &&
                      !isShopifyForeing ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="WizybotShopifyWidget__header__options__dots__image"
                        onClick={() => {
                          handleToggleCartState();
                        }}
                      >
                        <path
                          d="M2 5C2 3.89543 2.89543 3 4 3H11C12.1046 3 13 3.89543 13 5V9C13 10.1046 12.1046 11 11 11H9L6 14V11H4C2.89543 11 2 10.1046 2 9V5Z"
                          fill={widget.setup.fontColor}
                        />
                        <path
                          d="M15 7V9C15 11.2091 13.2091 13 11 13H9.82843L8.06173 14.7667C8.34154 14.9156 8.66091 15 9 15H11L14 18V15H16C17.1046 15 18 14.1046 18 13V9C18 7.89543 17.1046 7 16 7H15Z"
                          fill={widget.setup.fontColor}
                        />
                      </svg>
                    ) : !isShopifyForeing ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        className="WizybotShopifyWidget__header__options__dots__image"
                        xmlns="http://www.w3.org/2000/svg"
                        onClick={() => {
                          handleToggleCartState();
                        }}
                      >
                        <path
                          d="M3 1C2.44772 1 2 1.44772 2 2C2 2.55228 2.44772 3 3 3H4.21922L4.52478 4.22224C4.52799 4.23637 4.5315 4.25039 4.5353 4.26429L5.89253 9.69321L4.99995 10.5858C3.74002 11.8457 4.63235 14 6.41416 14H15C15.5522 14 16 13.5523 16 13C16 12.4477 15.5522 12 15 12L6.41417 12L7.41416 11H14C14.3788 11 14.725 10.786 14.8944 10.4472L17.8944 4.44721C18.0494 4.13723 18.0329 3.76909 17.8507 3.47427C17.6684 3.17945 17.3466 3 17 3H6.28078L5.97014 1.75746C5.85885 1.3123 5.45887 1 5 1H3Z"
                          fill={widget.setup.fontColor}
                        />
                        <path
                          d="M16 16.5C16 17.3284 15.3284 18 14.5 18C13.6716 18 13 17.3284 13 16.5C13 15.6716 13.6716 15 14.5 15C15.3284 15 16 15.6716 16 16.5Z"
                          fill={widget.setup.fontColor}
                        />
                        <path
                          d="M6.5 18C7.32843 18 8 17.3284 8 16.5C8 15.6716 7.32843 15 6.5 15C5.67157 15 5 15.6716 5 16.5C5 17.3284 5.67157 18 6.5 18Z"
                          fill={widget.setup.fontColor}
                        />
                      </svg>
                    ) : (
                      <></>
                    )}
                    <svg
                      width="25"
                      height="25"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="WizybotShopifyWidget__header__close__arrow__image"
                      onClick={() => {
                        if (!isRelative) {
                          handleToggleChat();
                        }
                      }}
                    >
                      <path
                        d="M5.29289 7.29289C5.68342 6.90237 6.31658 6.90237 6.70711 7.29289L10 10.5858L13.2929 7.29289C13.6834 6.90237 14.3166 6.90237 14.7071 7.29289C15.0976 7.68342 15.0976 8.31658 14.7071 8.70711L10.7071 12.7071C10.3166 13.0976 9.68342 13.0976 9.29289 12.7071L5.29289 8.70711C4.90237 8.31658 4.90237 7.68342 5.29289 7.29289Z"
                        fill={widget.setup.fontColor}
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="WizybotShopifyWidget__online__phrase__outter">
                <div className="WizybotShopifyWidget__online__dot__outter">
                  <div className="WizybotShopifyWidget__online__dot__inner"></div>
                </div>
                <div
                  className="WizybotShopifyWidget__online__phrase"
                  style={{ color: widget.setup.fontColor }}
                >
                  {widget.setup.onlinePhrase}
                </div>
              </div>
              <img
                src={curvyBorderImage}
                alt="wizy_curvy_border"
                className="WizybotShopifyWidget__headder__wave"
              />
            </div>

            {/* Mandatory Form (name, email, phone) */}
            <div
              className={
                createClientState === ECreateClientState.invisible
                  ? "WizybotShopifyWidget__email__requirement__outter__close"
                  : "WizybotShopifyWidget__email__requirement__outter__open"
              }
            >
              <div className="WizybotMandatoryForm__inner">
                <div className="WizybotMandatoryForm__inputs__scroll">
                  <div className="WizybotMandatoryForm__inputs__center">
                    {nameRequired && (
                      <div>
                        <div className="WizybotShopifyWidget__email__input__title">
                          {widget.setup.mainLanguage === "Spanish"
                            ? "Nombre"
                            : widget.setup.mainLanguage === "French"
                              ? "Nom"
                              : widget.setup.mainLanguage === "Portuguese"
                                ? "Nome"
                                : widget.setup.mainLanguage === "German"
                                  ? "Name"
                                  : widget.setup.mainLanguage === "Italian"
                                    ? "Nome"
                                    : "Name"}
                        </div>
                        <div className="WizybotShopifyWidget__email__input__2__outter">
                          <input
                            type="text"
                            className="WizybotShopifyWidget__email__input__2"
                            value={name}
                            onChange={(event) => {
                              const { value } = event.currentTarget;
                              setName(value);
                            }}
                            style={{
                              border: nameError ? "1px solid #ff3e3e" : "",
                            }}
                            onKeyDown={(
                              event: React.KeyboardEvent<HTMLInputElement>,
                            ) => {
                              if (event.key === "Enter") {
                                if (
                                  createClientBackendState ===
                                    ECreateClientBackendState.send &&
                                  !isCreatingClient
                                ) {
                                  createClient();
                                }
                              }
                            }}
                          />
                        </div>
                        <div className="WizybotShopifyWidget__email__input__prompt__1">
                          Eg: John Doe
                        </div>
                      </div>
                    )}
                    {emailRequired && (
                      <div>
                        <div className="WizybotShopifyWidget__email__input__title">
                          Email
                        </div>
                        <div className="WizybotShopifyWidget__email__input__2__outter">
                          <input
                            type="text"
                            className="WizybotShopifyWidget__email__input__2"
                            value={email}
                            onChange={(event) => {
                              const { value } = event.currentTarget;
                              setEmail(value);
                            }}
                            style={{
                              border: emailError ? "1px solid #ff3e3e" : "",
                            }}
                            onKeyDown={(
                              event: React.KeyboardEvent<HTMLInputElement>,
                            ) => {
                              if (event.key === "Enter") {
                                if (
                                  createClientBackendState ===
                                    ECreateClientBackendState.send &&
                                  !isCreatingClient
                                ) {
                                  createClient();
                                }
                              }
                            }}
                          />
                        </div>
                        <div className="WizybotShopifyWidget__email__input__prompt__1">
                          Eg: jhon.doe@email.com
                        </div>
                      </div>
                    )}
                    {phoneRequired && (
                      <div>
                        <div className="WizybotShopifyWidget__email__input__title">
                          {widget.setup.mainLanguage === "English"
                            ? "Phone"
                            : widget.setup.mainLanguage === "Spanish"
                              ? "Teléfono"
                              : widget.setup.mainLanguage === "French"
                                ? "Téléphone"
                                : widget.setup.mainLanguage === "Portuguese"
                                  ? "Telefone"
                                  : widget.setup.mainLanguage === "German"
                                    ? "Telefon"
                                    : widget.setup.mainLanguage === "Italian"
                                      ? "Telefono"
                                      : "Phone"}
                        </div>

                        <PhoneInput
                          defaultCountry={
                            widget.setup.defaultCountryCode ?? "co"
                          }
                          value={phone}
                          onChange={(phone) => {
                            setPhone(phone);
                          }}
                          inputStyle={{
                            borderTop: `1px solid ${phoneError ? "#ff3e3e" : "#d1d5db"}`,
                            borderRight: `1px solid ${phoneError ? "#ff3e3e" : "#d1d5db"}`,
                            borderBottom: `1px solid ${phoneError ? "#ff3e3e" : "#d1d5db"}`,
                          }}
                          countrySelectorStyleProps={{
                            buttonStyle: {
                              borderTop: `1px solid ${phoneError ? "#ff3e3e" : "#d1d5db"}`,
                              borderLeft: `1px solid ${phoneError ? "#ff3e3e" : "#d1d5db"}`,
                              borderBottom: `1px solid ${phoneError ? "#ff3e3e" : "#d1d5db"}`,
                            },
                          }}
                          inputProps={{
                            onKeyDown: (
                              e: React.KeyboardEvent<HTMLInputElement>,
                            ) => {
                              if (
                                e.key === "Enter" &&
                                createClientBackendState ===
                                  ECreateClientBackendState.send &&
                                !isCreatingClient
                              ) {
                                createClient();
                              }
                            },
                          }}
                        />
                        <div className="WizybotShopifyWidget__email__input__prompt__1">
                          Eg: +573123456789
                        </div>
                      </div>
                    )}
                    <div className="WizybotShopifyWidget__email__checkbox__outter">
                      <input
                        type="checkbox"
                        name="isNotCommercialized"
                        checked={subscriptionState}
                        onChange={() => {
                          setSubscriptionState(!subscriptionState);
                        }}
                      />
                      <div className="WizybotShopifyWidget__email__input__checkbox__text">
                        {widget.setup.mainLanguage === "English"
                          ? "Sign up for our newsletter"
                          : widget.setup.mainLanguage === "Spanish"
                            ? "Suscríbete a nuestro boletín"
                            : widget.setup.mainLanguage === "French"
                              ? "Inscrivez-vous à notre newsletter"
                              : widget.setup.mainLanguage === "Portuguese"
                                ? "Assine a nossa newsletter"
                                : widget.setup.mainLanguage === "German"
                                  ? "Melden Sie sich für unseren Newsletter an"
                                  : widget.setup.mainLanguage === "Italian"
                                    ? "Iscriviti alla nostra newsletter"
                                    : "Sign up for our newsletter"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="WizybotMandatoryForm__footer">
                  <div className="WizybotShopifyWidget__email__button__outter">
                    <button
                      className="WizybotShopifyWidget__email__button"
                      style={{
                        width: "100%",
                        background:
                          "linear-gradient(135deg, " +
                          widget.setup.primaryColor +
                          " 0%, " +
                          widget.setup.secondaryColor +
                          " 100%)",
                        color: widget.setup.fontColor,
                      }}
                      onClick={async () => {
                        if (
                          createClientBackendState ===
                            ECreateClientBackendState.send &&
                          !isCreatingClient
                        ) {
                          createClient();
                        }
                      }}
                    >
                      {createClientBackendState ===
                      ECreateClientBackendState.send
                        ? widget.setup.mainLanguage === "English"
                          ? "Send"
                          : widget.setup.mainLanguage === "Spanish"
                            ? "Enviar"
                            : widget.setup.mainLanguage === "French"
                              ? "Envoyer"
                              : widget.setup.mainLanguage === "Portuguese"
                                ? "Enviar"
                                : widget.setup.mainLanguage === "German"
                                  ? "Schicken"
                                  : widget.setup.mainLanguage === "Italian"
                                    ? "Inviare"
                                    : "Send"
                        : widget.setup.mainLanguage === "English"
                          ? "Loading..."
                          : widget.setup.mainLanguage === "Spanish"
                            ? "Cargando..."
                            : widget.setup.mainLanguage === "French"
                              ? "Chargement..."
                              : widget.setup.mainLanguage === "Portuguese"
                                ? "Carregando..."
                                : widget.setup.mainLanguage === "German"
                                  ? "Wird geladen..."
                                  : widget.setup.mainLanguage === "Italian"
                                    ? "Caricamento..."
                                    : "Loading..."}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={
                cartState === ECartState.invisible
                  ? "WizybotShopifyWidget__cart__outter__close"
                  : "WizybotShopifyWidget__cart__outter__open"
              }
            >
              {cart !== null && isCartLoaded ? (
                <ShopifyWidgetCart
                  cart={cart}
                  updateCart={updateCart}
                  language={widget.setup.mainLanguage}
                  agentName={widget.setup.agentName}
                  closeCart={handleToggleCartState}
                  languageUrl={languageUrl}
                />
              ) : isCartLoaded ? (
                <div>
                  <div>
                    <div className="WizybotShopifyWidget__cart__outter__products">
                      <div className="WizybotShopifyWidget__cart__outter__no__products">
                        {widget.setup.mainLanguage === "English"
                          ? "Hello there! It seems you have not added anything to your cart, why don't you ask us for some recommendations?"
                          : widget.setup.mainLanguage === "Spanish"
                            ? "¡Hola! Parece que no has añadido nada a tu carrito, ¿por qué no nos pides algunas recomendaciones?"
                            : widget.setup.mainLanguage === "French"
                              ? "Bonjour! Il semble que vous n'avez rien ajouté à votre panier, pourquoi ne pas nous demander des recommandations?"
                              : widget.setup.mainLanguage === "Portuguese"
                                ? "Olá! Parece que você não adicionou nada ao seu carrinho, por que não nos pede algumas recomendações?"
                                : widget.setup.mainLanguage === "German"
                                  ? "Hallo! Es scheint, dass Sie nichts in Ihren Warenkorb gelegt haben. Warum fragen Sie uns nicht nach einigen Empfehlungen?"
                                  : widget.setup.mainLanguage === "Italian"
                                    ? "Ciao! Sembra che tu non abbia aggiunto nulla al carrello, perché non ci chiedi qualche consiglio?"
                                    : "Hello there! It seems you have not added anything to your cart, why don't you ask us for some recommendations?"}
                        <div className="WizybotShopifyWidget__cart__inner__estimated__button__outter">
                          <button
                            className="WizybotShopifyWidget__cart__inner__estimated__no__products__button"
                            style={{ width: "100%" }}
                            onClick={handleToggleCartState}
                          >
                            {widget.setup.mainLanguage === "English"
                              ? "Chat with"
                              : widget.setup.mainLanguage === "Spanish"
                                ? "Habla con"
                                : widget.setup.mainLanguage === "French"
                                  ? "Parler avec"
                                  : widget.setup.mainLanguage === "Portuguese"
                                    ? "Conversar com"
                                    : widget.setup.mainLanguage === "German"
                                      ? "Chatten Sie mit"
                                      : widget.setup.mainLanguage === "Italian"
                                        ? "Chat con"
                                        : "Chat with"}{" "}
                            {widget.setup.agentName}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="WizybotShopifyWidget__cart__outter__checkout">
                      <div className="WizybotShopifyWidget__cart__outter__estimated">
                        <div className="WizybotShopifyWidget__cart__inner__estimated">
                          {widget.setup.mainLanguage === "English"
                            ? "Estimated total"
                            : widget.setup.mainLanguage === "Spanish"
                              ? "Total estimado"
                              : widget.setup.mainLanguage === "French"
                                ? "Total estimé"
                                : widget.setup.mainLanguage === "Portuguese"
                                  ? "Total estimado"
                                  : widget.setup.mainLanguage === "German"
                                    ? "Geschätzte Gesamtsumme"
                                    : widget.setup.mainLanguage === "Italian"
                                      ? "Totale stimato"
                                      : "Estimated total"}
                        </div>{" "}
                        <div className="WizybotShopifyWidget__cart__inner__estimated__price">
                          $0.00
                        </div>
                      </div>
                      <div className="WizybotShopifyWidget__cart__inner__estimated__button__outter">
                        <a
                          href="/cart"
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            textDecoration: "none",
                          }}
                        >
                          <button
                            className="WizybotShopifyWidget__cart__inner__estimated__button"
                            style={{ width: "100%" }}
                          >
                            {widget.setup.mainLanguage === "English"
                              ? "Pay"
                              : widget.setup.mainLanguage === "Spanish"
                                ? "Pagar"
                                : widget.setup.mainLanguage === "French"
                                  ? "Payer"
                                  : widget.setup.mainLanguage === "Portuguese"
                                    ? "Pagar"
                                    : widget.setup.mainLanguage === "German"
                                      ? "Bezahlen"
                                      : widget.setup.mainLanguage === "Italian"
                                        ? "Pagare"
                                        : "Pay"}
                          </button>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div>
                    <div className="WizybotShopifyWidget__cart__outter__products">
                      <div
                        className="WizybotShopifyWidget__cart__outter__no__products"
                        style={{ width: "fit-content" }}
                      >
                        <div className="loader"></div>
                      </div>
                    </div>
                    <div className="WizybotShopifyWidget__cart__outter__checkout">
                      <div className="WizybotShopifyWidget__cart__outter__estimated">
                        <div className="WizybotShopifyWidget__cart__inner__estimated">
                          {widget.setup.mainLanguage === "English"
                            ? "Estimated total"
                            : widget.setup.mainLanguage === "Spanish"
                              ? "Total estimado"
                              : widget.setup.mainLanguage === "French"
                                ? "Total estimé"
                                : widget.setup.mainLanguage === "Portuguese"
                                  ? "Total estimado"
                                  : widget.setup.mainLanguage === "German"
                                    ? "Geschätzte Gesamtsumme"
                                    : widget.setup.mainLanguage === "Italian"
                                      ? "Totale stimato"
                                      : "Estimated total"}
                        </div>{" "}
                        <div className="WizybotShopifyWidget__cart__inner__estimated__price">
                          <div
                            className="loader"
                            style={{
                              position: "absolute",
                              transform: "translate(-100%, -50%)",
                              left: "100%",
                              top: "50%",
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="WizybotShopifyWidget__cart__inner__estimated__button__outter">
                        <a
                          href="/cart"
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            textDecoration: "none",
                          }}
                        >
                          <button
                            className="WizybotShopifyWidget__cart__inner__estimated__button"
                            style={{ width: "100%" }}
                          >
                            {widget.setup.mainLanguage === "English"
                              ? "Pay"
                              : widget.setup.mainLanguage === "Spanish"
                                ? "Pagar"
                                : widget.setup.mainLanguage === "French"
                                  ? "Payer"
                                  : widget.setup.mainLanguage === "Portuguese"
                                    ? "Pagar"
                                    : widget.setup.mainLanguage === "German"
                                      ? "Bezahlen"
                                      : widget.setup.mainLanguage === "Italian"
                                        ? "Pagare"
                                        : "Pay"}
                          </button>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="WizybotShopifyWidget__chat__outter">
              <div className="WizybotShopifyWidget__chat__inner">
                {messages.map((message, index) => {
                  return (
                    <div style={{ width: "100%" }} key={index}>
                      <div className="WizybotShopifyWidget__chat__message__outter">
                        {message.content &&
                          !message.content?.includes(
                            "{wizy_asset_reference}",
                          ) && (
                            <div
                              className="WizybotShopifyWidget__chat__message__inner"
                              style={{
                                marginLeft:
                                  message.role === EMessageRole.user
                                    ? "auto"
                                    : "",
                                background:
                                  message.role === EMessageRole.user
                                    ? "linear-gradient(135deg, " +
                                      widget.setup.primaryColor +
                                      " 0%, " +
                                      widget.setup.secondaryColor +
                                      " 100%)"
                                    : "",
                                color:
                                  message.role === EMessageRole.user
                                    ? widget.setup.fontColor
                                    : "black",
                              }}
                            >
                              {convertToHTMLLink(message.content)}
                            </div>
                          )}
                      </div>
                      {message.extraUIComponents &&
                      message.extraUIComponents.length > 0 ? (
                        message.extraUIComponents.map((extraUIComponent, i) => {
                          switch (extraUIComponent.type) {
                            case EExtraUIComponentTypes.ADD_TO_CART:
                              return (
                                <Add2Cart
                                  key={i}
                                  content={extraUIComponent.content}
                                  extraUIComponentIndex={i}
                                  globalSelectedBackend={globalSelectedBackend}
                                  domain={domain}
                                  shopifyRootPath={shopifyRootPath}
                                  message={message}
                                  language={widget.setup.mainLanguage}
                                  openCart={handleToggleCartState}
                                  isShopifyForeing={isShopifyForeing}
                                />
                              );
                            case EExtraUIComponentTypes.ADD_TO_CART_WITH_SUBSCRIPTIONS:
                              return (
                                <AddToCartWithSubscriptions
                                  key={i}
                                  content={extraUIComponent.content}
                                  extraUIComponentIndex={i}
                                  globalSelectedBackend={globalSelectedBackend}
                                  domain={domain}
                                  shopifyRootPath={shopifyRootPath}
                                  message={message}
                                  language={widget.setup.mainLanguage}
                                  noImageImage={noImageImage}
                                  openCart={handleToggleCartState}
                                />
                              );
                            case EExtraUIComponentTypes.RECOMMENDATION_CAROUSEL:
                              return (
                                <RecommendationCarousel
                                  key={i}
                                  content={extraUIComponent.content}
                                  language={widget.setup.mainLanguage}
                                  platform={platform}
                                />
                              );
                            case EExtraUIComponentTypes.PRODUCT_CARD:
                              return (
                                <ProductCard
                                  noImageImage={noImageImage}
                                  key={i}
                                  content={extraUIComponent.content}
                                  language={widget.setup.mainLanguage}
                                />
                              );
                            default:
                              return <React.Fragment key={i}></React.Fragment>;
                          }
                        })
                      ) : message.extraUIComponentReference ? (
                        message.extraUIComponentReference.map(
                          (extraUIComponent, i) => {
                            if (
                              isExtraUIComponentType<INewAddToCartExtraUIComponent>(
                                extraUIComponent,
                                ENewExtraUIComponentTypes.ADD_TO_CART,
                              )
                            ) {
                              return (
                                <Add2Cart
                                  key={i}
                                  content={{
                                    title: extraUIComponent.title,
                                    productId: extraUIComponent.productId,
                                    productUrl: extraUIComponent.productUrl,
                                    imageUrl: extraUIComponent.imageUrl,
                                    imageAltText: extraUIComponent.imageAltText,
                                    options: extraUIComponent.options,
                                    infoArray: extraUIComponent.infoArray,
                                    stateAction: extraUIComponent.stateAction,
                                    stateSelection:
                                      extraUIComponent.stateSelection,
                                  }}
                                  extraUIComponentIndex={i}
                                  globalSelectedBackend={globalSelectedBackend}
                                  domain={domain}
                                  shopifyRootPath={shopifyRootPath}
                                  message={message}
                                  language={widget.setup.mainLanguage}
                                  openCart={handleToggleCartState}
                                  isShopifyForeing={isShopifyForeing}
                                />
                              );
                            } else if (
                              isExtraUIComponentType<INewAddToCartWithSubscriptionsExtraUIComponent>(
                                extraUIComponent,
                                ENewExtraUIComponentTypes.ADD_TO_CART_WITH_SUBSCRIPTIONS,
                              )
                            ) {
                              return (
                                <AddToCartWithSubscriptions
                                  key={i}
                                  content={{
                                    title: extraUIComponent.title,
                                    productId: extraUIComponent.productId,
                                    productUrl: extraUIComponent.productUrl,
                                    imageUrl: extraUIComponent.imageUrl,
                                    imageAltText: extraUIComponent.imageAltText,
                                    options: extraUIComponent.options,
                                    infoArray: extraUIComponent.infoArray,
                                    stateAction: extraUIComponent.stateAction,
                                    stateSelection:
                                      extraUIComponent.stateSelection,
                                  }}
                                  extraUIComponentIndex={i}
                                  globalSelectedBackend={globalSelectedBackend}
                                  domain={domain}
                                  shopifyRootPath={shopifyRootPath}
                                  message={message}
                                  language={widget.setup.mainLanguage}
                                  noImageImage={noImageImage}
                                  openCart={handleToggleCartState}
                                />
                              );
                            } else if (
                              isExtraUIComponentType<INewRecommendationCarouselExtraUIComponent>(
                                extraUIComponent,
                                ENewExtraUIComponentTypes.RECOMMENDATION_CAROUSEL,
                              )
                            ) {
                              return (
                                <RecommendationCarousel
                                  key={i}
                                  content={{
                                    cards: extraUIComponent.cards.map(
                                      (card) => {
                                        if (card.cardType === "product") {
                                          return {
                                            type: "product",
                                            title: card.title,
                                            price: card.price,
                                            imageUrl: card.imageUrls[0],
                                            redirectUrl: card.redirectUrl,
                                          } as IProductCard;
                                        } else {
                                          return {
                                            type: "collection",
                                            title: card.title,
                                            imageUrls: card.imageUrls,
                                            redirectUrl: card.redirectUrl,
                                          } as ICollectionCard;
                                        }
                                      },
                                    ),
                                  }}
                                  language={widget.setup.mainLanguage}
                                  platform={platform}
                                />
                              );
                            } else if (
                              isExtraUIComponentType<INewProductCardExtraUIComponent>(
                                extraUIComponent,
                                ENewExtraUIComponentTypes.PRODUCT_CARD,
                              )
                            ) {
                              return (
                                <ProductCard
                                  noImageImage={noImageImage}
                                  content={{
                                    title: extraUIComponent.title,
                                    price: extraUIComponent.price,
                                    imageUrl: extraUIComponent.imageUrl,
                                    redirectUrl: extraUIComponent.redirectUrl,
                                    variantTitle: extraUIComponent.variantTitle,
                                    productId: extraUIComponent.productId,
                                    productUrl: extraUIComponent.productUrl,
                                    stock: extraUIComponent.stock,
                                  }}
                                  language={widget.setup.mainLanguage}
                                />
                              );
                            } else if (
                              isExtraUIComponentType<INewClientProductCartExtraUIComponent>(
                                extraUIComponent,
                                ENewExtraUIComponentTypes.PRODUCT_CART,
                              )
                            ) {
                              return (
                                <ProductCart
                                  noImageImage={noImageImage}
                                  content={extraUIComponent}
                                  language={widget.setup.mainLanguage}
                                />
                              );
                            } else if (
                              isExtraUIComponentType<INewAddMediaExtraUIComponent>(
                                extraUIComponent,
                                ENewExtraUIComponentTypes.ADD_MEDIA,
                              )
                            ) {
                              return (
                                <AddMedia
                                  key={i}
                                  isAdmin={isAdmin}
                                  content={extraUIComponent}
                                  extraUIComponentIndex={i}
                                  globalSelectedBackend={globalSelectedBackend}
                                  domain={domain}
                                  message={message}
                                  language={widget.setup.mainLanguage}
                                  getClientIpInfo={getClientIpInfo}
                                />
                              );
                            } else {
                              return <React.Fragment key={i}></React.Fragment>;
                            }
                          },
                        )
                      ) : (
                        <></>
                      )}
                      {message.hasMedia ? (
                        <div
                          className="WizybotShopifyWidget__chat__message__outter"
                          style={{
                            justifyContent:
                              message.role === EMessageRole.user
                                ? "flex-end"
                                : "flex-start",
                          }}
                        >
                          {message.localMediaUrl ? (
                            // Local preview for user's just-sent image (optimistic)
                            <div className="ChatMedia__outter">
                              <div
                                className="ChatMedia__inner"
                                style={{
                                  width: "fit-content",
                                  height: "fit-content",
                                }}
                              >
                                <a
                                  href={message.localMediaUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ zIndex: 1 }}
                                >
                                  <img
                                    className="ChatMedia__image"
                                    src={message.localMediaUrl}
                                    alt="Uploaded image"
                                    style={{ zIndex: 1, display: "block" }}
                                  />
                                </a>
                              </div>
                            </div>
                          ) : message.id ? (
                            // Server media (historical or received messages)
                            <WidgetMedia
                              messageId={message.id}
                              isAsset={message.isAsset}
                              globalSelectedBackend={globalSelectedBackend}
                              mainLanguage={widget.setup.mainLanguage}
                              widgetLoader={widgetLoader}
                            />
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
                {isTyping ? (
                  <div
                    className="WizybotShopifyWidget__chat__message__outter"
                    key="LoadingDots"
                  >
                    <div
                      className="WizybotShopifyWidget__chat__message__inner"
                      style={{
                        color: "black",
                      }}
                    >
                      <div className="loader"></div>
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="WizybotShopifyWidget__input__outter">
              <div
                className="WizybotShopifyWidget__send__button__outter"
                style={{
                  background:
                    "linear-gradient(135deg, " +
                    widget.setup.primaryColor +
                    " 0%, " +
                    widget.setup.secondaryColor +
                    " 100%)",
                  opacity: isSendButtonActive ? "1" : "0",
                  visibility: isSendButtonActive ? "visible" : "hidden",
                }}
                onClick={() => {
                  if (chatState === EChatState.close) {
                    handleToggleChat();
                  } else {
                    handleMessageSend();
                  }
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="WizybotShopifyWidget__open__button__image"
                  style={{
                    transform: "scale(1) translate(-50%, -50%)",
                  }}
                >
                  <path
                    d="M17.4472 9.10556C17.786 9.27495 18 9.62122 18 9.99999C18 10.3788 17.786 10.725 17.4472 10.8944L3.44721 17.8944C3.09251 18.0718 2.66653 18.0228 2.36136 17.7695C2.0562 17.5162 1.92953 17.1066 2.03848 16.7253L3.46704 11.7253C3.5897 11.296 3.98209 11 4.42857 11L9 11C9.55229 11 10 10.5523 10 10C10 9.44771 9.55229 9 9 9H4.42857C3.98209 9 3.58971 8.70402 3.46705 8.27472L2.03848 3.27471C1.92953 2.8934 2.0562 2.48374 2.36136 2.23048C2.66653 1.97722 3.09251 1.92821 3.44721 2.10556L17.4472 9.10556Z"
                    fill={widget.setup.fontColor}
                  />
                </svg>
              </div>
              <div className="WizybotShopifyWidget__input__inner">
                <div className="WizybotShopifyWidget__chat__input__outter">
                  <input
                    name="message"
                    value={newMessage}
                    type="text"
                    className="WizybotShopifyWidget__chat__input"
                    placeholder={
                      widget.setup.mainLanguage === "English"
                        ? "Enter your message..."
                        : widget.setup.mainLanguage === "Spanish"
                          ? "Ingrese su mensaje.."
                          : widget.setup.mainLanguage === "French"
                            ? "Entrez votre message..."
                            : widget.setup.mainLanguage === "Portuguese"
                              ? "Digite sua mensagem..."
                              : widget.setup.mainLanguage === "German"
                                ? "Geben Sie eine Nachricht ein..."
                                : widget.setup.mainLanguage === "Italian"
                                  ? "Inserisci il tuo messaggio..."
                                  : "Enter your message..."
                    }
                    onChange={(event: React.FormEvent<HTMLInputElement>) => {
                      setNewMessage(event.currentTarget.value);
                    }}
                    onKeyDown={(
                      event: React.KeyboardEvent<HTMLInputElement>,
                    ) => {
                      if (event.key === "Enter") {
                        handleMessageSend();
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="WizybotShopifyWidget__emojis__propaganda__outter">
              <div className="WizybotShopifyWidget__emojis__propaganda__inner">
                {/* actions menu container */}
                <div
                  ref={actionsMenuRef}
                  style={{ position: "relative", display: "flex" }}
                >
                  {/* actions menu dropdown */}
                  {actionsMenuState === EActionsMenuState.visible && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "40px",
                        left: "0",
                        backgroundColor: "#ffffff",
                        borderRadius: "8px",
                        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.15)",
                        padding: "8px",
                        minWidth: "150px",
                        zIndex: 1000,
                        animation: "fadeInUp 0.2s ease-out",
                      }}
                    >
                      {/* render menu items dynamically */}
                      {actionsMenuItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={item.onClick}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "10px 12px",
                            cursor: "pointer",
                            borderRadius: "6px",
                            transition: "background-color 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "rgba(130, 177, 230, 0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                        >
                          <div style={{ marginRight: "10px" }}>{item.icon}</div>
                          <span
                            style={{
                              fontSize: "14px",
                              color: "#333",
                              fontWeight: 500,
                            }}
                          >
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                    accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                  />

                  {/* plus button */}
                  <div
                    className="WizybotShopifyWidget__emojis__outter"
                    onClick={handleToggleActionsMenu}
                    style={{ marginRight: "5px" }}
                  >
                    <svg
                      id="ic_actionsMenu"
                      fill="#000000"
                      height="20"
                      viewBox="0 0 24 24"
                      width="20"
                      xmlns="http://www.w3.org/2000/svg"
                      className="WizybotShopifyWidget__emojis__image"
                    >
                      <path d="M0 0h24v24H0z" fill="none" />
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                  </div>
                </div>

                <div
                  className="WizybotShopifyWidget__emojis__outter"
                  onClick={addRandomNiceEmoji}
                >
                  <svg
                    id="ic_emojiSwitch"
                    fill="#000000"
                    height="20"
                    viewBox="0 0 24 24"
                    width="20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="WizybotShopifyWidget__emojis__image"
                  >
                    <path d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"></path>
                  </svg>
                </div>
                <div
                  className="WizybotShopifyWidget__propaganda__outter"
                  style={{
                    visibility: widget.setup.hideWizybotBanner
                      ? "hidden"
                      : "visible",
                  }}
                >
                  <div className="WizybotShopifyWidget__propaganda__text">
                    POWERED BY
                  </div>
                  <a
                    href="https://apps.shopify.com/wizybot"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      textDecoration: "none",
                    }}
                  >
                    <div className="WizybotShopifyWidget__propaganda__logo__outter">
                      {" "}
                      <img
                        src={wizyLogoImage}
                        alt="wizy_logo_blue"
                        className="WizybotShopifyWidget__propaganda__logo__image"
                      />{" "}
                      <div className="WizybotShopifyWidget__propaganda__logo__text">
                        Wizybot
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  } else {
    return <></>;
  }
};

// Default exported function
export default ShopifyWidget;
