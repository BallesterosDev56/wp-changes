// NEW COMMENTS VERSION

import { IPageCursorMeta } from "../components/core/pagination/Pagination";
import { ITagOption } from "../components/KnowledgeMedia";
import { IClientBase } from "./ClientType";
import {
  ESourceStatus,
  IInstagramAccount,
  IMessengerAccount,
} from "./MetaTypes";

export type Asset = {
  id: string;
  type: ASSET_TYPES;
  label: string;
  contentDescription: string;
  approvedContentDescription: boolean;
  selected?: boolean;
  productList?: { products: ITagOption[] };
};

export enum ASSET_TYPES {
  // Images
  ImageJpeg = "image/jpeg",
  ImagePng = "image/png",
  ImageGif = "image/gif",
  ImageHeic = "image/heic",

  // Video
  VideoMp4 = "video/mp4",
  Video3gp = "video/3gp",

  // Script
  Script = "script",

  // Audio
  AudioAac = "audio/aac",
  AudioMpeg = "audio/mpeg",
  AudioMp4 = "audio/mp4",
  AudioWav = "audio/wav",

  // File
  ExcelLegacy = "application/vnd.ms-excel",
  ExcelXlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  WordLegacy = "application/msword",
  WordDocx = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  PowerPointLegacy = "application/vnd.ms-powerpoint",
  PowerPointPptx = "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  Pdf = "application/pdf",
}

export enum COMMENT_ACCOUNT_TYPES {
  FACEBOOK = "FACEBOOK",
  INSTAGRAM = "INSTAGRAM",
}

export type MessengerCommentAccount = {
  type: COMMENT_ACCOUNT_TYPES.FACEBOOK;
  account: IMessengerAccount;
  syncingState?: PostSyncingState;
};

export type InstagramCommentAccount = {
  type: COMMENT_ACCOUNT_TYPES.INSTAGRAM;
  account: IInstagramAccount;
  syncingState?: PostSyncingState;
};

export enum POST_SYNC_STATUS {
  FETCHING = "FETCHING",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
}

export type PostSyncingState = {
  totalCount: number;
  completedCount: number;
  fetchingCompleted: boolean;
  status: POST_SYNC_STATUS;
};

export type CommentAccount = MessengerCommentAccount | InstagramCommentAccount;

export type CommentFacebookPost = {
  type: COMMENT_ACCOUNT_TYPES.FACEBOOK;
  post: FacebookPost;
};

export type CommentInstagramMedia = {
  type: COMMENT_ACCOUNT_TYPES.INSTAGRAM;
  media: InstagramMedia;
};

export type CommentPost = CommentFacebookPost | CommentInstagramMedia;

export type NewCommentEvent =
  | NewInstagramCommentEvent
  | NewFacebookCommentEvent;

export type NewInstagramCommentEvent = {
  type: COMMENT_ACCOUNT_TYPES.INSTAGRAM;
  shopId: string;
  media: InstagramMedia;
  comment: BackendComment;
};

export type NewFacebookCommentEvent = {
  type: COMMENT_ACCOUNT_TYPES.FACEBOOK;
  shopId: string;
  post: FacebookPost;
  comment: BackendComment;
};

export enum COMMENT_STATUS {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

export enum COMMENT_ROLE {
  USER = "USER",
  AI = "AI",
  CLIENT = "CLIENT",
}

export type BackendComment = {
  id: string;
  accountType: COMMENT_ACCOUNT_TYPES;
  platformId: string;
  parentPlatformId: string;
  fromPlatformId: string;
  fromRole: COMMENT_ROLE;
  fromName: string;
  content: string;
  commentDate: string;
  hidden: boolean;
  createDate: string;
  updateDate: string;
  status: COMMENT_STATUS;
  commentClassification?: CommentClassification;
  deletedByAi: boolean;
  deletedByUser: boolean;
  createdByAi: boolean;
  createdByUser: boolean;
  repliedByAi: boolean;
  repliedByUser: boolean;
  hiddenByAi: boolean;
  hiddenByUser: boolean;
  hasReplies: boolean;
  wentThroughClassification: boolean;
  sentDM: boolean;
  mediaType?: ASSET_TYPES;
  mediaId?: string;
  facebookPost?: FacebookPost;
  instagramMedia?: InstagramMedia;
  client?: IClientBase;
};

export interface CommentFromList extends BackendComment {
  selected: boolean;
}

export interface Comment extends BackendComment {
  comments: { data: Comment[]; paging: IPageCursorMeta };
  showingReplies: boolean;
}

export type FacebookPostAttachments = { data: { media: any; type: string }[] };

export type FacebookPost = {
  id: string;
  facebookId: string;
  message: string;
  createdTime: string;
  permalinkUrl: string;
  fullPicture: string;
  attachments: FacebookPostAttachments;
  createDate: string;
  updateDate: string;
  hasUnapprovedAssets?: boolean;
  messengerAccount?: IMessengerAccount;
  assetsManager?: {
    id: string;
    assets?: Asset[];
  };
  comments?: { data: Comment[]; paging: IPageCursorMeta };
};

export interface ListFacebookPost extends FacebookPost {
  selected: boolean;
  comments: { data: Comment[]; paging: IPageCursorMeta };
}

export type InstagramMedia = {
  id: string;
  instagramId: string;
  caption: string;
  permalink: string;
  mediaUrl: string;
  mediaType: string;
  timestamp: string;
  thumbnailUrl: string;
  createDate: string;
  updateDate: string;
  hasUnapprovedAssets?: boolean;
  instagramAccount?: IInstagramAccount;
  assetsManager?: {
    id: string;
    assets?: Asset[];
  };
  comments?: { data: Comment[]; paging: IPageCursorMeta };
};

export interface ListInstagramMedia extends InstagramMedia {
  selected: boolean;
  comments: { data: Comment[]; paging: IPageCursorMeta };
}

export type InstagramStory = {
  id: string;
  instagramId: string;
  caption: string;
  permalink: string;
  mediaUrl: string;
  mediaType: string;
  timestamp: string;
  thumbnailUrl: string;
  createDate: string;
  updateDate: string;
  hasUnapprovedAssets?: boolean;
  instagramAccount?: IInstagramAccount;
  assetsManager?: {
    id: string;
    assets?: Asset[];
  };
};

export interface ListInstagramStory extends InstagramStory {
  selected: boolean;
}

export type InstagramMediaMention = {
  id: string;
  instagramId: string;
  caption: string;
  permalink: string;
  mediaUrl: string;
  mediaType: string;
  timestamp: string;
  thumbnailUrl: string;
  username?: string;
  createDate: string;
  updateDate: string;
  hasUnapprovedAssets?: boolean;
  instagramAccount?: IInstagramAccount;
  assetsManager?: {
    id: string;
    assets?: Asset[];
  };
};

export interface ListInstagramMediaMention extends InstagramMediaMention {
  selected: boolean;
}

export type InstagramStoryMention = {
  id: string;
  instagramId: string;
  link: string;
  username?: string;
  createDate: string;
  updateDate: string;
  hasUnapprovedAssets?: boolean;
  instagramAccount?: IInstagramAccount;
  assetsManager?: {
    id: string;
    assets?: Asset[];
  };
};

export interface ListInstagramStoryMention extends InstagramStoryMention {
  selected: boolean;
}


export enum COMMENT_CLASSIFICATION_ACTIONS {
  HIDE_COMMENT = "HIDE_COMMENT",
  DELETE = "DELETE",
  AI_REPLY_WITH_COMMENT = "AI_REPLY_WITH_COMMENT",
  AI_REPLY_WITH_MESSAGE = "AI_REPLY_WITH_MESSAGE",
  REPLY_WITH_COMMENT = "REPLY_WITH_COMMENT",
  REPLY_WITH_MESSAGE = "REPLY_WITH_MESSAGE",
}

export type BackendCommentClassification = {
  id: string;
  name: string;
  color: string;
  classificationType: COMMENT_CLASSIFICATION_TYPE;
  classificationKeywords: string;
  classificationPrompt: string;
  actions: { id: string; name: COMMENT_CLASSIFICATION_ACTIONS }[];
  commentReplyType?: COMMENT_REPLY_TYPE;
  commentReplyPrompt?: string;
  commentReplyResponse?: string;
  dmReplyType?: COMMENT_REPLY_TYPE;
  dmReplyPrompt?: string;
  dmReplyResponse?: string;
  createDate: string;
};

export type CommentClassification = {
  id: string;
  name: string;
  color: string;
  classificationType: COMMENT_CLASSIFICATION_TYPE;
  classificationKeywords: string[];
  classificationPrompt: string;
  actions: COMMENT_CLASSIFICATION_ACTIONS[];
  commentReplyType?: COMMENT_REPLY_TYPE;
  commentReplyPrompt?: string;
  commentReplyResponse?: string;
  dmReplyType?: COMMENT_REPLY_TYPE;
  dmReplyPrompt?: string;
  dmReplyResponse?: {
    text: string;
    buttons?: { type: string; title: string; url?: string; payload?: string }[];
  };
  createDate: string;
};

export type BackendCommentClassificationConfig = {
  id: string;
  commentClassifications: BackendCommentClassification[];
  closeAllComments: boolean;
};

export type CommentClassificationConfig = {
  id: string;
  commentClassifications: CommentClassification[];
  closeAllComments: boolean;
};

export type ICommentsFilter = {
  initialDate: string;
  finalDate: string;
};

export const emptyICommentsFilter: ICommentsFilter = {
  initialDate: "",
  finalDate: "",
};

export type ICommentSource = {
  type: COMMENT_ACCOUNT_TYPES;
  account: IMessengerAccount | IInstagramAccount;
  id: string;
  title: string;
  status: ESourceStatus;
  filter: boolean;
};

export enum COMMENT_CLASSIFICATION_TYPE {
  AI = "AI",
  KEYWORDS = "KEYWORDS",
}

export enum COMMENT_REPLY_TYPE {
  AI = "AI",
  FIXED = "FIXED",
}
