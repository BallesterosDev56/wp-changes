// Message

import {
  IExtraUIComponent,
  INewExtraUIComponent,
} from "../extraUIcomponents/extraUIComponentTypes";
import { IPaymentEmailRegister, IUserOfMessage } from "./UserType";

export type IMessage = {
  whatsappTemplateRecord?: WhatsappTemplateRecord;
  id?: string;
  role: EMessageRole;
  name: string | null;
  content: string;
  functionCall: string | null;
  toolCalls: string | null;
  toolCallId: string | null;
  createDate: string;
  extraUIComponents: IExtraUIComponent[] | null;
  extraUIComponentReference: INewExtraUIComponent[] | null;
  sourceType: EMessageSourceTypes;
  sourceId: string | null;
  hasMedia: boolean;
  interpretationForLLM?: string | null;
  status: EMessageStatus;
  localMedia?: File;
  localMediaUrl?: string;
  emailSubject?: string | null;
  emailMessageId?: string | null;
  whatsAppContacts?: WhatsAppContact[] | null;
  whatsAppLocation?: WhatsAppLocation | null;
  whatsAppReferral?: WhatsAppReferral | null;
  whatsAppMessageId?: string | null;
  instagramMessageId?: string | null;
  instagramReferral?: MetaReferral | null;
  messengerMessageId?: string | null;
  messengerReferral?: MetaReferral | null;
  metaAttachment?: MetaAttachment | null;
  replyTo?: string | null;
  sending?: boolean;
  sentBy?: IUserOfMessage;
  isAsset?: boolean;
  audioTranscription?: string | null;
  whatsAppMediaPlaceholder?: boolean | null;
  metaErrorLogs?: string | null;
  metaTemplatePayload?: MetaTemplatePayload;
  messageLogs?: IMessageLogs | null;
  paymentEmailRegister?: IPaymentEmailRegister | null;
  paymentEmailRegisterSearchLastDate?: Date | null;
};

export interface IMessageAdmin extends IMessage {
  showLogs: boolean;
  messageLogs: IMessageLogs | null;
}

export type IMessageBackend = {
  id?: string;
  role: EMessageRole;
  name: string | null;
  content: string;
  functionCall: string | null;
  toolCalls: string | null;
  toolCallId: string | null;
  createDate: string;
  extraUIComponents: string | null;
  extraUIComponentReference: INewExtraUIComponent[] | null;
  sourceType: EMessageSourceTypes;
  sourceId: string | null;
  hasMedia: boolean;
  interpretationForLLM: string | null;
  status: EMessageStatus;
  messageLogs: string | null;
  emailSubject: string | null;
  whatsAppContacts: WhatsAppContact[] | null;
  whatsAppLocation: WhatsAppLocation | null;
  whatsAppReferral: WhatsAppReferral | null;
  whatsAppMessageId: string | null;
  instagramMessageId: string | null;
  instagramReferral: MetaReferral | null;
  messengerMessageId: string | null;
  messengerReferral: MetaReferral | null;
  replyTo: string | null;
  sentBy?: IUserOfMessage;
  isAsset?: boolean;
  audioTranscription?: string | null;
  whatsAppMediaPlaceholder?: boolean | null;
  paymentEmailRegister?: IPaymentEmailRegister | null;
  paymentEmailRegisterSearchLastDate?: Date | null;
};

export type IMessageLogs = {
  initialPrompt: {
    aiAgentName: string;
    prompt: string;
  } | null;
  generalInformation: string | null;
  addOnContent: string[] | null;
  addOnReasoning?:
    | {
        availableTriggers: string[];
        selectedTriggers: string[];
        reasoning: string;
      }[]
    | null;
  addOnFiltering?: {
    filteredOutContent: string[] | null;
    reasoning: string | null;
  } | null;
  functionLogs: string[] | null;
  reasoningContent: string | null;
  errors?: string | null;
};

export enum EMessageRole {
  assistant = "assistant",
  ai = "ai",
  user = "user",
  function = "function",
  tool = "tool",
}

export enum EMessageSourceTypes {
  SHOPIFY_WIDGET = "shopify widget",
  WHATSAPP = "whatsapp",
  WHATSAPP_SESSION = "whatsapp session",
  INSTAGRAM = "instagram",
  MESSENGER = "messenger",
  EMAIL = "email",
  ASSISTANT_CHAT = "assistant chat",
}

export enum EMessageStatus {
  SENDING = "sending",
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  FAILED = "failed",
  DELETED = "deleted",
}

export type WhatsAppContact = {
  addresses?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    country_code?: string;
    type: string;
  }[];
  birthday?: string;
  emails?: { email?: string; type?: string }[];
  name: {
    formatted_name: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    suffix?: string;
    preffix?: string;
  };
  org?: { company?: string; department?: string; title?: string };
  phones?: { phone?: string; type?: string; wa_id?: string }[];
  urls?: { url?: string; type?: string }[];
};

export type WhatsAppLocation = {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
  url?: string;
};

export type WhatsAppReferral = {
  source_url?: string;
  source_type?: "ad" | "post";
  headline?: string;
  body?: string;
  media_type?: "image" | "video";
  image_url?: string;
  video_url?: string;
  thumbnail_url?: string;
  ctwa_clid?: string;
};

export type MetaReferral = {
  source?: string;
  type?: string;
  ad_id?: string;
  ads_context_data?: {
    ad_title?: string;
    post_id?: string;
    video_url?: string;
    photo_url?: string;
  };
};

export type IgReelAttachment = {
  type: 'ig_reel';
  payload: {
    reel_video_id: string;
    title?: string;
    url?: string;
  };
};

export type IgStoryAttachment = {
  type: 'ig_story';
  payload: {
    story_media_id: string;
    story_media_url: string;
  };
};

export type IgPostAttachment = {
  type: 'ig_post';
  payload: {
    ig_post_media_id: string;
    title?: string;
    url?: string;
  };
};

export type PostAttachment = {
  type: 'post';
  payload: {
    id: string;
    title?: string;
    url?: string;
  };
};

export type ReelAttachment = {
  type: 'reel';
  payload: {
    reel_video_id: string;
    title?: string;
    url?: string;
  };
};

export type MetaAttachment =
  | IgReelAttachment
  | IgStoryAttachment
  | IgPostAttachment
  | PostAttachment
  | ReelAttachment;

// WhatsApp Template Record Types
export enum EWhatsappTemplateRecordHeaderTypes {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  DOCUMENT = "DOCUMENT",
  LOCATION = "LOCATION",
}

export enum EWhatsappTemplateRecordButtonTypes {
  QUICK_REPLY = "QUICK_REPLY",
  URL = "URL",
  PHONE_NUMBER = "PHONE_NUMBER",
  COPY_CODE = "COPY_CODE",
}

export type WhatsappTemplateRecordButton = {
  type: EWhatsappTemplateRecordButtonTypes;
  text: string;
  url?: string;
  phoneNumber?: string;
  code?: string;
};

export type WhatsappTemplateRecordHeader = {
  type: EWhatsappTemplateRecordHeaderTypes;
  text?: string;
  mediaUrl?: string;
  mediaId?: string;
  filename?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
};

export type WhatsappTemplateRecord = {
  _id?: string;
  messageId: string;
  templateName: string;
  metaTemplateId: string;
  relationalEntityId: string;
  language: string;
  category: string;
  header?: WhatsappTemplateRecordHeader;
  body: string;
  footer?: string;
  buttons?: WhatsappTemplateRecordButton[];
  metadata?: {
    shopId?: string;
    whatsappAccountId?: string;
    clientId?: string;
    conversationId?: string;
    [key: string]: any;
  };
  sentAt: Date | string;
};
export type MetaTemplatePayload = {
  generic: {
    elements: {
      title: string;
      subtitle?: string;
      text?: string;
      mediaId?: string;
      filename?: string;
      mediaType?: string;
      buttons: { title: string; type: string; url: string; payload: string }[];
    }[];
  };
};

export interface IWidgetMessage {
  id?: string;
  role: EMessageRole;
  content: string;
  createDate: string;
  toolCalls?: string;
  form?: any;
  name?: string;
  extraUIComponents?: IExtraUIComponent[] | null;
  extraUIComponentReference?: INewExtraUIComponent[] | null;
  hasMedia?: boolean;
  interpretationForLLM?: string;
  status?: any;
  emailSubject?: string;
  whatsAppContacts?: any;
  whatsAppLocation?: any;
  whatsAppReferral?: any;
  showLogs?: boolean;
  messageLogs?: IMessageLogs | null;
  localMedia?: File;
}
