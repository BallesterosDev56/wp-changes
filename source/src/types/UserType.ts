// User
import {
  IPageCursorMeta,
  IPageMeta,
} from "../components/core/pagination/Pagination";
import { ISuperClient, ISuperClientFromList } from "./ClientType";
import { IDepartmentUserRecordWithDepartment } from "./DepartmentType";
import { IEmailAccount } from "./EmailAccountType";
import { IMessage } from "./MessageType";
import { IShop } from "./ShopType";
import { IRole } from "./AuthorizationType";

export enum EGender {
  none = "none",
  female = "female",
  male = "male",
}

export type IUserShopRoleRecord = {
  id: string;
  shop: IShop; // O el tipo que uses para ShopDto
  role: IRole;
  createDate: string;
  updateDate: string;
};

export type IUser = {
  id: string;
  name: string | null;
  email: string;
  isFirstTime: boolean;
  isActiveUser: boolean;
  relatedShops?: IShop[] | null;
  createDate: string;
  selected?: boolean;
  isAiAgent?: boolean;
  isSuperAdminUser: boolean;
  isRootUser: boolean;
  departmentUserRecords?: IDepartmentUserRecordWithDepartment[];
  userShopRoleRecords?: IUserShopRoleRecord[];
};

export interface IUserOfMessage
  extends Pick<IUser, "id" | "name" | "email"> {}

export enum PAYMENT_PARSE_STATUS {
  SUCCESS = 'SUCCESS',
  PARSE_FAILED = 'PARSE_FAILED',
}

export enum PAYMENT_EMAIL_REGISTER_STATUS {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

export enum PAYMENT_SENDER_TYPE {
  BANCOLOMBIA = 'BANCOLOMBIA',
  NEQUI = 'NEQUI',
  BBVA = 'BBVA',
}

export interface IPaymentEmailRegister {
  id: string;
  senderType: PAYMENT_SENDER_TYPE;
  amount: string | null;
  currency: string;
  senderName: string | null;
  destinationAccountLast4: string | null;
  transactionDate: Date | string | null;
  parseStatus: PAYMENT_PARSE_STATUS;
  rawBody: string | null;
  status: PAYMENT_EMAIL_REGISTER_STATUS;
  account: IEmailAccount; // Asumiendo que tienes una interfaz IEmailAccount
  shop: IShop; // Asumiendo que tienes una interfaz IShop
  createDate: Date | string;
  updateDate: Date | string;
  message: IMessage | null; // Asumiendo que tienes una interfaz IMessage
}
export const emptyIUser: IUser = {
  id: "",
  name: null,
  email: "",
  isFirstTime: false,
  isActiveUser: true,
  createDate: "string",
  isAiAgent: false,
  isSuperAdminUser: false,
  isRootUser: false,
};

export interface IUserWithSuperClients extends IUser {
  pageCursorDto: { data: ISuperClient[]; meta: IPageCursorMeta };
  assignedCount: number;
}

export interface IUserWithSuperClientsFromList extends IUser {
  superClientsList: ISuperClientFromList[];
  isFetching: boolean;
  pageCursorMeta: IPageCursorMeta;
  assignedCount: number;
}

export interface IUserFromList extends IUser {
  selected: boolean;
}

export type IUserFilter = {
  text: string,
  email: string,
  domain: string,
  isActive: boolean,
  isInactive: boolean,
  isFirstTime: boolean,
  isNotFirstTime: boolean,
  initialDate: string,
  finalDate: string,
  roleIds: string[],
}

export const emptyUserFilter: IUserFilter = {
  text: "",
  email: "",
  domain: "",
  isActive: true,
  isInactive: true,
  isFirstTime: true,
  isNotFirstTime: true,
  initialDate: "",
  finalDate: "",
  roleIds: [],
};
