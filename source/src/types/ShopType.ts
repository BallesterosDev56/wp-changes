// Shop

import { IDomain } from "./DomainType";
import { IPlan, emptyPlan } from "./PlanType";
import { ISetup } from "./SetupType";

export enum EShopStatus {
  installed = "installled",
  uninstalled = "uninstalled",
}

export enum SHOP_PLATFORM {
  SHOPIFY = "SHOPIFY",
  WORDPRESS = "WORDPRESS",
}

export type IShop = {
  id: string;
  domain: string;
  shopName: string;
  shopMainDomain: string;
  needsSetup: boolean;
  needsSync: boolean;
  needsTest: boolean;
  needsOnboarding: boolean;
  status: EShopStatus;
  currentPlan: IPlan;
  customOfferPlan?: IPlan;
  upgradeRequestPlan?: IPlan;
  enforcedPlan?: IPlan;
  createDate: string;
  shopCurrency: string;
  setup?: ISetup;
  selected?: boolean;
  isWidgetInstalled?: boolean;
  isChargeable?: boolean;
  storeMessageEmbeddings?: boolean;
  parentShopId?: string;
  lastSyncDate?: string | null;
  receiveWebhooks?: boolean;
  webhooksDdosDate: string | null;
  currentOutboundEmailAddress?: string;
  outboundEmailAddress?: string;
  domains?: IDomain[];
  platform: SHOP_PLATFORM;
  vtexAccessToken?: string;
};

export const emptyIShop: IShop = {
  id: "",
  domain: "",
  needsSetup: true,
  needsSync: true,
  needsTest: true,
  needsOnboarding: true,
  status: EShopStatus.installed,
  currentPlan: emptyPlan,
  createDate: "",
  shopCurrency: "USD",
  shopName: "",
  shopMainDomain: "",
  lastSyncDate: null,
  receiveWebhooks: true,
  webhooksDdosDate: null,
  currentOutboundEmailAddress: undefined,
  outboundEmailAddress: undefined,
  domains: [],
  platform: SHOP_PLATFORM.SHOPIFY,
};

export interface IGlobalAuth {
  role: string;
  permissions: any[];
}
