// EXTRA UI COMPONENTS

import { EMainLanguage } from '../components/WidgetTypes';

export enum EExtraUIComponentTypes {
  ADD_TO_CART = 'Add to cart',
  ADD_TO_CART_WITH_SUBSCRIPTIONS = 'Add to cart with subscriptions',
  RECOMMENDATION_CAROUSEL = 'Recommendation carousel',
  PRODUCT_CARD = 'Product card',
}

export enum ENewExtraUIComponentTypes {
  RECOMMENDATION_CAROUSEL = 'RecommendationCarousel',
  ADD_TO_CART = 'AddToCart',
  ADD_TO_CART_WITH_SUBSCRIPTIONS = 'AddToCartWithSubscriptions',
  PRODUCT_CARD = 'ProductCard',
  PRODUCT_CART = 'ProductCartExtraUIComponentDiscriminator',
  ADD_MEDIA = 'AddMedia',
}

export type IExtraUIComponent =
  | IRecommendationCarouselExtraUIComponent
  | IAddToCartExtraUIComponent
  | IAddToCartWithSubscriptionsExtraUIComponent
  | IProductCardExtraUIComponent;

export type INewExtraUIComponent =
  | INewRecommendationCarouselExtraUIComponent
  | INewAddToCartExtraUIComponent
  | INewAddToCartWithSubscriptionsExtraUIComponent
  | INewProductCardExtraUIComponent
  | INewClientProductCartExtraUIComponent
  | INewAddMediaExtraUIComponent;

// Recommendation Carousel

export interface IRecommendationCarouselExtraUIComponent {
  type: EExtraUIComponentTypes.RECOMMENDATION_CAROUSEL;
  content: IRecommendationCarouselContent | IOldRecommendationCarouselContent;
}

export interface INewRecommendationCarouselExtraUIComponent {
  type: ENewExtraUIComponentTypes;
  cards: ICarouselCard[];
}

export interface IOldRecommendationCarouselContent {
  recommendations: {
    title: string;
    price: string;
    imageUrl: string;
    redirectUrl: string;
  }[];
}

export type ICarouselCard = {
  cardType: string;
  title: string;
  price?: string;
  imageUrls: string[];
  redirectUrl: string;
};

export interface IProductCard {
  type: 'product';
  title: string;
  price: string;
  imageUrl: string;
  redirectUrl: string;
}

export interface ICollectionCard {
  type: 'collection';
  title: string;
  imageUrls: string[];
  redirectUrl: string;
}

export interface IRecommendationCarouselContent {
  cards: (IProductCard | ICollectionCard)[];
}

// Add to cart

export interface IAddToCartExtraUIComponent {
  type: EExtraUIComponentTypes.ADD_TO_CART;
  content: IAddToCartContent;
}

export interface INewAddToCartExtraUIComponent {
  type: ENewExtraUIComponentTypes;
  title: string;
  productId: string;
  productUrl: string;
  imageUrl: string;
  imageAltText: string;
  options: { name: string; values: string[] }[];
  infoArray: any;
  stateAction: EAddToCartStateActions;
  stateSelection: any;
}

export enum EAddToCartStateActions {
  NONE = 'none',
  BOUGHT = 'bought',
  ADDED_TO_CART = 'addedtocart',
}

export type IAddToCartContent = {
  title: string;
  productId: string;
  productUrl: string;
  imageUrl: string;
  imageAltText: string;
  options: { name: string; values: string[] }[];
  infoArray: any;
  stateAction: EAddToCartStateActions;
  stateSelection: any;
};

// Add to cart with  subscriptions

export interface IAddToCartWithSubscriptionsExtraUIComponent {
  type: EExtraUIComponentTypes.ADD_TO_CART_WITH_SUBSCRIPTIONS;
  content: IAddToCartWithSubscriptionsContent;
}

export interface IAddToCartWithSubscriptionsContent {
  title: string;
  productId: string;
  productUrl: string;
  imageUrl: string;
  imageAltText: string;
  options: { name: string; values: string[] }[];
  infoArray: any;
  stateAction: EAddToCartStateActions;
  stateSelection: any;
}

export interface INewAddToCartWithSubscriptionsExtraUIComponent {
  type: ENewExtraUIComponentTypes;
  title: string;
  productId: string;
  productUrl: string;
  imageUrl: string;
  imageAltText: string;
  options: { name: string; values: string[] }[];
  infoArray: any;
  stateAction: EAddToCartStateActions;
  stateSelection: any;
}

export interface IProductCardExtraUIComponent {
  type: EExtraUIComponentTypes.PRODUCT_CARD;
  content: IProductCardContent;
}

export enum INewProductCardTypeExtraUIComponent {
  PRODUCT = 'product',
  VARIANT = 'variant',
}
export interface INewProductCardExtraUIComponent {
  type: ENewExtraUIComponentTypes.PRODUCT_CARD;
  cardType: INewProductCardTypeExtraUIComponent;
  variantTitle?: string;
  title: string;
  productId: string;
  productUrl: string;
  imageUrl: string;
  redirectUrl: string;
  stock: number;
  price: string;
}

export interface IProductCardContent {
  variantTitle?: string;
  title: string;
  productId: string;
  productUrl: string;
  imageUrl: string;
  redirectUrl: string;
  stock?: number;
  price: string;
}

export interface IClientProductCartItem {
  shopifyVariantId: string;
  displayName: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
}
export interface INewClientProductCartExtraUIComponent {
  type: ENewExtraUIComponentTypes.PRODUCT_CART;
  clientId: string;
  cartUrl: string;
  buyNowUrl: string;
  total: number;
  currencyCode: string;
  items: IClientProductCartItem[];
  isDraftOrder?: boolean;
  appliedDiscount?: {
    value: number;
    valueType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  };
}

// Add Media

export enum EAddMediaStateActions {
  NONE = 'none',
  UPLOADED = 'uploaded',
}

export interface IMediaItem {
  mediaId: string;
  mediaType: string;
  filename: string;
}

export interface INewAddMediaExtraUIComponent {
  type: ENewExtraUIComponentTypes.ADD_MEDIA;
  messageId?: string;
  title: string;
  minFiles: number;
  maxFiles: number;
  acceptedTypes: string[];
  description?: string;
  stateAction?: EAddMediaStateActions;
  uploadedMedia?: IMediaItem[];
}

export function isExtraUIComponentType<T extends INewExtraUIComponent>(
  component: INewExtraUIComponent,
  type: ENewExtraUIComponentTypes,
): component is T {
  return component.type === type;
}

export function getNewExtraUIComponentTitle(
  extraUIComponent: INewExtraUIComponent,
  language: string,
) {
  if (
    isExtraUIComponentType<INewProductCardExtraUIComponent>(
      extraUIComponent,
      ENewExtraUIComponentTypes.PRODUCT_CARD,
    )
  ) {
    return extraUIComponent.title;
  } else if (
    isExtraUIComponentType<INewClientProductCartExtraUIComponent>(
      extraUIComponent,
      ENewExtraUIComponentTypes.PRODUCT_CART,
    )
  ) {
    const titles: { [key: string]: string } = {
      [EMainLanguage.ENGLISH]: 'Cart',
      [EMainLanguage.SPANISH]: 'Carrito',
      [EMainLanguage.PORTUGUESE]: 'Carrinho',
      [EMainLanguage.FRENCH]: 'Panier',
      [EMainLanguage.GERMAN]: 'Wagen',
      [EMainLanguage.ITALIAN]: 'Carrello',
    };
    return titles[language] || 'Cart';
  } else if (
    isExtraUIComponentType<INewAddToCartExtraUIComponent>(
      extraUIComponent,
      ENewExtraUIComponentTypes.ADD_TO_CART,
    )
  ) {
    return extraUIComponent.title;
  } else if (
    isExtraUIComponentType<INewAddToCartWithSubscriptionsExtraUIComponent>(
      extraUIComponent,
      ENewExtraUIComponentTypes.ADD_TO_CART_WITH_SUBSCRIPTIONS,
    )
  ) {
    return extraUIComponent.title;
  } else if (
    isExtraUIComponentType<INewRecommendationCarouselExtraUIComponent>(
      extraUIComponent,
      ENewExtraUIComponentTypes.RECOMMENDATION_CAROUSEL,
    )
  ) {
    return extraUIComponent.cards[0].title;
  } else if (
    isExtraUIComponentType<INewAddMediaExtraUIComponent>(
      extraUIComponent,
      ENewExtraUIComponentTypes.ADD_MEDIA,
    )
  ) {
    return extraUIComponent.title;
  } else {
    const unknownTitles: { [key: string]: string } = {
      [EMainLanguage.ENGLISH]: 'Unknown component',
      [EMainLanguage.SPANISH]: 'Componente desconocido',
      [EMainLanguage.PORTUGUESE]: 'Componente desconhecido',
      [EMainLanguage.FRENCH]: 'Composant inconnu',
      [EMainLanguage.GERMAN]: 'Unbekannte Komponente',
      [EMainLanguage.ITALIAN]: 'Componente sconosciuto',
    };
    return unknownTitles[language] || 'Unknown component';
  }
}
