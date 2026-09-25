export const RevisionReason = ["CREATE","RESUBMIT"] as const;
export type RevisionReason = (typeof RevisionReason)[number];
