import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import Cookies from "universal-cookie";

//Import all translation files
import loginEnglish from "./English/login.json";
import loginSpanish from "./Spanish/login.json";
import loginPortuguese from "./Portuguese/login.json";
import chatSetupEnglish from "./English/chatSetup.json";
import chatSetupSpanish from "./Spanish/chatSetup.json";
import chatSetupPortuguese from "./Portuguese/chatSetup.json";
import navbarEnglish from "./English/navbar.json";
import navbarSpanish from "./Spanish/navbar.json";
import navbarPortuguese from "./Portuguese/navbar.json";
import billingEnglish from "./English/billing.json";
import billingSpanish from "./Spanish/billing.json";
import billingPortuguese from "./Portuguese/billing.json";
import chatEnglish from "./English/chat.json";
import chatSpanish from "./Spanish/chat.json";
import chatPortuguese from "./Portuguese/chat.json";
import clientsEnglish from "./English/clients.json";
import clientsSpanish from "./Spanish/clients.json";
import clientsPortuguese from "./Portuguese/clients.json";
import testEnglish from "./English/test.json";
import testSpanish from "./Spanish/test.json";
import testPortuguese from "./Portuguese/test.json";
import ticketsEnglish from "./English/tickets.json";
import ticketsSpanish from "./Spanish/tickets.json";
import ticketsPortuguese from "./Portuguese/tickets.json";
import settingsEnglish from "./English/settings.json";
import settingsSpanish from "./Spanish/settings.json";
import settingsPortuguese from "./Portuguese/settings.json";
import homeEnglish from "./English/home.json";
import homeSpanish from "./Spanish/home.json";
import homePortuguese from "./Portuguese/home.json";
import merchantsEnglish from "./English/merchants.json";
import merchantsSpanish from "./Spanish/merchants.json";
import merchantsPortuguese from "./Portuguese/merchants.json";
import chatAdminEnglish from "./English/chatAdmin.json";
import chatAdminSpanish from "./Spanish/chatAdmin.json";
import chatAdminPortuguese from "./Portuguese/chatAdmin.json";
import homeAdminEnglish from "./English/homeAdmin.json";
import homeAdminSpanish from "./Spanish/homeAdmin.json";
import homeAdminPortuguese from "./Portuguese/homeAdmin.json";
import dropdownEnglish from "./English/dropdown.json";
import dropdownSpanish from "./Spanish/dropdown.json";
import dropdownPortuguese from "./Portuguese/dropdown.json";
import additionalInfoEnglish from "./English/additionalInfo.json";
import additionalInfoSpanish from "./Spanish/additionalInfo.json";
import additionalInfoPortuguese from "./Portuguese/additionalInfo.json";
import assistantFormEnglish from "./English/assistantForm.json";
import assistantFormSpanish from "./Spanish/assistantForm.json";
import assistantFormPortuguese from "./Portuguese/assistantForm.json";
import trainingEnglish from "./English/training.json";
import trainingSpanish from "./Spanish/training.json";
import trainingPortuguese from "./Portuguese/training.json";
import chatReviewEnglish from "./English/chatReview.json";
import chatReviewSpanish from "./Spanish/chatReview.json";
import chatReviewPortuguese from "./Portuguese/chatReview.json";
import customOfferManagerEnglish from "./English/customOfferManager.json";
import customOfferManagerSpanish from "./Spanish/customOfferManager.json";
import customOfferManagerPortuguese from "./Portuguese/customOfferManager.json";
import cachedResponsesEnglish from "./English/cachedResponses.json";
import cachedResponsesSpanish from "./Spanish/cachedResponses.json";
import cachedResponsesPortuguese from "./Portuguese/cachedResponses.json";
import chatFunctionsManagerEnglish from "./English/chatFunctionsManager.json";
import chatFunctionsManagerSpanish from "./Spanish/chatFunctionsManager.json";
import chatFunctionsManagerPortuguese from "./Portuguese/chatFunctionsManager.json";
import approveSalesEnglish from "./English/approveSales.json";
import approveSalesSpanish from "./Spanish/approveSales.json";
import approveSalesPortuguese from "./Portuguese/approveSales.json";
import childrenSelectorEnglish from "./English/childrenSelector.json";
import childrenSelectorSpanish from "./Spanish/childrenSelector.json";
import childrenSelectorPortuguese from "./Portuguese/childrenSelector.json";
import customWidgetManagerEnglish from "./English/customWidgetManager.json";
import customWidgetManagerSpanish from "./Spanish/customWidgetManager.json";
import customWidgetManagerPortuguese from "./Portuguese/customWidgetManager.json";
import whatsAppTemplatesModalEnglish from "./English/whatsAppTemplatesModal.json";
import whatsAppTemplatesModalSpanish from "./Spanish/whatsAppTemplatesModal.json";
import whatsAppTemplatesModalPortuguese from "./Portuguese/whatsAppTemplatesModal.json";
import partnersEnglish from "./English/partners.json";
import partnersSpanish from "./Spanish/partners.json";
import partnersPortuguese from "./Portuguese/partners.json";
import ipsEnglish from "./English/ips.json";
import ipsSpanish from "./Spanish/ips.json";
import ipsPortuguese from "./Portuguese/ips.json";
import productFiltersModalEnglish from "./English/productFiltersModal.json";
import productFiltersModalSpanish from "./Spanish/productFiltersModal.json";
import productFiltersModalPortuguese from "./Portuguese/productFiltersModal.json";
import referralSelectorEnglish from "./English/referralSelector.json";
import referralSelectorSpanish from "./Spanish/referralSelector.json";
import referralSelectorPortuguese from "./Portuguese/referralSelector.json";
import kamSelectorEnglish from "./English/kamSelector.json";
import kamSelectorSpanish from "./Spanish/kamSelector.json";
import kamSelectorPortuguese from "./Portuguese/kamSelector.json";
import userAdminEnglish from "./English/userAdmin.json";
import userAdminSpanish from "./Spanish/userAdmin.json";
import userAdminPortuguese from "./Portuguese/userAdmin.json";
import userEnglish from "./English/user.json";
import userSpanish from "./Spanish/user.json";
import userPortuguese from "./Portuguese/user.json";
import createCampaignEnglish from "./English/createCampaign.json";
import createCampaignSpanish from "./Spanish/createCampaign.json";
import createCampaignPortuguese from "./Portuguese/createCampaign.json";
import campaignsEnglish from "./English/campaigns.json";
import campaignsSpanish from "./Spanish/campaigns.json";
import campaignsPortuguese from "./Portuguese/campaigns.json";
import campaignDetailsEnglish from "./English/campaignDetails.json";
import campaignDetailsSpanish from "./Spanish/campaignDetails.json";
import campaignDetailsPortuguese from "./Portuguese/campaignDetails.json";
import automationsEnglish from "./English/automations.json";
import automationsSpanish from "./Spanish/automations.json";
import automationsPortuguese from "./Portuguese/automations.json";
import createAutomationEnglish from "./English/createAutomation.json";
import createAutomationSpanish from "./Spanish/createAutomation.json";
import createAutomationPortuguese from "./Portuguese/createAutomation.json";
import aiAgentAdminEnglish from "./English/aiAgentAdmin.json";
import aiAgentAdminSpanish from "./Spanish/aiAgentAdmin.json";
import aiAgentAdminPortuguese from "./Portuguese/aiAgentAdmin.json";
import dateSelectorEnglish from "./English/dateSelector.json";
import dateSelectorSpanish from "./Spanish/dateSelector.json";
import dateSelectorPortuguese from "./Portuguese/dateSelector.json";
import departmentsEnglish from "./English/departments.json";
import departmentsSpanish from "./Spanish/departments.json";
import departmentsPortuguese from "./Portuguese/departments.json";
import automationDetailsEnglish from "./English/automationDetails.json";
import automationDetailsSpanish from "./Spanish/automationDetails.json";
import automationDetailsPortuguese from "./Portuguese/automationDetails.json";
import metricsEnglish from "./English/metrics.json";
import metricsSpanish from "./Spanish/metrics.json";
import metricsPortuguese from "./Portuguese/metrics.json";
import bottombarEnglish from "./English/bottombar.json";
import bottombarSpanish from "./Spanish/bottombar.json";
import bottombarPortuguese from "./Portuguese/bottombar.json";
import knowledgeCenterEnglish from "./English/knowledgeCenter.json";
import knowledgeCenterSpanish from "./Spanish/knowledgeCenter.json";
import metricsMiningEnglish from "./English/miningMetrics.json";
import metricsMiningSpanish from "./Spanish/miningMetrics.json";
import metricsMiningPortuguese from "./Portuguese/miningMetrics.json";
import miningEnglish from "./English/mining.json";
import miningSpanish from "./Spanish/mining.json";
import miningPortuguese from "./Portuguese/mining.json";
import dragnDropEnglish from "./English/dragDrop.json";
import dragnDropSpanish from "./Spanish/dragDrop.json";
import dragnDropPortuguese from "./Portuguese/dragDrop.json";
import genericPickerInputEnglish from "./English/genericPickerInput.json";
import genericPickerInputSpanish from "./Spanish/genericPickerInput.json";
import genericPickerInputPortuguese from "./Portuguese/genericPickerInput.json";
import monthsEnglish from "./English/months.json";
import monthsSpanish from "./Spanish/months.json";
import monthsPortuguese from "./Portuguese/months.json";
import whatsappTemplateEnglish from "./English/whatsappTemplate.json";
import whatsappTemplateSpanish from "./Spanish/whatsappTemplate.json";
import whatsappTemplatePortuguese from "./Portuguese/whatsappTemplate.json";
import kamReportEnglish from "./English/kamReport.json";
import kamReportSpanish from "./Spanish/kamReport.json";
import kamReportPortuguese from "./Portuguese/kamReport.json";
import commentsEnglish from "./English/comments.json";
import commentsSpanish from "./Spanish/comments.json";
import commentsPortuguese from "./Portuguese/comments.json";
import postsEnglish from "./English/posts.json";
import postsSpanish from "./Spanish/posts.json";
import postsPortuguese from "./Portuguese/posts.json";
import kamAgentsEnglish from "./English/kamAgents.json";
import kamAgentsSpaninsh from "./Spanish/kamAgents.json";
import kamAgentsPortuguese from "./Portuguese/kamAgents.json";
import kamAgentMetricsEnglish from "./English/kamAgentMetrics.json";
import kamAgentMetricsSpanish from "./Spanish/kamAgentMetrics.json";
import kamAgentMetricsPortuguese from "./Portuguese/kamAgentMetrics.json";
import dateRangePickerEnglish from "./English/dateRangePicker.json";
import dateRangePickerSpanish from "./Spanish/dateRangePicker.json";
import dateRangePickerPortuguese from "./Portuguese/dateRangePicker.json";
import metaErrorsSpanish from "./Spanish/metaErrors.json";
import metaErrorsEnglish from "./English/metaErrors.json";
import metaErrorsPortuguese from "./Portuguese/metaErrors.json";
import metaCampaignsEnglish from "./English/metaCampaigns.json";
import metaCampaignsSpanish from "./Spanish/metaCampaigns.json";
import metaCampaignsPortuguese from "./Portuguese/metaCampaigns.json";
import timeEnglish from "./English/time.json";
import timeSpanish from "./Spanish/time.json";
import timePortuguese from "./Portuguese/time.json";
import rolesEnglish from "./English/roles.json";
import rolesSpanish from "./Spanish/roles.json";
import rolesPortuguese from "./Portuguese/roles.json";
import metaTemplatesSpanish from "./Spanish/metaTemplates.json";
import metaTemplatesEnglish from "./English/metaTemplates.json";
import metaTemplatesPortuguese from "./Portuguese/metaTemplates.json";
import supportEnglish from "./English/support.json";
import supportSpanish from "./Spanish/support.json";
import supportPortuguese from "./Portuguese/support.json";
import helpCenterEnglish from "./English/helpCenter.json"
import helpCenterSpanish from "./Spanish/helpCenter.json"
import helpCenterPortuguese from "./Portuguese/helpCenter.json"

const cookies = new Cookies();

//Get browser language for the first time
let language = "en";
if (!cookies.get("language")) {
  const browserLang = navigator.language.toLocaleLowerCase();
  /* language = browserLang.startsWith("es") ? "es" : "en"; */
  if (browserLang.startsWith("es")) {
    language = "es";
  } else if (browserLang.startsWith("pt")) {
    language = "pt";
  } else {
    language = "en";
  }
  cookies.set("language", language, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
} else {
  const storedLang = cookies.get("language").toLowerCase();

  const supportedLangs = ["en", "es", "pt"];
  language = supportedLangs.includes(storedLang) ? storedLang : "en";
}

/* if (undefined === cookies.get("language")) {
  cookies.set("language", "en", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

const language = cookies.get("language"); */

const resources = {
  en: {
    login: loginEnglish,
    chatSetup: chatSetupEnglish,
    navbar: navbarEnglish,
    billing: billingEnglish,
    chat: chatEnglish,
    clients: clientsEnglish,
    test: testEnglish,
    tickets: ticketsEnglish,
    settings: settingsEnglish,
    home: homeEnglish,
    merchants: merchantsEnglish,
    chatAdmin: chatAdminEnglish,
    homeAdmin: homeAdminEnglish,
    dropdown: dropdownEnglish,
    additionalInfo: additionalInfoEnglish,
    assistantForm: assistantFormEnglish,
    training: trainingEnglish,
    chatReview: chatReviewEnglish,
    customOfferManager: customOfferManagerEnglish,
    customWidgetManager: customWidgetManagerEnglish,
    cachedResponses: cachedResponsesEnglish,
    chatFunctionsManager: chatFunctionsManagerEnglish,
    approveSales: approveSalesEnglish,
    childrenSelector: childrenSelectorEnglish,
    whatsAppTemplatesModal: whatsAppTemplatesModalEnglish,
    productFiltersModal: productFiltersModalEnglish,
    partners: partnersEnglish,
    referralSelector: referralSelectorEnglish,
    ips: ipsEnglish,
    kamSelector: kamSelectorEnglish,
    users: userEnglish,
    usersAdmin: userAdminEnglish,
    createCampaign: createCampaignEnglish,
    campaigns: campaignsEnglish,
    campaignDetails: campaignDetailsEnglish,
    automations: automationsEnglish,
    createAutomation: createAutomationEnglish,
    aiAgentAdmin: aiAgentAdminEnglish,
    dateSelector: dateSelectorEnglish,
    departments: departmentsEnglish,
    automationDetails: automationDetailsEnglish,
    metrics: metricsEnglish,
    bottombar: bottombarEnglish,
    knowledgeCenter: knowledgeCenterEnglish,
    months: monthsEnglish,
    miningMetrics: metricsMiningEnglish,
    mining: miningEnglish,
    dragndrop: dragnDropEnglish,
    genericPickerInput: genericPickerInputEnglish,
    whatsappTemplate: whatsappTemplateEnglish,
    kamReport: kamReportEnglish,
    comments: commentsEnglish,
    posts: postsEnglish,
    kamAgents: kamAgentsEnglish,
    kamAgentMetrics: kamAgentMetricsEnglish,
    dateRangePicker: dateRangePickerEnglish,
    metaErrors: metaErrorsEnglish,
    metaCampaigns: metaCampaignsEnglish,
    time: timeEnglish,
    roles: rolesEnglish,
    metaTemplates: metaTemplatesEnglish,
    support: supportEnglish,
    helpCenter: helpCenterEnglish,
  },
  es: {
    login: loginSpanish,
    chatSetup: chatSetupSpanish,
    navbar: navbarSpanish,
    billing: billingSpanish,
    chat: chatSpanish,
    clients: clientsSpanish,
    test: testSpanish,
    tickets: ticketsSpanish,
    settings: settingsSpanish,
    home: homeSpanish,
    merchants: merchantsSpanish,
    chatAdmin: chatAdminSpanish,
    homeAdmin: homeAdminSpanish,
    dropdown: dropdownSpanish,
    additionalInfo: additionalInfoSpanish,
    assistantForm: assistantFormSpanish,
    training: trainingSpanish,
    chatReview: chatReviewSpanish,
    customOfferManager: customOfferManagerSpanish,
    customWidgetManager: customWidgetManagerSpanish,
    cachedResponses: cachedResponsesSpanish,
    chatFunctionsManager: chatFunctionsManagerSpanish,
    approveSales: approveSalesSpanish,
    childrenSelector: childrenSelectorSpanish,
    whatsAppTemplatesModal: whatsAppTemplatesModalSpanish,
    productFiltersModal: productFiltersModalSpanish,
    partners: partnersSpanish,
    referralSelector: referralSelectorSpanish,
    ips: ipsSpanish,
    kamSelector: kamSelectorSpanish,
    users: userSpanish,
    usersAdmin: userAdminSpanish,
    createCampaign: createCampaignSpanish,
    campaigns: campaignsSpanish,
    campaignDetails: campaignDetailsSpanish,
    automations: automationsSpanish,
    createAutomation: createAutomationSpanish,
    aiAgentAdmin: aiAgentAdminSpanish,
    dateSelector: dateSelectorSpanish,
    departments: departmentsSpanish,
    automationDetails: automationDetailsSpanish,
    metrics: metricsSpanish,
    bottombar: bottombarSpanish,
    knowledgeCenter: knowledgeCenterSpanish,
    miningMetrics: metricsMiningSpanish,
    mining: miningSpanish,
    dragndrop: dragnDropSpanish,
    genericPickerInput: genericPickerInputSpanish,
    months: monthsSpanish,
    whatsappTemplate: whatsappTemplateSpanish,
    kamReport: kamReportSpanish,
    comments: commentsSpanish,
    posts: postsSpanish,
    kamAgents: kamAgentsSpaninsh,
    kamAgentMetrics: kamAgentMetricsSpanish,
    dateRangePicker: dateRangePickerSpanish,
    metaErrors: metaErrorsSpanish,
    metaCampaigns: metaCampaignsSpanish,
    time: timeSpanish,
    roles: rolesSpanish,
    metaTemplates: metaTemplatesSpanish,
    support: supportSpanish,
    helpCenter: helpCenterSpanish,
  },
  pt: {
    login: loginPortuguese,
    chatSetup: chatSetupPortuguese,
    navbar: navbarPortuguese,
    billing: billingPortuguese,
    chat: chatPortuguese,
    clients: clientsPortuguese,
    test: testPortuguese,
    tickets: ticketsPortuguese,
    settings: settingsPortuguese,
    home: homePortuguese,
    merchants: merchantsPortuguese,
    chatAdmin: chatAdminPortuguese,
    homeAdmin: homeAdminPortuguese,
    dropdown: dropdownPortuguese,
    additionalInfo: additionalInfoPortuguese,
    assistantForm: assistantFormPortuguese,
    training: trainingPortuguese,
    chatReview: chatReviewPortuguese,
    customOfferManager: customOfferManagerPortuguese,
    customWidgetManager: customWidgetManagerPortuguese,
    cachedResponses: cachedResponsesPortuguese,
    chatFunctionsManager: chatFunctionsManagerPortuguese,
    approveSales: approveSalesPortuguese,
    childrenSelector: childrenSelectorPortuguese,
    whatsAppTemplatesModal: whatsAppTemplatesModalPortuguese,
    productFiltersModal: productFiltersModalPortuguese,
    partners: partnersPortuguese,
    referralSelector: referralSelectorPortuguese,
    ips: ipsPortuguese,
    kamSelector: kamSelectorPortuguese,
    users: userPortuguese,
    usersAdmin: userAdminPortuguese,
    createCampaign: createCampaignPortuguese,
    campaigns: campaignsPortuguese,
    campaignDetails: campaignDetailsPortuguese,
    automations: automationsPortuguese,
    createAutomation: createAutomationPortuguese,
    aiAgentAdmin: aiAgentAdminPortuguese,
    dateSelector: dateSelectorPortuguese,
    departments: departmentsPortuguese,
    automationDetails: automationDetailsPortuguese,
    metrics: metricsPortuguese,
    bottombar: bottombarPortuguese,
    miningMetrics: metricsMiningPortuguese,
    mining: miningPortuguese,
    dragndrop: dragnDropPortuguese,
    genericPickerInput: genericPickerInputPortuguese,
    months: monthsPortuguese,
    whatsappTemplate: whatsappTemplatePortuguese,
    kamReport: kamReportPortuguese,
    comments: commentsPortuguese,
    posts: postsPortuguese,
    KamAgents: kamAgentsPortuguese,
    kamAgentMetrics: kamAgentMetricsPortuguese,
    dateRangePicker: dateRangePickerPortuguese,
    metaErrors: metaErrorsPortuguese,
    metaCampaigns: metaCampaignsPortuguese,
    time: timePortuguese,
    roles: rolesPortuguese,
    metaTemplates: metaTemplatesPortuguese,
    support: supportPortuguese,
    helpCenter: helpCenterPortuguese,
  },
};

i18next.use(initReactI18next).init({
  resources,
  lng: language, //default language
});

export default i18next;
