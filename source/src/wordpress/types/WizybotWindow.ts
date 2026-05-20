export interface IWizybot {
  // General shop
  appUUID: string;
  shopDomain?: string;
  shopMainDomain?: string;
  shopName?: string;
  shopEmail?: string;
  shopToken?: string;
  isAlreadyInstalled?: boolean;

  // Wordpress
  siteUrl?: string;
  hasWooCommerce?: boolean;
  wooCommerceSuccess?: boolean;
  nonce?: string;
  apiUrl?: string;
  userId?: string;
  isSuperAdmin?: boolean;
  stage?: string;
  ngrokUrl?: string;
  wordpressUrl?: string;
  wizyCartId?: string;
  wizyCartItems?: { id: number; variationId: number; name: string; quantity: number; price: string; image?: string }[];
  checkoutUrl?: string;

  // Widget
  globalSelectedBackend?: string;
  chatProfileImage?: string;
  curvyBorderImage?: string;
  wizyLogoImage?: string;
  noImageImage?: string;
  widgetLoader?: string;
  stylesPathOutter?: string;
  stylesPathInner?: string;
  shopifyRootPath?: string;
  shopifyCurrentPath?: string;
  isShopifyForeing?: string;
  marketId?: string;
  languageCode?: string;
  languageUrl?: string;
}

declare global {
  interface Window {
    wizybot: IWizybot;
  }
}
