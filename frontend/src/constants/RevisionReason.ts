export const RevisionReason = ["CREATE","RESUBMIT"] as const;
export type RevisionReason = (typeof RevisionReason)[number];
export const RevisionReasonText: Record<RevisionReason, string> = {
  CREATE: "编制",
  RESUBMIT: "补正重提"
};
