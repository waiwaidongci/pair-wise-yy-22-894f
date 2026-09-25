export const CorrectionItemStatus = ["OPEN","RESOLVED"] as const;
export type CorrectionItemStatus = (typeof CorrectionItemStatus)[number];
