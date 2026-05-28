import {
  EMessageRole,
  EMessageSourceTypes,
  EMessageStatus,
  IMessage,
  IMessageBackend,
} from '../../types/MessageType';
import {
  ESourceStatus,
  IInstagramAccount,
  IMessengerAccount,
  IWhatsAppAccount,
  IWhatsAppSessionAccount,
} from '../../types/MetaTypes';

export type ISource = {
  sourceType: EMessageSourceTypes;
  sourceId: string | null;
  sourceTitle: string;
  status: ESourceStatus;
  filter: boolean;
  originalWhatsAppAccount?: IWhatsAppAccount;
  onlyMonitoring?: boolean;
};
export type IConversation = {
  messages: IMessage[];
  sourceType: EMessageSourceTypes;
  sourceId: string;
  clientId: string;
  superClientId: string;
  selected: boolean;
  status: ESourceStatus;
  hasNextPage?: boolean;
};
