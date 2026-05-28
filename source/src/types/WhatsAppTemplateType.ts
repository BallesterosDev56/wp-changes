export type IWhatsAppTemplate = {
  id: string;
  language: string;
  category: string;
  components: any[];
  name: string;
  status: string;
  // For frontend purposes
  selected: boolean;
  metaTemplateId?: string;
  whatsappAccountId?: string;
};

export const emptyIWhatsAppTemplate = {
  id: "",
  language: "",
  category: "",
  components: [],
  name: "",
  status: "",
  selected: false,
};

export const getButtonTypes = (t: any) => [
  {
    value: "QUICK_REPLY",
    label: t("QuickReply", { ns: ["whatsappTemplate"] }),
  },
  { value: "URL", label: t("GoToWebsite", { ns: ["whatsappTemplate"] }) },
  {
    value: "PHONE_NUMBER",
    label: t("CallPhoneNumber", { ns: ["whatsappTemplate"] }),
  },
  { value: "OTP", label: "OTP" },
  { value: "COPY_CODE", label: t("CopyCode", { ns: ["whatsappTemplate"] }) },
  { value: "MPM", label: "MPM" },
  { value: "SPM", label: "SPM" },
];

export const getUrlTypeOptions = (t: any) => [
  { value: "STATIC", label: t("StaticUrl", { ns: ["whatsappTemplate"] }) },
  { value: "DYNAMIC", label: t("DynamicUrl", { ns: ["whatsappTemplate"] }) },
];

export const getMultimediaOptions = (t: any) => [
  { value: "NONE", label: t("None", { ns: ["whatsappTemplate"] }) },
  { value: "IMAGE", label: t("Image", { ns: ["whatsappTemplate"] }) },
  { value: "VIDEO", label: t("Video", { ns: ["whatsappTemplate"] }) },
  { value: "DOCUMENT", label: t("Document", { ns: ["whatsappTemplate"] }) },
  { value: "LOCATION", label: t("Location", { ns: ["whatsappTemplate"] }) },
];

export const getTemplateTypesByCategory = (t: any) => ({
  MARKETING: [
    {
      value: "DEFAULT",
      label: t("Default", { ns: ["whatsappTemplate"] }),
      description: t("DefaultMarketingDescription", {
        ns: ["whatsappTemplate"],
      }),
    },
  ],
  UTILITY: [
    {
      value: "DEFAULT",
      label: t("Default", { ns: ["whatsappTemplate"] }),
      description: t("DefaultUtilityDescription", { ns: ["whatsappTemplate"] }),
    },
  ],
});

export const getCategoryOptions = (t: any) => [
  { value: "MARKETING", label: t("Marketing", { ns: ["whatsappTemplate"] }) },
  { value: "UTILITY", label: t("Utility", { ns: ["whatsappTemplate"] }) },
];

export const ALLOWED_BUTTON_TYPES: Record<string, string[]> = {
  MARKETING_DEFAULT: ["QUICK_REPLY", "URL", "PHONE_NUMBER", "COPY_CODE"],
};

export const WHATSAPP_LANGUAGES = [
  { code: "es", label: "Spanish" },
  { code: "en", label: "English" },
  { code: "pt", label: "Portuguese" },
];
