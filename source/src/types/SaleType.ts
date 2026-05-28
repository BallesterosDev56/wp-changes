export type ISale = {
  id: string;
  isSale: boolean;
  isApproved: boolean | null;
  approvalDate: string;
  orderNumber: string;
  price?: number
};

export interface ISaleWithClientId extends ISale {
  client: { id: string };
}
