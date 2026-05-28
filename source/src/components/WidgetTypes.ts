export enum EMainLanguage {
  SPANISH = 'Spanish',
  ENGLISH = 'English',
  PORTUGUESE = 'Portuguese',
  FRENCH = 'French',
  GERMAN = 'German',
  ITALIAN = 'Italian',
}

export type ICart = {
  totalPrice: number;
  currency: string;
  items: ICartItem[];
};

export type ICartItem = {
  id: number;
  quantity: number;
  productTitle: string;
  variantTitle: string;
  linePrice: number;
  image: string;
  url: string;
};
