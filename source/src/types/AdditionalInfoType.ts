import { ITagOption } from "../components/KnowledgeMedia";

export type IAdditionalInfo = {
  id: string;
  type: ADDITIONAL_INFO_TYPE;
  createDate: string;
  description: string;
  associatedEntityId: string;
  selected: boolean;
  tags: IAdditionalInfoTag[];
  initialDate?: string;
  finalDate?: string;
};

export enum ADDITIONAL_INFO_TYPE {
  GENERALADDON = "generaladdon",
  VISUALADDON = "visualaddon",
  PRODUCTADDON = "productaddon",
  PRODUCTALIAS = "productalias",
  SPECIALIZEDRECOMMENDATION = "specializedrecommendation",
}

export enum ADDITIONAL_INFO_MECHANISM {
  ONETIME = "onetime",
  BULK = "bulk",
}

export type IAdditionalInfoTag = { id: string; title: string };

export enum ADDITIONAL_INFO_RECOMMENDATION_TYPE {
  DIRECT = "direct",
  FLOW = "flow",
}

export enum ADDITIONAL_INFO_PRODUCTADDON_TYPE {
  DETAILS = "details",
  ALIAS = "alias",
}

export enum SEMANTICAL_TRIGGERS_TYPE {
  SPECIALIZED_RECOMMENDATION = "specializedrecommendation",
  PRODUCT_ALIAS = "productalias",
  GENERAL_ADDON = "generaladdon",
  VISUAL_ADDON = "visualaddon",
}

export enum RECOMMENDATION_FLOW_NODE_RESPONSE_RECOMMENDATION_TYPES {
  PRODUCT = "product",
  PRODUCTVARIANT = "productvariant",
  COLLECTION = "collection",
  COLLECTIONPRODUCTS = "collectionproducts",
  FILTER = "filter",
}

export interface RecommendationFlowRecommendation {
  type?: string;
  label: string;
  id: string;
}
export interface RecommendationFlowResponse {
  response?: string;
  makeInference: boolean;
  recommendations?: RecommendationFlowRecommendation[];
  refersToNode?: RecommendationFlowNode;
  additionalConsiderations?: string;
  recommendOutOfStockProducts: boolean;
  recommendDraftProducts: boolean;
}

export interface RecommendationFlowQuestion {
  question?: string;
  responses: RecommendationFlowResponse[];
  shopifyFilterId?: string;
  directRecommendations?: boolean;
}

export interface RecommendationFlowNode {
  questions: RecommendationFlowQuestion[];
}

export interface RecommendationFlow {
  rootNode: RecommendationFlowNode;
  shopId?: string;
}

export enum RECOMMENDATION_FLOW_TYPES {
  DIRECT = "direct",
  FLOW = "flow",
}

export type ISpecializedrecommendation = {
  semanticalTriggers: { semanticActivator: string }[];
  recommendationFlow: RecommendationFlow;
  additionalInfoTag?: string;
  initialDate?: string;
  finalDate?: string;
  imageList: ITagOption[];
};
