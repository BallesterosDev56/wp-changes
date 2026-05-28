export type IProduct = {
    id: string;
    displayTitle: string;
    embeddingText: string;
    url: string;
    shopifyProductId: string;
    imageUrl: string;
    productType: string;
    discount: boolean;
    variants: string;
    price: string;
    selected?: boolean;
  };

export type IProductVariant = {
    productId: string;
    id: string;
    displayTitle: string;
    imageUrl: string;
  };
