// Client

import { IPageCursorMeta } from "../components/molecules/Pagination";
import { EMessageSourceTypes, IMessageBackend } from "./MessageType";
import { ISale } from "./SaleType";
import { IShop } from "./ShopType";
import { ITicket } from "./TicketType";
import { IUser } from "./UserType";

export enum CLIENT_CORRECTION_TYPE {
  OPS = "ops",
}

export type ISourceBackend = {
  id: string;
  sourceType: EMessageSourceTypes;
  sourceId: string;
};

export type IClientBase = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  computer: string;
  ipAddress: string;
  createDate: string;
  lastMessageDate: string;
  lastMessage: string;
  subscriptionState: boolean;
  isShopRead: boolean;
  isClientRead: boolean;
  websocketId: string;
  messages?: IMessageBackend[];
  shop?: IShop;
  qualityScore?: number | null;
  needsCorrection?: boolean;
  qualityNote?: string | null;
  sales?: ISale[];
  whatsAppNumber: string | null;
  whatsAppProfileName: string | null;
  instagramUsername: string | null;
  instagramId: string | null;
  messengerId: string | null;
  messengerName: string | null;
  conversationInitiated: boolean;
  emailId: string | null;
  emailName: string | null;
  shouldReplyToLastEmail: boolean;
  whatsAppSessionId: string | null;
  isTest?: boolean;
  whatsAppMarketingOptOut?: boolean;
  voluntaryMarketingOptOut?: boolean;
  sources?: ISourceBackend[];
};

export interface IClientFromList extends IClientBase {
  selected: boolean;
}

export interface IClientBackend extends IClientBase {
  superClient: { id: string };
}

export interface IClientFromSuperClient extends IClientBase {
  tickets: ITicket[];
  messagesPageCursorMeta?: IPageCursorMeta;
}

export const emptyIClientBackend: IClientBackend = {
  id: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  computer: "",
  ipAddress: "",
  createDate: "",
  lastMessageDate: "",
  lastMessage: "",
  subscriptionState: false,
  isClientRead: false,
  isShopRead: false,
  websocketId: "",
  whatsAppNumber: null,
  whatsAppProfileName: null,
  instagramUsername: null,
  instagramId: null,
  messengerId: null,
  messengerName: null,
  superClient: { id: "" },
  conversationInitiated: true,
  emailId: null,
  emailName: null,
  shouldReplyToLastEmail: false,
  whatsAppSessionId: null,
};
export enum ESuperClientState {
  OPEN = "open",
  CLOSED = "closed",
}

export type ISuperClientTag = { id: string; title: string; color: string };

export type ISuperClientNotes = { id: string; notes: string };

export type ITicketNotes = { id: string; notes: string };

export const emptyISuperClientTag: ISuperClientTag = {
  id: "",
  title: "",
  color: "#CBCDD1",
};

export type IShopifyClient = {
  id: string;
  shopifyCustomerId: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  locale?: string;
};

export type IFunnelStage = {
  id: string;
  name: string;
  color: string;
  order?: number;
  funnel: {
    id: string;
    name: string;
    createDate: string;
    updateDate: string;
  };
};

export type IFunnelStageSuperClientRecord = {
  id: string;
  isCurrent: boolean;
  createDate: string;
  updateDate: string;
  funnelStage: IFunnelStage;
};

export type ISuperClient = {
  id: string;
  clients: IClientFromSuperClient[];
  superClientTags: ISuperClientTag[];
  state: ESuperClientState;
  temporaryAssignedTo: IUser | null;
  defaultAssignedTo: IUser | null;
  transferRequestTo: IUser | null;
  shopifyClient?: IShopifyClient;
  isPinned: boolean;
  isNew: boolean;
  isBlocked: boolean;
  isLastMessageFromClient: boolean;
  lastMessageDate: string;
  hasTickets?: boolean;
  hasSales?: boolean;
  matchedMessage?: {
    id: string;
    content: string;
    createDate: string;
    score: number;
  };
  funnelStageSuperClientRecords?: IFunnelStageSuperClientRecord[];
};

export const emptyISuperClient: ISuperClient = {
  id: "",
  clients: [],
  superClientTags: [],
  state: ESuperClientState.OPEN,
  temporaryAssignedTo: null,
  defaultAssignedTo: null,
  transferRequestTo: null,
  isPinned: false,
  isNew: false,
  isBlocked: false,
  isLastMessageFromClient: false,
  lastMessageDate: "",
};

export interface ISuperClientWithShop extends ISuperClient {
  shop: IShop;
}

export interface ISuperClientFromList extends ISuperClient {
  selected: boolean;
  hasTickets?: boolean;
  hasSales?: boolean;
}

export type ISuperClientInfo = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  computer: string;
  ipAddress: string;
  subscriptionState: boolean;
  sales?: ISale[];
  messages?: IMessageBackend[];
  tickets?: ITicket[];
  whatsAppNumber: string | null;
  whatsAppProfileName: string | null;
  instagramUsername: string | null;
  instagramId: string | null;
  messengerName: string | null;
  lastMessageDate: string;
  superClientTags: ISuperClientTag[];
  superClientNotes: ISuperClientTag[];
  conversationInitiated: boolean;
  whatsAppClientId: string | null;
  emailId: string | null;
  state: ESuperClientState;
  temporaryAssignedTo: IUser | null;
  defaultAssignedTo: IUser | null;
  transferRequestTo: IUser | null;
  shopifyClient?: IShopifyClient;
  clientCount: number;
  isPinned: boolean;
  isNew: boolean;
  isBlocked: boolean;
  clients?: IClientFromSuperClient[];
  funnelStageSuperClientRecords?: IFunnelStageSuperClientRecord[];
};

export const emptyISuperClientInfo: ISuperClientInfo = {
  id: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  computer: "",
  ipAddress: "",
  subscriptionState: false,
  whatsAppNumber: null,
  whatsAppProfileName: null,
  instagramUsername: null,
  instagramId: null,
  messengerName: null,
  lastMessageDate: "",
  superClientTags: [],
  superClientNotes: [],
  conversationInitiated: false,
  whatsAppClientId: null,
  emailId: null,
  state: ESuperClientState.OPEN,
  temporaryAssignedTo: null,
  defaultAssignedTo: null,
  transferRequestTo: null,
  clientCount: 0,
  isPinned: false,
  isNew: false,
  isBlocked: false,
};

export enum ESearchMode {
  CLIENTS = "clients",
  CONVERSATIONS = "conversations",
}

export enum ETagMatchMode {
  ANY = "any",
  ALL = "all",
}

export type ISuperClientFilter = {
  text: string;
  initialDate: string;
  finalDate: string;
  hasSales: boolean;
  hasTickets: boolean;
  hasNewMessages: boolean;
  onlyMyDepartments: boolean;
  isLastMessageFromClient?: boolean;
  searchMode: ESearchMode;
  tagMatchMode?: ETagMatchMode;
};

export const emptyISuperClientFilter: ISuperClientFilter = {
  text: "",
  initialDate: "",
  finalDate: "",
  hasSales: false,
  hasTickets: false,
  hasNewMessages: false,
  onlyMyDepartments: false,
  searchMode: ESearchMode.CLIENTS,
  tagMatchMode: ETagMatchMode.ANY,
};
