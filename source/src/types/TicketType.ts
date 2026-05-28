// Ticket

import { IClientBackend } from "./ClientType";

export type ITicket = {
  id: string;
  name: string;
  email: string;
  createDate: string;
  state: boolean;
  description: string;
  isScaled: boolean;
  departments: ITicketDepartment[];
  status: ITicketStatus;
  tags: ITicketTag[];
  selected: boolean;
  client?: IClientBackend;
  hubspotId: string | null;
  additionalFields?: ITicketAdditionalFieldsRegister | null;
};

export interface ITicketDepartment {
  id: string;
  name: string;
  description: string;
}

export type ITicketStatus = {
  id: string;
  name: string;
  isStartingStatus: boolean;
  isClosingStatus: boolean;
  isIntermediateStatus: boolean;
};

export type ITicketTag = {
  id: string;
  name: string;
  color: string;
  description: string;
};

export interface ITicketReadFlag extends ITicket {
  isShopRead: boolean;
}

// TICKET ADDITIONAL FIELDS DEFINITION

export type ITicketAdditionalFieldsDefinition = {
  id: string;
  fields: ITicketAdditionalFieldDefinition[];
};

export const emptyITicketAdditionalFieldsDefinition: ITicketAdditionalFieldsDefinition =
  { id: "", fields: [] };

export enum TICKET_ADDITIONAL_FIELD_TYPES {
  STRING = "STRING",
  NUMBER = "NUMBER",
  DATE = "DATE",
  SELECT = "SELECT",
  PRODUCTS = "PRODUCTS",
  ORDERS = "ORDERS",
}

export type ITicketAdditionalFieldDefinitionBase = {
  type: TICKET_ADDITIONAL_FIELD_TYPES;
  name: string;
  order: number;
};

export interface IStringTicketAdditionalFieldDefinition
  extends ITicketAdditionalFieldDefinitionBase {
  type: TICKET_ADDITIONAL_FIELD_TYPES.STRING;
}
export interface INumberTicketAdditionalFieldDefinition
  extends ITicketAdditionalFieldDefinitionBase {
  type: TICKET_ADDITIONAL_FIELD_TYPES.NUMBER;
}
export interface IDateTicketAdditionalFieldDefinition
  extends ITicketAdditionalFieldDefinitionBase {
  type: TICKET_ADDITIONAL_FIELD_TYPES.DATE;
}
export interface IProductTicketAdditionalFieldDefinition
  extends ITicketAdditionalFieldDefinitionBase {
  type: TICKET_ADDITIONAL_FIELD_TYPES.PRODUCTS;
}
export interface IOrdersTicketAdditionalFieldDefinition
  extends ITicketAdditionalFieldDefinitionBase {
  type: TICKET_ADDITIONAL_FIELD_TYPES.ORDERS;
}
export interface ISelectTicketAdditionalFieldDefinition
  extends ITicketAdditionalFieldDefinitionBase {
  type: TICKET_ADDITIONAL_FIELD_TYPES.SELECT;
  options: string[];
}

export type ITicketAdditionalFieldDefinition =
  | IStringTicketAdditionalFieldDefinition
  | INumberTicketAdditionalFieldDefinition
  | IDateTicketAdditionalFieldDefinition
  | IProductTicketAdditionalFieldDefinition
  | IOrdersTicketAdditionalFieldDefinition
  | ISelectTicketAdditionalFieldDefinition;

// TICKET ADDITIONAL FIELDS REGISTER

export type ITicketAdditionalFieldsRegister = {
  id: string;
  fields: ITicketAdditionalFieldRegister[];
};

export const emptyITicketAdditionalFieldsRegister: ITicketAdditionalFieldsRegister =
  { id: "", fields: [] };

export type ITicketAdditionalFieldRegisterBase = {
  type: TICKET_ADDITIONAL_FIELD_TYPES;
  name: string;
};

export interface IStringTicketAdditionalFieldRegister
  extends ITicketAdditionalFieldRegisterBase {
  type: TICKET_ADDITIONAL_FIELD_TYPES.STRING;
  value: string;
}
export interface INumberTicketAdditionalFieldRegister
  extends ITicketAdditionalFieldRegisterBase {
  type: TICKET_ADDITIONAL_FIELD_TYPES.NUMBER;
  value: number;
}
export interface IDateTicketAdditionalFieldRegister
  extends ITicketAdditionalFieldRegisterBase {
  type: TICKET_ADDITIONAL_FIELD_TYPES.DATE;
  value: Date;
}
export interface IProductTicketAdditionalFieldRegister
  extends ITicketAdditionalFieldRegisterBase {
  type: TICKET_ADDITIONAL_FIELD_TYPES.PRODUCTS;
  value: { id: string; name: string }[];
}
export interface IOrdersTicketAdditionalFieldRegister
  extends ITicketAdditionalFieldRegisterBase {
  type: TICKET_ADDITIONAL_FIELD_TYPES.ORDERS;
  value: { id: string; name: string }[];
}
export interface ISelectTicketAdditionalFieldRegister
  extends ITicketAdditionalFieldRegisterBase {
  type: TICKET_ADDITIONAL_FIELD_TYPES.SELECT;
  value: string;
}

export type ITicketAdditionalFieldRegister =
  | IStringTicketAdditionalFieldRegister
  | INumberTicketAdditionalFieldRegister
  | IDateTicketAdditionalFieldRegister
  | IProductTicketAdditionalFieldRegister
  | ISelectTicketAdditionalFieldRegister
  | IOrdersTicketAdditionalFieldRegister;
