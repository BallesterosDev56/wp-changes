export type IWhatsAppAccount = {
  id: string;
  displayPhone: string;
  isAiActive: boolean;
  status: ESourceStatus;
  verifiedName: string;
  additionalUrlParams: string | null;
  hasCoexistence: boolean;
  echoAiFreezePeriod: number;
  wasContactsSyncTriggered: boolean;
  wasMessagesSyncTriggered: boolean;
  lastCoexistenceIntegrationDate: Date | null;
  messagingLimit?: EWhatsAppMessagingLimitTier | null;
  onlyMonitoring: boolean;
};

export type IMessengerAccount = {
  id: string;
  pageName: string;
  pageId: string;
  isAiActive: boolean;
  status: ESourceStatus;
  echoAiFreezePeriod: number;
  additionalUrlParams: string | null;
  authVersion: number;
  periodicallySyncFeed: boolean;
};

export type IInstagramAccount = {
  id: string;
  igUsername: string;
  isAiActive: boolean;
  status: ESourceStatus;
  replyToStoryMentions: boolean;
  replyToStoryReplies: boolean;
  echoAiFreezePeriod: number;
  additionalUrlParams: string | null;
  authVersion: number;
  periodicallySyncFeed: boolean;
};

export type IMetaAdAccount = {
  id: string;
  adAccountId: string;
  name: string;
  status: ESourceStatus;
};

export type IWhatsAppAccountUpdate = Omit<
  IWhatsAppAccount,
  "id" | "displayPhone" | "verifiedName"
>;

export type IInstagramAccountUpdate = Omit<
  IInstagramAccount,
  "id" | "igUsername" | "status"
>;

export type IWhatsAppSessionAccount = {
  id: string;
  displayPhone: string;
  status: ESourceStatus;
  name: string;
  proxy: {
    host: string;
    port: number;
    username: string;
    password: string;
  };
  hasMigrated: boolean;
};

export type IMessengerAccountUpdate = Omit<
  IMessengerAccount,
  "id" | "pageName" | "pageId" | "status"
>;

export enum ESourceStatus {
  ACTIVE = "active",
  DELETED = "deleted",
}

// COMMENTS

export type MetaGraphApiPaging = {
  cursors?: { before?: string; after?: string };
  next?: string;
  previous?: string;
};

export type MetaPaged<T> = {
  data: T[];
  paging?: MetaGraphApiPaging;
};

export type PageComment = {
  id: string;
  from?: { id: string; name: string };
  message: string;
  created_time: string;
  comments?: MetaPaged<PageComment>;
};

export type PageFeedBackend = {
  data: {
    created_time: string;
    message?: string;
    id: string;
    full_picture?: string;
    attachments?: { data: { media: any; type: string }[] };
    comments?: MetaPaged<PageComment>;
  }[];
  paging?: MetaGraphApiPaging;
};

type PagePostBackend = PageFeedBackend["data"][number];
type PagePost = PagePostBackend & { selected: boolean };

export type PageFeed = Omit<PageFeedBackend, "data"> & {
  data: PagePost[];
};

export type InstagramFeedBackend = {
  data: {
    id: string;
    caption: string;
    media_url: string;
    media_type: string;
    timestamp: string;
    thumbnail_url: string;
    comments?: {
      data: {
        id: string;
        timestamp: string;
        from: { id: string; username: string };
        username: string;
        hidden: boolean;
        text: string;
        replies?: {
          data: {
            id: string;
            timestamp: string;
            from: { id: string; username: string };
            username: string;
            hidden: boolean;
            text: string;
          }[];
          paging?: MetaGraphApiPaging;
        };
      }[];
      paging?: MetaGraphApiPaging;
    };
  }[];
  paging?: MetaGraphApiPaging;
};

type InstagramMediaBackend = InstagramFeedBackend["data"][number];
type InstagramMedia = InstagramMediaBackend & { selected: boolean };

export type InstagramFeed = Omit<InstagramFeedBackend, "data"> & {
  data: InstagramMedia[];
};

export type IGMediaComment = NonNullable<
  InstagramFeedBackend["data"][number]["comments"]
>["data"][number];

export type IGCommentReply = NonNullable<
  NonNullable<
    InstagramFeedBackend["data"][number]["comments"]
  >["data"][number]["replies"]
>["data"][number];

export const META_ERRORS_MAP: Record<number | string, string> = {
  // Authorization errors
  0: "TOKEN_EXPIRED_OR_INVALID",
  3: "NOT_ENOUGH_PERMISSIONS",
  10: "PERMISSION_DENIED",
  190: "TOKEN_EXPIRED",
  200: "PERMISSION_DENIED_OR_REMOVED",
  209: "PERMISSION_DENIED_OR_REMOVED",

  // Integrity errors
  368: "TEMPORALLY_BLOCKED_DUE_TO_POLICY_VIOLATIONS",
  130497: "CERTAIN_COUNTRIES_NOT_ALLOWED",
  131031: "ACCOUNT_BLOCKED",

  // Template creation errors
  2388040: "CHARACTER_LIMIT_EXCEEDED",
  2388047: "HEADER_INVALID_CHARACTERS",
  2388072: "BODY_INVALID_CHARACTERS_OR_FORMATTING",
  2388073: "FOOTER_INVALID_CHARACTERS",
  2388293: "TOO_MANY_VARIABLES",
  2388299: "VARIABLES_CANNOT_BE_START_OR_END",

  //Send template errors
  2388019: "TEMPLATE_MESSAGES_LIMIT_EXCEEDED",

  //Phone migration errors
  2388001: "PHONE_NEEDS_CONFIRMATION", // OR "TWO_STEP_VERIFICATION_SHOULD_BE_DISABLED",
  2388012: "NUMBER_ALREADY_EXISTS",
  2388091: "VERIFICATION_NOT_AVAILABLE_FOR_NUMBER",
  2388093: "VERIFICATION_NOT_AVAILABLE_FOR_NUMBER",
  2388103: "ADD_NUMBER_TO_WHATSAPP_ACCOUNT_FIRST",
  2494100: "NUMBER_IN_MAINTENANCE_MODE",

  // Template insights errors
  200005: "TEMPLATE_INSIGHTS_NOT_AVAILABLE",
  200006: "CANNOT_DISABLE_TEMPLATE_INSIGHTS",
  200007: "TEMPLATE_INSIGHTS_NOT_ENABLED",

  // WABA errors
  2593079: "TEMPLATE_INSIGHTS_NOT_AVAILABLE",
  2593085: "WABA_NOT_AVAILABLE_FOR_OBO_MOBILITY",

  // Sync errors
  2593107: "SYNC_LIMIT_EXCEEDED",
  2593108: "SYNC_REQUEST_OUT_OF_ALLOWED_TIME_WINDOW",

  // Throttle errors
  4: "TOO_MANY_CALLS",
  80007: "WABA_REACHED_RATE_LIMIT",
  130429: "API_THROUGHPUT_LIMIT_EXCEEDED",
  131048: "SPAM_RATE_LIMIT",
  131056: "MESSAGE_FROM_THE_SAME_TO_THE_SAME_USER_LIMIT_EXCEEDED",
  133016: "REGISTER_OR_DEREGISTER_LIMIT_EXCEEDED",

  // Other errors
  1: "UNKNOWN_ERROR",
  2: "SERVICE_UNAVAILABLE",
  33: "NUMBER_DELETED",
  100: "PARAMETER_INVALID",
  130472: "MARKETING_MESSAGES_NOT_ALLOWED",
  131000: "META_SERVER_ERROR",
  131005: "PERMISSION_DENIED",
  131008: "MISSING_PARAMETERS_IN_REQUEST",
  131009: "ONE_OR_MORE_PARAMETERS_INVALID",
  131016: "SERVICE_TEMPORARILY_UNAVAILABLE",
  131021: "RECIPIENT_CANNOT_BE_SENDER",
  131026: "UNABLE_TO_DELIVER",
  131037: "NUMBER_DOES_NOT_HAVE_AN_APPROVED_DISPLAY_NAME",
  131042: "PAYMENT_METHOD_PROBLEM",
  131045: "SENT_FAILED_BECAUSE_NUMBER_NOT_VERIFIED",
  131047: "MORE_THAN_24HOURS_WINDOW_TO_REPLY",
  131049: "META_DECIDED_NOT_TO_SEND", // Healthy ecosystem error, should try with other template or normal message
  131050: "RECIPIENT_BLOCKED_MARKETING_MESSAGES",
  131051: "UNSUPPORTED_MESSAGE_TYPE",
  131052: "MEDIA_DOWNLOAD_FAILED",
  131053: "MEDIA_UPLOAD_FAILED",
  131057: "ACCOUNT_IN_MAINTENANCE_MODE",
  132000: "MISSING_TEMPLATE_VARIABLES_TO_FILL_OR_EXTRA_VARIABLES_PROVIDED",
  132001: "TEMPLATE_NOT_FOUND",
  132005: "TEMPLATE_TEXT_TOO_LONG",
  132007: "TEMPLAE_CONTENT_POLICY_VIOLATION",
  132012: "TEMPLATE_PARAMETER_FORMAT_INVALID",
  132015: "PAUSED_TEMPLATED",
  132016: "DISABLED_TEMPLATE",
  132068: "FLOW_NOT_AVAILABLE",
  132069: "THROTTLED_FLOW",
  133000: "INCOMPLETE_DEREGISTRATION",
  133004: "META_SERVER_TEMPORARILY_UNAVAILABLE",
  133005: "TWO_STEP_PIN_INCORRECT",
  133006: "PHONE_NUMBER_NEED_RE_VERIFICATION",
  133008: "TOO_MANY_TWO_STEP_VERIFICATION_ATTEMPTS",
  133009: "TOO_QUICK_TWO_STEP_VERIFICATION_ATTEMPTS",
  133010: "PHONE_NUMBER_NOT_REGISTERED",
  133015: "PHONE_NUMBER_DELETED",
  134011: "PAYMENT_TERMS_NOT_ACCEPTED",
  135000: "UNKWON_ERROR",

  // Marketing messages errors
  "100-M": "MESSAGE_MUST_BE_A_TEMPLATE",
  "131009-M": "ONE_OR_MORE_PARAMETERS_INVALID_FOR_MARKETING_MESSAGE",
  131055: "ONLY_MARKETING_MESSAGES_ALLOWED",
  134100: "ONLY_ABLE_TO_SEND_MARKETING_MESSAGES",
  134101: "TEMPLATE_STILL_SYNCING",
  134102: "TEMPLATE_UNAVAILABLE_FOR_USE",
  1752041: "DUPLICATE_REQUEST",
};

export const INSTAGRAM_ERRORS_MAP: Record<number | string, string> = {
  //Instagram errors
  "-2": "MEDIA_TOO_LONG_OR_EXPIRED",
  "-1": "MEDIA_UPLOAD_ERROR",
  1: "THUMBNAIL_OUT_OF_RANGE",
  4: "SPAM_SUSPICIOUS",
  9: "MAX_POSTS_REACHED",
  24: "MEDIA_NOT_FOUND",
  25: "ACCOUNT_RESTRICTED",
  100: "PARAMETER_INVALID",
  352: "VIDEO_FORMAT_UNSUPPORTED",
  9004: "MEDIA_COULD_NOT_BE_FETCHED",
  9007: "MEDIA_NOT_READY",
  36000: "IMAGE_TOO_LARGE",
  36001: "IMAGE_FORMAT_UNSUPPORTED",
  36003: "INVALID_ASPECT_RATIO",
  36004: "CAPTION_TOO_LONG",
};

export const MESSENGER_ERRORS_MAP: Record<
  number | string,
  string | Record<number | string, string>
> = {
  // Messenger errors
  1: {
    99: "UNKNOWN_ERROR",
    1357046: "RECEIVED_INVALID_REPLY",
  },
  2: {
    default: "META_ISSUES",
    2018344: "META_TEMPORARILY_UNAVAILABLE",
  },
  4: {
    default: "RATE_LIMIT_EXCEEDED",
    2018354: "MARKETING_MESSAGES_RATE_LIMIT_EXCEEDED",
  },
  9: {
    2018352: "TOO_MANY_ACTIONS",
  },
  10: {
    default: "NOT_PERMISSIONS_FOR_INSTANT_GAMES",
    1404170: "NOT_ENOUGH_PERMISSIONS",
    1893015: "USER_STOPPED_NOTIFICATIONS_FOR_THIS_KIND_OF_MESSAGE",
    2018336: "USER_THREAD_IMPACT",
    2534022: "MESSAGE_OUTSIDE_ALLOWED_WINDOW",
    2534077: "CANNOT_VERIFY_IG_CONNECTION",
    2018278: "MESSAGE_OUTSIDE_ALLOWED_WINDOW",
    2018065: "MESSAGE_OUTSIDE_ALLOWED_WINDOW",
    2018108: "PERSON_CANNOT_RECEIVE_MESSAGES",
  },
  100: {
    default: "INVALID_PARAMETER",
    33: "UNSUPPORTED_GET_REQUEST",
    2018001: "NOT_MATCHING_USER_FOUND",
    2018008: "FAILED_TO_FETCH_FILE",
    2018014: "CANNOT_SEND_MESSAGE_AND_STATE_AT_SAME_TIME",
    2018047: "UPLOAD_ATTACHMENT_FAILED",
    2018074: "INVALID_ID_OR_DONT_OWN_ATTACHMENT",
    2018109: "ATTACHMENT_SIZE_EXCEEDED",
    2018164: "INCORRECT_APP_ID",
    2018294: "VIDEO_UPLOAD_TIMED_OUT",
    2018320: "INVALID_PRODUCT_ID",
    2018328: "PRODUCT_TEMPLATE_NOT_SUPPORTED",
    2534013: "THE_PAGE_IS_NOT_LINKED_TO_AN_IG_ACCOUNT",
    2534014: "NO_MATCHING_IG_USER",
    2534015: "INVALID_MESSAGE_DATA",
    2534025: "COMMENT_INVALID_FOR_PRIVATE_REPLY",
    2534029: "BUSSINES_BLOCKED_BY_MESSAGING",
    2534037: "INVALID_ACTION_NOT_THREAD_OWNER",
  },
  190: {
    default: "INVALID_ACCESS_TOKEN",
  },
  200: {
    default: "PERMISSION_ERROR",
    1545041: "PERSON_NOT_AVAILABLE",
    2018021: "PHONE_MATCHING_ACCESS_FEE_REQUIRED",
    2018027: "PAGES_MESSAGING_PHONE_NUMBER_PERMISSION_REQUIRED",
    2018028: "PAGES_MESSAGING_PERMISSION_REQUIRED",
    2534041: "IG_DM_ACCESS_DISABLED_OR_REVOKED",
  },

  551: {
    default: "USER_BLOCK_ERROR",
    1545041: "PERSON_NOT_AVAILABLE",
  },

  613: {
    default: "SCOPE_OF_SERVICE_EXCEEDED",
    1893016: "MULTIPLE_OPTIN_SAME_TOPIC",
    2018338: "MESSAGE_TAG_ABUSE_WARNING",
    2534040: "API_RATE_LIMIT_EXCEEDED",
  },

  2022: "COMMERCE_MESSAGES_TEMPORARILY_DISABLED",
  10303: "INVALID_ACCOUNT_LINKING_TOKEN",
  24001: "USER_CANCELED_PAYMENT_FLOW",
  24002: "PAYMENT_MISSING_PRIVACY_URL",
  24005: "FAILED_TO_GET_USER_ID",
  36103: "IG_ACCOUNT_NOT_ELIGIBLE_FOR_API",
  2018144: "INSTANT_GAME_NOTIFICATION_LIMIT",
  2018154: "MESSENGER_EXTENSIONS_UNEXPECTED_ERROR",
  2018163: "BEGIN_SHARE_PARAM_VALIDATION_ERROR",
  2018166: "SDK_API_PERMISSION_NOT_VALID",
  2018171: "ONLY_PRIMARY_SECONDARY_RECEIVERS",
  2018218: "NO_PROFILE_AVAILABLE_FOR_USER",
  2018234: "DENY_SECONDARY_RECEIVER_VISIBILITY",
  2018247: "INSUFFICIENT_PROFILE_PERMISSION",
  2018300: "THREAD_CONTROLLED_BY_ANOTHER_APP",
  2018321: "THREAD_CONTROLLED_BY_MESSENGER_QA_FLOW",
  2071010: "SDK_METHOD_NOT_SUPPORTED",
  2071011: "MESSENGER_EXTENSIONS_NOT_ENABLED",
  2071014: "INVALID_MESSAGE_CONTENT",
  2071015: "INVALID_TITLE_STRING",
  2071016: "INVALID_SUBTITLE_STRING",
  2071017: "INVALID_IMAGE_URL",
  2071018: "INVALID_ITEM_URL",
  2071019: "INVALID_BUTTON_DATA",
  2071020: "MISSING_URL_DATA",
  2071021: "INVALID_SHARING_TYPE",
  2071022: "INVALID_ATTACHMENT_SHARE_FLOW",
  2071023: "ATTACHMENT_TYPE_MUST_BE_TEMPLATE",
  2071024: "INVALID_PAYLOAD_ATTACHMENT",
  2071025: "INVALID_OPEN_GRAPH_URL",
  9000001: "MESSAGE_DELETED",
  2018389: "PAGE_NOT_ALLOWLISTED",
  2018390: "INVALID_CALL_ID",
  2018391: "INVALID_CONNECTION_PARAMETER",
  2018392: "INVALID_SDP_PARAMETER",
  2018393: "INVALID_CALL_PARTICIPANT_PAGE",
  2018394: "INSUFFICIENT_PERMISSION_TO_JOIN_CALL",
  2018395: "CANNOT_JOIN_FAILED_CALL",
  2018396: "CANNOT_JOIN_ENDED_CALL",
};

export enum EWhatsAppMessagingLimitTier {
  TIER_250 = "TIER_250",
  TIER_1K = "TIER_1K",
  TIER_2K = "TIER_2K",
  TIER_10K = "TIER_10K",
  TIER_100K = "TIER_100K",
  TIER_UNLIMITED = "TIER_UNLIMITED",
}

export const WHATSAPP_MESSAGING_LIMITS: Record<
  EWhatsAppMessagingLimitTier,
  number | "UNLIMITED"
> = {
  [EWhatsAppMessagingLimitTier.TIER_250]: 250,
  [EWhatsAppMessagingLimitTier.TIER_1K]: 1000,
  [EWhatsAppMessagingLimitTier.TIER_2K]: 2000,
  [EWhatsAppMessagingLimitTier.TIER_10K]: 10000,
  [EWhatsAppMessagingLimitTier.TIER_100K]: 100000,
  [EWhatsAppMessagingLimitTier.TIER_UNLIMITED]: "UNLIMITED",
};
