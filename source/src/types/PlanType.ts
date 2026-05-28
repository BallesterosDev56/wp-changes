export type IPlan = {
  id: string;
  name: string;
  messagesPerMonth: number;
  monthlyPrice: number;
  additionalMessagePrice: number;
  commentsPerMonth: number;
  additionalCommentPrice: number;
  showcaseText: string;
  isCustom: boolean;
  isAnnual: boolean;
  enforcedCost: number | null;
  enforceFromPlanName: string | null;
  enforceToPlanName: string | null;
};

export enum EStandardPlansName {
  FREE = "free",
  FROZEN = "frozen",
  PAYG = "payg",
  STARTER = "starter",
  BASIC = "basic",
  BASIC_04_2026 = "basic_04_2026",
  PLUS = "plus",
  ADVANCED = "advanced",
}

export const emptyPlan: IPlan = {
  id: "",
  name: "",
  messagesPerMonth: 0,
  monthlyPrice: 0,
  additionalMessagePrice: 0,
  commentsPerMonth: 0,
  additionalCommentPrice: 0,
  showcaseText: "",
  isCustom: false,
  isAnnual: false,
  enforcedCost: null,
  enforceFromPlanName: null,
  enforceToPlanName: null,
};
