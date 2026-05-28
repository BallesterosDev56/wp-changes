// SetUp

import { ITagOption } from "../components/KnowledgeMedia";
import {
  EEmailRetrievalMethod,
  EDataRetrievalType,
} from "../components/WordpressWidget";

export type ISetup = {
  id?: string;
  primaryColor: string;
  secondaryColor: string;
  fontColor: string;
  agentName: string;
  onlinePhrase: string;
  isCustomMessages: boolean;
  initialMessage: string;
  defaultMessage: string;
  productMessage: string;
  collectionMessage: string;
  searchMessage: string;
  pagePolicyMessage: string;
  companyContactInfo: string;
  mainLanguage: string;
  side: string;
  paddingBottom: number;
  paddingSide: number;
  image: string;
  isVisible: boolean;
  emailRetrievalMethod: EEmailRetrievalMethod;
  dataRetrievalType: EDataRetrievalType;
  dataRetrievalCustomPrompt: string;
  emailForNotifications: string;
  isSendNotifications: boolean;
  chatbotPersonality: string;
  ticketNotificationType: string;
  hasActivationSchedule: boolean;
  activationScheduleTimezone: string;
  deactivationAction: EDeactivationAction;
  isAI: boolean;
  isWidgetAiActive: boolean;
  isRedirect: boolean;
  redirectionLink: string;
  requestHelpAction: ERequestHelpAction;
  customRequestHelpPrompt: string;
  maxMessagesPerDay: number;
  hasLimitBudget: boolean;
  limitBudget: number;
  limitBudgetAction: ELimitBudgetAction;
  limitBudgetDefaultMessage: string;
  limitBudgetRedirectionLink: string;
  conversationRouting: boolean;
  hasInitialPolicy: boolean;
  initialPolicyMessage: string;
  ticketDataRetrievalType: string;
  productTagsToIncludeInKnowledge: string | null;
  productTagsToExcludeFromKnowledge: string | null;
  additionalResponseDelay: number;
  metaCodeControl: string | null;
  metaAvailable: boolean;
  domainAvailable: boolean;
  emailAvailable: boolean;
  whatsAppSessionAvailable: boolean;
  hubspotAvailable: boolean;
  onlyRecommendAvailableProducts: boolean;
  campaignsEnabled: boolean;
  departmentsEnabled: boolean;
  syncShopifyClients: boolean;
  defaultCountryCode: string | null;
  metricsEnabled: boolean;
  marketsEnabled: boolean;
  integrationsEnabled: boolean;
  conversationTagsEnabled: boolean;
  assetsManager: { assets: ITagOption[] };
  productList: { products: ITagOption[] };
  conversationClosingAgentEnabled: boolean;
  conversationClosingAgentMessage: string | null;
  conversationClosingAgentName: string | null;
  conversationClosingAgentCondition?: EConversationClosingAgentCondition | null;
  conversationClosingAgentChannels?: string | null;
  myBoardCounterConfig: MyBoardCounterConfig;
  needsHelpCounterConfig: NeedsHelpCounterConfig;
  aiHandledCounterConfig: AiHandledCounterConfig;
  whatsAppCoexistenceEnabled: boolean;
  metaAuthVersion: number;
  metaAdAccountsEnabled: boolean;
  billingProvider: EBillingProvider;
};

export enum EConversationClosingAgentCondition {
  ALWAYS = "always",
  RECENTLY_CLOSED_TICKET = "recently_closed_ticket",
}

export enum EBillingProvider {
  SHOPIFY = "SHOPIFY",
  STRIPE = "STRIPE",
}

export enum EDeactivationAction {
  VISIBILITY = "visibility",
  AI = "ai",
  REDIRECT = "redirect",
}

export enum ERequestHelpAction {
  CREATE_TICKET = "create ticket",
  CUSTOM = "custom",
  CUSTOM_PER_AGENT = "custom per agent",
}

export enum ELimitBudgetAction {
  WIDGET_OFF = "widget off",
  AI_OFF = "ai off",
  DEFAULT_MESSAGE = "default message",
  REDIRECT = "redirect",
}

export interface ShopProgressFlagsDto {
  hasCustomizedChat: boolean;
  hasCustomizedPersonality: boolean;
  hasImprovedResponses: boolean;
  isWidgetLive: boolean;
  hasMetaChannels: boolean;
}

export enum CHAT_COUNTER_TYPES {
  MY_BOARD_ALL = "my_board_all",
  MY_BOARD_LAST_MESSAGE_FROM_CLIENT = "my_board_last_message_from_client",
  NEEDS_HELP = "needs_help",
  AI_HANDLED = "ai_handled",
}

export type MyBoardCounterConfig =
  | CHAT_COUNTER_TYPES.MY_BOARD_ALL
  | CHAT_COUNTER_TYPES.MY_BOARD_LAST_MESSAGE_FROM_CLIENT
  | null;

export type NeedsHelpCounterConfig = CHAT_COUNTER_TYPES.NEEDS_HELP | null;

export type AiHandledCounterConfig = CHAT_COUNTER_TYPES.AI_HANDLED | null;
