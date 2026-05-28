import {
  IClientFromSuperClient,
  ISuperClient,
  ISuperClientFromList,
  ISuperClientInfo,
  ESuperClientState,
  emptyISuperClientInfo,
} from '../types/ClientType';
import { EMessageRole, EMessageSourceTypes } from '../types/MessageType';
import { ISale } from '../types/SaleType';
import wizy_whatsapp_icon from '../images/wizy_whatsapp_icon.svg';
import wizy_instagram_icon from '../images/wizy_instagram_icon.svg';
import wizy_messenger_icon from '../images/wizy_messenger_icon.svg';
import wizy_shopify_icon from '../images/wizy_shopify_icon.svg';
import wizy_mail_filled from '../images/wizy_mail_filled.svg';
import pencilIcon from '../images/pencil.svg';

import { ReactComponent as WhatsappLogo } from '../images/logos/messages/Whatsapp.svg';
import { ReactComponent as FacebookLogo } from '../images/logos/messages/Facebook.svg';
import { ReactComponent as InstagramLogo } from '../images/logos/messages/Instagram.svg';
import { ReactComponent as WebLogo } from '../images/logos/messages/Web.svg';

import * as cheerio from 'cheerio';

import { ITicket } from '../types/TicketType';
import { IWhatsAppTemplate } from '../types/WhatsAppTemplateType';
import { ITemplateVariable } from '../components/BulkWhatsAppTemplateForm';
import {
  RecommendationFlow,
  RecommendationFlowQuestion,
  SEMANTICAL_TRIGGERS_TYPE,
} from '../types/AdditionalInfoType';
import {
  ESourceStatus,
  EWhatsAppMessagingLimitTier,
  WHATSAPP_MESSAGING_LIMITS,
} from '../types/MetaTypes';
import { ISource } from '../pages/chats/Chat';
import { IConversation } from '../pages/chats/Chat';
import { IShop } from '../types/ShopType';

export const isNotBlank = (value: any): boolean => {
  return value !== null && value !== undefined && value !== '';
};

// Function to format date as "Jan 5, 2023 | 3:45 PM"
export function formatDate4(date: Date): string {
  const dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', dateOptions).format(
    date,
  );
  const formattedTime = new Intl.DateTimeFormat('en-US', timeOptions).format(
    date,
  );

  return `${formattedDate} | ${formattedTime}`;
}
// Function to format date as "3:45 PM | Jan 5"
export function formatDate3(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    month: 'short',
    day: 'numeric',
  };

  const formatted = new Intl.DateTimeFormat('en-US', options).format(date);

  const [monthDay, time] = formatted.split(', ');
  return `${time} | ${monthDay}`;
}

export const formatDate2 = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const formatTime = (milliseconds: number) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days >= 1) {
    return days + 'd';
  } else if (hours >= 1) {
    return hours + 'h';
  } else if (minutes >= 1) {
    return minutes + 'm';
  } else {
    return seconds + 's';
  }
};

export const formatDate = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${hours}:${minutes} ${year}-${month}-${day}`;
};

export const formatDateUTC = (date: Date) => {
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');

  return `${hours}:${minutes} ${year}-${month}-${day}`;
};

export const getUnique = (arr: any[]) => {
  const uniqueSet = new Set(arr);
  return Array.from(uniqueSet);
};

export const localTimeToUTC = (time: string, timezone: string): string => {
  const timezoneOffset = parseFloat(timezone);

  const [datePart, timePart] = time.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);

  const localDate = new Date(year, month - 1, day, hours, minutes);
  const utcDate = new Date(
    localDate.getTime() - timezoneOffset * 60 * 60 * 1000,
  );

  const utcYear = utcDate.getFullYear();
  const utcMonth = String(utcDate.getMonth() + 1).padStart(2, '0');
  const utcDay = String(utcDate.getDate()).padStart(2, '0');
  const utcHours = String(utcDate.getHours()).padStart(2, '0');
  const utcMinutes = String(utcDate.getMinutes()).padStart(2, '0');

  return `${utcYear}-${utcMonth}-${utcDay}T${utcHours}:${utcMinutes}`;
};

export const UTCToLocalTime = (time: string, timezone: string): string => {
  const timezoneOffset = parseFloat(timezone);

  const [datePart, timePart] = time.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);

  const utcDate = new Date(year, month - 1, day, hours, minutes);
  const localDate = new Date(
    utcDate.getTime() + timezoneOffset * 60 * 60 * 1000,
  );

  const localYear = localDate.getFullYear();
  const localMonth = String(localDate.getMonth() + 1).padStart(2, '0');
  const localDay = String(localDate.getDate()).padStart(2, '0');
  const localHours = String(localDate.getHours()).padStart(2, '0');
  const localMinutes = String(localDate.getMinutes()).padStart(2, '0');
  return `${localYear}-${localMonth}-${localDay}T${localHours}:${localMinutes}`;
};

export const adjustCronExpression = (
  cronExpression: string,
  hourDifference: number,
  toLocal: boolean,
) => {
  const parts = cronExpression.split(' ');
  const [minuteStr, hourStr, dayOfMonthStr, monthStr, weekdayStr] = parts;
  // Parse hours
  let hour = parseInt(hourStr, 10);
  // Adjust the hour by the given difference
  let newHour = toLocal ? hour + hourDifference : hour - hourDifference;
  let dayShift = 0;

  // If newHour < 0, wrap around and shift weekday back
  if (newHour < 0) {
    newHour += 24;
    dayShift = -1; // we moved to the previous day
  }

  // If newHour > 23, wrap around and shift weekday forward
  if (newHour > 23) {
    newHour -= 24;
    dayShift = 1; // we moved to the next day
  }

  let newWeekdayStr = weekdayStr;
  // Adjust weekdays if dayShift is needed
  if (weekdayStr !== '' && weekdayStr !== 'X') {
    if (dayShift !== 0) {
      const weekdays = weekdayStr.split(',').map((wd) => {
        const w = parseInt(wd, 10);
        return w;
      });
      for (let i = 0; i < weekdays.length; i++) {
        let newWeekday = weekdays[i] + dayShift;
        // Wrap around if outside 0-6
        if (newWeekday < 0) {
          newWeekday += 7;
        } else if (newWeekday > 6) {
          newWeekday -= 7;
        }
        weekdays[i] = newWeekday;
      }
      newWeekdayStr = weekdays.join(',');
    }
  }

  // Construct the new cron expression

  const newCron = `${minuteStr} ${newHour} * * ${newWeekdayStr}`;

  return newCron;
};

export const CONVERSATION_ICON_IMAGES: {
  [key in EMessageSourceTypes]: string;
} = {
  [EMessageSourceTypes.SHOPIFY_WIDGET]: wizy_shopify_icon,
  [EMessageSourceTypes.WHATSAPP]: wizy_whatsapp_icon,
  [EMessageSourceTypes.WHATSAPP_SESSION]: wizy_whatsapp_icon,
  [EMessageSourceTypes.INSTAGRAM]: wizy_instagram_icon,
  [EMessageSourceTypes.MESSENGER]: wizy_messenger_icon,
  [EMessageSourceTypes.EMAIL]: wizy_mail_filled,
  [EMessageSourceTypes.ASSISTANT_CHAT]: '',
};

/* NEW ICONS ADDED FOR NOTIFICATION */
export const CONVERSATION_ICON_SVG: {
  [key in EMessageSourceTypes]: React.FC<React.SVGProps<SVGSVGElement>>;
} = {
  [EMessageSourceTypes.SHOPIFY_WIDGET]: WebLogo,
  [EMessageSourceTypes.WHATSAPP]: WhatsappLogo,
  [EMessageSourceTypes.WHATSAPP_SESSION]: WhatsappLogo,
  [EMessageSourceTypes.INSTAGRAM]: InstagramLogo,
  [EMessageSourceTypes.MESSENGER]: FacebookLogo,
  [EMessageSourceTypes.EMAIL]: WebLogo,
  [EMessageSourceTypes.ASSISTANT_CHAT]: () => null,
};

export const CONVERSATION_ICON_COLOR_CLASS: {
  [key in EMessageSourceTypes]: string;
} = {
  [EMessageSourceTypes.SHOPIFY_WIDGET]: 'shopify-color',
  [EMessageSourceTypes.WHATSAPP]: 'whatsapp-color',
  [EMessageSourceTypes.WHATSAPP_SESSION]: 'whatsapp-session-color',
  [EMessageSourceTypes.INSTAGRAM]: 'instagram-color',
  [EMessageSourceTypes.MESSENGER]: 'messenger-color',
  [EMessageSourceTypes.EMAIL]: 'email-color',
  [EMessageSourceTypes.ASSISTANT_CHAT]: '',
};

export const getConversationsFromSelectedSuperClient = (
  superClient: ISuperClient,
  shopSources: ISource[],
  shop: IShop,
): IConversation[] => {
  // Group messages by unique sourceIds, including when sourceId is null
  const conversations = superClient.clients.flatMap((client) =>
    (client.sources ?? []).flatMap((source) => {
      const shopSource = shopSources.find(
        (shopSource) => shopSource.sourceId === source.sourceId,
      );
      return {
        messages: (client.messages ?? [])
          .filter((message) =>
            source.sourceType === EMessageSourceTypes.SHOPIFY_WIDGET
              ? message.sourceId === null || message.sourceId === shop.id
              : message.sourceId === source.sourceId,
          )
          .map((message) => ({
            ...message,
            extraUIComponents: message.extraUIComponents
              ? JSON.parse(message.extraUIComponents)
              : null,
            messageLogs: message.messageLogs
              ? (() => {
                  try {
                    const parsed = JSON.parse(message.messageLogs);
                    return parsed;
                  } catch (e) {
                    return null;
                  }
                })()
              : null,
          }))
          .sort((a, b) => Date.parse(a.createDate) - Date.parse(b.createDate)),
        sourceType: source.sourceType,
        sourceId: source.sourceId,
        clientId: client.id,
        superClientId: superClient.id,
        selected: false,
        status:
          source.sourceType === EMessageSourceTypes.SHOPIFY_WIDGET
            ? ESourceStatus.ACTIVE
            : shopSource
              ? shopSource.status
              : ESourceStatus.DELETED,
      };
    }),
  );

  // Sort conversations by which has the most recent last message
  conversations.sort(
    (a, b) =>
      Date.parse(b.messages[b.messages.length - 1].createDate) -
      Date.parse(a.messages[a.messages.length - 1].createDate),
  );
  // Set the conversation with the most recent message as selected
  if (conversations[0]) {
    conversations[0].selected = true;
  }
  return conversations;
};

export const upsertSuperClientFromSuperClient = (
  oldSuperClient: ISuperClientFromList,
  newSuperClient: ISuperClient,
): ISuperClientFromList => {
  const updatedClients = newSuperClient.clients.map((newClient) => {
    const prevClient = oldSuperClient.clients.find(
      (client) => client.id === newClient.id,
    );
    if (!prevClient) {
      return newClient;
    }
    return {
      ...prevClient,
      ...newClient,
      messages: upsert(prevClient.messages ?? [], newClient.messages ?? []),
    };
  });
  return {
    ...oldSuperClient,
    superClientTags: newSuperClient.superClientTags,
    state: newSuperClient.state,
    temporaryAssignedTo: newSuperClient.temporaryAssignedTo,
    defaultAssignedTo: newSuperClient.defaultAssignedTo,
    transferRequestTo: newSuperClient.transferRequestTo,
    shopifyClient: newSuperClient.shopifyClient,
    isPinned: newSuperClient.isPinned,
    isNew: newSuperClient.isNew,
    isBlocked: newSuperClient.isBlocked,
    isLastMessageFromClient: newSuperClient.isLastMessageFromClient,
    lastMessageDate: newSuperClient.lastMessageDate,
    clients: updatedClients,
  };
};

export const getMergedSuperClientInfo = (
  superClient: ISuperClient,
): ISuperClientInfo => {
  let newSuperClientInfo: ISuperClientInfo = emptyISuperClientInfo;
  let allSales: ISale[] = [];
  let allTickets: ITicket[] = [];

  const sortedClients = [...superClient.clients].sort(
    (a, b) =>
      new Date(a.lastMessageDate || 0).getTime() -
      new Date(b.lastMessageDate || 0).getTime(),
  );

  for (let i = 0; i < sortedClients.length; i++) {
    allSales = [...allSales, ...(sortedClients[i].sales ?? [])];
    allTickets = [...allTickets, ...(sortedClients[i].tickets ?? [])];

    for (let j = 0; j < Object.keys(sortedClients[i]).length; j++) {
      const currentKey = Object.keys(sortedClients[i])[
        j
      ] as keyof IClientFromSuperClient;

      if (isNotBlank(sortedClients[i][currentKey])) {
        newSuperClientInfo = {
          ...newSuperClientInfo,
          [currentKey]: sortedClients[i][currentKey],
        };
      }
    }
  }

  newSuperClientInfo = {
    ...newSuperClientInfo,
    id: superClient.id,
    state: superClient.state,
    defaultAssignedTo: superClient.defaultAssignedTo,
    temporaryAssignedTo: superClient.temporaryAssignedTo,
    transferRequestTo: superClient.transferRequestTo,
    superClientTags: superClient.superClientTags,
    sales: allSales,
    tickets: allTickets,
    funnelStageSuperClientRecords:
      superClient.funnelStageSuperClientRecords ?? [],
    conversationInitiated: superClient.clients.some(
      (client) => client.conversationInitiated,
    ),
    whatsAppClientId:
      superClient.clients.find((client) => isNotBlank(client.whatsAppNumber))
        ?.id ?? null,
    emailId:
      superClient.clients.find((client) => isNotBlank(client.emailId))
        ?.emailId ?? null,
    lastMessageDate: superClient.clients.some(
      (client) => client.conversationInitiated,
    )
      ? formatDate2(
          new Date(
            superClient.clients
              .map((client) => client.lastMessageDate)
              .reduce((latest, date) =>
                new Date(date) > new Date(latest) ? date : latest,
              ),
          ),
        )
      : '',
    shopifyClient: superClient.shopifyClient,
    clientCount: superClient.clients?.length ?? 0,
    isPinned: superClient.isPinned,
    isNew: superClient.isNew,
    isBlocked: superClient.isBlocked,
    clients: superClient.clients,
  };

  return newSuperClientInfo;
};

export const parseJsonResponse = async (response: Response): Promise<any> => {
  const text = await response.text();

  if (!response.ok) {
    try {
      const errorJson = JSON.parse(text);
      throw new Error(errorJson.message || 'Unknown error occurred');
    } catch {
      throw new Error(text);
    }
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Failed to parse JSON from server response');
  }
};

export const fetchData = async (
  url: string,
  returnType: 'json' | 'text' | 'none' = 'json',
) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
    return await handleResponse(response, returnType);
  } catch (error) {
    console.error('Error during GET request', error);
    throw error;
  }
};

export const postData = async (
  url: string,
  payload?: any,
  returnType: 'json' | 'text' | 'none' = 'json',
) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    return await handleResponse(response, returnType);
  } catch (error) {
    console.error('Error during POST request', error);
    throw error;
  }
};

export const deleteData = async (
  url: string,
  returnType: 'json' | 'text' | 'none' = 'json',
) => {
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
    });
    return await handleResponse(response, returnType);
  } catch (error) {
    console.error('Error during DELETE request', error);
    throw error;
  }
};

export const putData = async (
  url: string,
  payload: any,
  returnType: 'json' | 'text' | 'none' = 'json',
) => {
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    return await handleResponse(response, returnType);
  } catch (error) {
    console.error('Error during PUT request', error);
    throw error;
  }
};

const handleResponse = async (
  response: Response,
  returnType: 'json' | 'text' | 'none',
  // none es me la pela
) => {
  if (!response.ok) {
    return {
      error: response.statusText,
      status: response.status,
    };
  }

  if (returnType === 'json') {
    const data = await response.json();
    return {
      data,
      status: response.status,
    };
  }

  if (returnType === 'text') {
    return {
      data: await response.text(),
      status: response.status,
    };
  }

  return {
    status: response.status,
  };
};

export function formatHtml(body: string): string {
  const cheerioOutput = cheerio.load(body);
  cheerioOutput('script').remove();
  cheerioOutput('style').remove();
  cheerioOutput('iframe').remove();
  cheerioOutput('footer').remove();
  cheerioOutput('header').remove();
  const bodyText = cheerioOutput('body')
    .text()
    .replace(/\r?\n|\r/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ');

  return bodyText;
}
export const extractIframeSrcdoc = (htmlContent: string): string => {
  const $ = cheerio.load(htmlContent);
  const iframe = $('iframe');
  return iframe.attr('srcdoc') || htmlContent;
};
export const isBulkWhatsAppTemplateFilled = (
  template: IWhatsAppTemplate | undefined,
  bodyVariableFields: string[],
  urlVariableFields: string[],
): boolean => {
  // Check that header variables are filled
  if (template?.components) {
    let headerVariablesFilled = false;
    const headerComponent = template.components.find(
      (component) => component.type === 'HEADER',
    );
    if (headerComponent) {
      if (headerComponent.format === 'TEXT') {
        if (
          headerComponent.headerVariables &&
          headerComponent.headerVariables.length > 0
        ) {
          if (
            headerComponent.headerVariables.every(
              (templateVariable: ITemplateVariable) =>
                templateVariable.type === 'fixed'
                  ? isNotBlank(templateVariable.value)
                  : isNotBlank(templateVariable.field) &&
                    isNotBlank(templateVariable.default),
            )
          ) {
            headerVariablesFilled = true;
          }
        } else {
          headerVariablesFilled = true;
        }
      } else if (
        headerComponent.format === 'IMAGE' ||
        headerComponent.format === 'VIDEO' ||
        headerComponent.format === 'DOCUMENT'
      ) {
        if (headerComponent.file || headerComponent.mediaId) {
          headerVariablesFilled = true;
        }
      } else if (headerComponent.format === 'LOCATION') {
        if (
          headerComponent.name &&
          headerComponent.address &&
          headerComponent.latitude &&
          headerComponent.longitude
        ) {
          headerVariablesFilled = true;
        }
      } else {
        headerVariablesFilled = true;
      }
    } else {
      headerVariablesFilled = true;
    }

    // Check that body variables are filled
    const bodyVariables = template.components.find(
      (component) => component.type === 'BODY',
    ).bodyVariables;
    let bodyVariablesFilled = false;
    if (bodyVariables) {
      if (bodyVariables.length === 0) {
        bodyVariablesFilled = true;
      } else if (
        bodyVariables.every((templateVariable: ITemplateVariable) =>
          templateVariable.type === 'fixed'
            ? isNotBlank(templateVariable.value)
            : isNotBlank(templateVariable.field) &&
              isNotBlank(templateVariable.default),
        )
      ) {
        bodyVariablesFilled = true;
      }
    }
    // Check that button variables are filled
    let buttonVariablesFilled = true;
    const buttonsComponent = template.components.find(
      (component: any) => component.type === 'BUTTONS',
    );
    if (buttonsComponent) {
      const urlButtonsWithVariables = buttonsComponent.buttons?.filter(
        (button: any) =>
          button.type === 'URL' &&
          Array.isArray(button.buttonVariables) &&
          button.buttonVariables.length > 0,
      );
      if (urlButtonsWithVariables && urlButtonsWithVariables.length > 0) {
        buttonVariablesFilled = urlButtonsWithVariables.every((button: any) => {
          if (urlVariableFields.length === 0) {
            return button.buttonVariables.every((buttonVariable: any) => {
              if (typeof buttonVariable === 'string') {
                return isNotBlank(buttonVariable);
              } else if (buttonVariable && typeof buttonVariable === 'object') {
                return isNotBlank(buttonVariable.default);
              }
              return false;
            });
          } else {
            return button.buttonVariables.every(
              (templateVariable: ITemplateVariable) =>
                templateVariable.type === 'fixed'
                  ? isNotBlank(templateVariable.value)
                  : isNotBlank(templateVariable.field) &&
                    isNotBlank(templateVariable.default),
            );
          }
        });
      }
    }
    return (
      buttonVariablesFilled && bodyVariablesFilled && headerVariablesFilled
    );
  } else {
    return false;
  }
};

export function validateRecommendationFlow(
  recommendationFlow: RecommendationFlow,
): boolean {
  function validateQuestion(question: RecommendationFlowQuestion): boolean {
    if (question.directRecommendations) {
      return (question.responses[0].recommendations?.length ?? 0) > 0;
    } else {
      if (!question) {
        return false;
      }
      if (!question.question) {
        return false;
      }
      if (question.question.trim().length === 0) {
        return false;
      }
      if (question.responses.length === 0) {
        return false;
      }
      for (const response of question.responses) {
        if (!response.response) {
          return false;
        }
        if (response.response.trim().length === 0) {
          return false;
        }
        if (!response.makeInference) {
          const hasValidRecommendations =
            response.recommendations && response.recommendations.length > 0;
          const hasNestedQuestion = response.refersToNode !== undefined;
          if (!hasValidRecommendations && !hasNestedQuestion) {
            return false;
          }
          if (hasNestedQuestion) {
            const nestedValidation = validateQuestion(
              response.refersToNode?.questions[0]!,
            );
            if (!nestedValidation) {
              return false;
            }
          }
        }
      }
      return true;
    }
  }

  if (recommendationFlow.rootNode.questions.length === 0) {
    return false;
  }

  for (let i = 0; i < recommendationFlow.rootNode.questions.length; i++) {
    const result = validateQuestion(recommendationFlow.rootNode.questions[i]);
    if (!result) {
      return false;
    }
  }
  return true;
}

export const validateSemanticalTrigger = async (
  semanticalTrigger: string,
  type: SEMANTICAL_TRIGGERS_TYPE,
  globalSelectedBackend: string,
  shopId: string,
): Promise<boolean> => {
  const url = `${globalSelectedBackend}/semanticaltrigger/validate`;

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tag: semanticalTrigger,
      type,
      shopId,
    }),
  });

  if (!response.ok) {
    const { message } = await response.json();
    throw new Error(message);
  }

  // el backend devuelve un booleano puro
  return await response.json();
};

export const getSuperClientLatestMessage = (superClient: ISuperClient) => {
  return superClient.clients
    .flatMap((client) => client.messages)
    .reduce(
      (acum, message) =>
        // Find latest message
        message?.createDate &&
        new Date(message?.createDate) > new Date(acum.createDate)
          ? {
              createDate: message?.createDate,
              content: message?.content ?? '',
              sourceType: message?.sourceType,
              role: message?.role,
              sourceId: message.sourceId,
              superClient: superClient,
            }
          : acum,
      // Initialization
      {
        createDate:
          superClient.clients[0].messages?.[0]?.createDate ??
          new Date(
            new Date().setFullYear(new Date().getFullYear() - 5),
          ).toISOString(),
        content: superClient.clients[0].messages?.[0]?.content ?? '',
        sourceType: superClient.clients[0].messages?.[0]?.sourceType ?? null,
        role: superClient.clients[0].messages?.[0]?.role ?? EMessageRole.ai,
        sourceId: superClient.clients[0].messages?.[0]?.sourceId ?? null,
        superClient: superClient,
      },
    );
};

export function haveCommonElement<T>(list1: T[], list2: T[]): boolean {
  const set2 = new Set(list2);
  return list1.some((item) => set2.has(item));
}

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const supportedImageTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/heic',
];
export const supportedAudioTypes = [
  'audio/aac',
  'audio/amr',
  'audio/mpeg',
  'audio/mp4',
  'audio/ogg',
  'audio/wav',
];
export const supportedVideoTypes = ['video/3gp', 'video/mp4'];
export const supportedStickerTypes = ['image/webp'];
export const pdfDocumentTypes = ['application/pdf'];
export const spreadsheetsDocumentTypes = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
export const slidesDocumentTypes = [
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];
export const textDocumentTypes = [
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export function mapKnowledgeTagsToSpan(content: string): string {
  return content.replace(
    /\[([a-zA-Z0-9_]+)\s+id="([a-f0-9-]+)"(?:\s+display="([^"]+)")?\]([^\[]+)\[\/\1\]/g,
    (_match, mediaType, id, display, innerContent) => {
      // Media type is already a prefix (e.g., "image", "video"), matching backend format
      const mediaPrefix = mediaType;

      // Add edit button for editable media types (excluding collections)
      const editableTypes = [
        'product',
        'image',
        'video',
        'audio',
        'script',
        'application',
      ];
      const buttonHtml = editableTypes.includes(mediaPrefix)
        ? `<button class="KnowledgeInput__Tag__Button" data-tag-id="${id}" data-media-type="${mediaPrefix}"><img src="${pencilIcon}" alt="edit" /></button>`
        : '';

      // Add display attribute if present
      const displayAttr = display ? ` data-display="${display}"` : '';

      return `<span data-id="${id}" class="KnowledgeInput__Tag" contenteditable="false" data-type="${mediaPrefix}"${displayAttr}>${innerContent}${buttonHtml}</span>`;
    },
  );
}

export function mapSpanToKnowledgeTags(content: string): string {
  return content.replace(
    /<span\b(?=[^>]*\bclass="KnowledgeInput__Tag")(?=[^>]*\bdata-id="([0-9a-f-]+)")(?=[^>]*\bdata-type="([^"]+)")(?:[^>]*\bdata-display="([^"]+)")?[^>]*>([\s\S]*?)<\/span>/gi,
    (_match, id, mediaType, display, innerContent) => {
      // Remove button from innerContent when converting back to tags
      const textContent = innerContent.replace(
        /<button[^>]*>.*?<\/button>/gi,
        '',
      );

      // Add display attribute if present
      const displayAttr = display ? ` display="${display}"` : '';

      return `[${mediaType} id="${id}"${displayAttr}]${textContent}[/${mediaType}]`;
    },
  );
}

export const getAssetUploadSignedUrl = async (
  file: File,
  id: string,
  shopId: string,
  globalSelectedBackend: string,
): Promise<{
  signedUrl: string | undefined;
  assetId: string | undefined;
}> => {
  try {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    var raw = JSON.stringify({
      shopId: shopId,
      assetId: id,
      assetType: file.type,
    });
    const response = await fetch(
      globalSelectedBackend + '/assets/uploadsignedurl',
      {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        credentials: 'include',
        redirect: 'follow',
      },
    );
    if (!response.ok) {
      console.error('File upload failed', response.status, response.statusText);
      return { signedUrl: undefined, assetId: undefined };
    } else {
      const JSONresult = await response.json();

      return { signedUrl: JSONresult.signedUrl, assetId: JSONresult.assetId };
    }
  } catch (error) {
    console.error('Error generating signed url', error);
    return { signedUrl: undefined, assetId: undefined };
  }
};

export const uploadAssetToS3 = async (
  file: File,
  signedUrl: string,
): Promise<boolean> => {
  try {
    const response = await fetch(signedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type.split('/')[1],
      },
    });
    if (!response.ok) {
      console.error('File upload failed', response.status, response.statusText);
      console.dir(response, { depth: null });
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.error('Error uploading file', error);
    return false;
  }
};

export const htmlToPlainText = (html: string): string => {
  return html
    .replace(/<div><br><\/div>/gi, '\n') // line breaks inside empty divs
    .replace(/<div>/gi, '') // remove opening divs
    .replace(/<\/div>/gi, '\n') // treat closing divs as line breaks
    .replace(/<br\s*\/?>/gi, '\n') // convert <br> to newline
    .replace(/&nbsp;/gi, ' ') // decode common HTML entities
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/<\/?[^>]+(>|$)/g, '') // remove any other HTML tags
    .trim(); // remove leading/trailing whitespace
};

export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export function toDatetimeLocalString(input: Date | string) {
  const date = input instanceof Date ? input : new Date(input);
  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1); // Months are 0-based
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// This function upserts elements to a list taking into account that if they have the same id, it is updated instead of appended
export function upsert<T extends { id?: string | number }>(
  list: T[],
  newItems: T | T[] | null | undefined,
): T[] {
  if (!newItems) return list;

  const itemsToInsert = Array.isArray(newItems) ? newItems : [newItems];
  const existingMap = new Map<string | number, T>();
  const itemsWithoutId: T[] = [];

  // Build the map with defined ids from original list, collect items with undefined id
  for (const item of list) {
    if (item && item.id !== undefined && item.id !== null) {
      existingMap.set(item.id, item);
    } else {
      itemsWithoutId.push(item);
    }
  }

  for (const item of itemsToInsert) {
    if (item) {
      if (item.id !== undefined && item.id !== null) {
        existingMap.set(item.id, item); // replaces if exists, adds if not
      } else {
        itemsWithoutId.push(item); // preserve order for items without id
      }
    }
  }

  return [...Array.from(existingMap.values()), ...itemsWithoutId];
}

export const extractDomain = (inputUrl: string): string | null => {
  if (!inputUrl || inputUrl.trim().length === 0) {
    return null;
  }

  const cleanInput = inputUrl.trim();

  // First, try to extract domain using URL parsing
  try {
    // Add protocol if missing for URL parsing
    const normalized = cleanInput.startsWith('http')
      ? cleanInput
      : `https://${cleanInput}`;

    const { hostname } = new URL(normalized);

    // If we successfully parsed and got a hostname that looks like a domain
    if (hostname && hostname.includes('.')) {
      // Basic validation: should have at least one dot and reasonable characters
      const domainRegex = /^[a-zA-Z0-9.-]+$/;
      if (domainRegex.test(hostname)) {
        // Remove leading "www." if present
        return hostname.replace(/^www\./, '');
      }
    }
  } catch (error) {
    // URL parsing failed, continue to fallback logic
  }

  // Fallback: Try to extract domain-like pattern from the text
  // Look for patterns that might be domains (text with dots)
  const domainPattern = /([a-zA-Z0-9.-]+\.[a-zA-Z0-9.-]*[a-zA-Z]+)/;
  const match = cleanInput.match(domainPattern);

  if (match) {
    const potentialDomain = match[1];

    // Basic cleanup: remove trailing dots or special characters
    const cleaned = potentialDomain.replace(/[^\w.-]/g, '').replace(/\.$/, '');

    // Must have at least one dot and reasonable length
    if (cleaned.includes('.') && cleaned.length > 2) {
      // Remove leading "www." if present
      return cleaned.replace(/^www\./, '');
    }
  }

  // If no domain pattern found, return the original text as-is
  // This handles cases like "hola mundo" where no domain extraction is possible
  return cleanInput;
};

export const isWithinLast24Hours = (date: Date): boolean => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = diff / (1000 * 60 * 60); // convert ms → hours
  return hours <= 24 && diff >= 0;
};

export const getExtensionFromFilenameOrMediaType = (
  filename: string,
  mediaType: string,
): string => {
  if (mediaType && mediaType.includes('/')) {
    return mediaType.split('/')[1];
  }
  if (filename && filename.includes('.')) {
    return filename.split('.').pop() || 'png';
  }
  return 'png';
};

export const getContrastingTextColor = (hexColor: string): string => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  return luminance > 128 ? 'black' : 'white';
};

export const capitalizeWords = (name: string): string =>
  name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const getAvatarInitials = (
  name: string | null | undefined,
  maxChars: number = 1,
): string | null => {
  if (!name || maxChars <= 0) return null;

  const parts = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return null;

  // Single word → take first N chars
  if (parts.length === 1) {
    return parts[0].slice(0, maxChars).toUpperCase() || null;
  }

  // Multiple words → take initials, capped by maxChars
  const initials = `${parts[0][0]}${parts[parts.length - 1][0]}`;

  return initials.slice(0, maxChars).toUpperCase() || null;
};

export function parseMessagingLimit(
  limit: string | null,
): number | 'UNLIMITED' | null {
  if (!limit) return null;
  if (
    Object.values(EWhatsAppMessagingLimitTier).includes(
      limit as EWhatsAppMessagingLimitTier,
    )
  ) {
    return WHATSAPP_MESSAGING_LIMITS[limit as EWhatsAppMessagingLimitTier];
  }
  return null;
}

export function parseMetaErrorLogs(metaErrorLogs: string): any[] {
  try {
    const parsed = JSON.parse(metaErrorLogs);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (parsed && typeof parsed === 'object' && parsed.error) {
      // Convierte el objeto en un array con la misma estructura que el formato soportado
      return [
        {
          code: parsed.error.code,
          title: parsed.error.message,
          message: parsed.error.message,
          error_data: parsed.error.error_data,
          href: 'https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes/',
        },
      ];
    }
  } catch (e) {
    // Si falla el parseo, retorna array vacío
  }
  return [];
}

export const getClientActionsAvailability = (
  superClient: ISuperClient,
  userId: string,
  canClaimOthers: boolean,
) => {
  if (!superClient) return { showViewChat: false, showClaim: false };

  const assigned = superClient.temporaryAssignedTo;
  const isMine = assigned?.id === userId;
  const isAI = assigned?.isAiAgent;
  const isOpen = superClient.state === ESuperClientState.OPEN;
  const isClosed = superClient.state === ESuperClientState.CLOSED;

  const showViewChat = isOpen && isMine;

  const showClaim =
    (isOpen && isAI) ||
    (isOpen && !isMine && !isAI && canClaimOthers) ||
    (isClosed && isMine) ||
    (isClosed && !isMine && (isAI || canClaimOthers));

  return { showViewChat, showClaim };
};

export const getSafeInitial = (rawName: unknown): string => {
  // 1. Make sure its a string
  const cleanName = typeof rawName === 'string' ? rawName.trim() : '';

  // 2. return empty
  if (!cleanName) return '?';

  // 3. separate emojis and complex characters
  const symbols = Array.from(cleanName);
  const first = symbols[0];

  //4. check to a letter for uppercase
  if (first && /[A-Za-zÁ-ÿ]/.test(first)) {
    return first.toUpperCase();
  }

  // 5. if num emoji or complex character, return as it is
  return first || '?';
};

export const toUTCISOString = (localDateStr: string) => {
  if (!localDateStr) return localDateStr;
  const [datePart, timePart] = localDateStr.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes).toISOString();
};
