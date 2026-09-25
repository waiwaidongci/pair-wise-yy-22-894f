import { PlanApprovalStatusText } from "../constants/PlanApprovalStatus";

export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => (PlanApprovalStatusText as Record<string, string>)[value] ?? value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
export const formatRevision = (revisionNo: number) => `R${revisionNo}`;
export const formatDeadline = (value: string) => new Date(value).toLocaleDateString("zh-CN");
export const nextVersionNo = (versionNo: string) => {
  const match = /^V(\d+)\.(\d+)$/i.exec(versionNo.trim());
  if (!match) return `${versionNo}.1`;
  return `V${match[1]}.${Number(match[2]) + 1}`;
};
