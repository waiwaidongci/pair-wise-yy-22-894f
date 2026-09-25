export const CorrectionItemStatus = ["OPEN","RESOLVED"] as const;
export type CorrectionItemStatus = (typeof CorrectionItemStatus)[number];
export const CorrectionItemStatusText: Record<CorrectionItemStatus, string> = {
  OPEN: "待处理",
  RESOLVED: "已处理"
};
