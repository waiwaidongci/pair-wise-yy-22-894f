export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);

export const formatDeadline = (value: string) => {
  if (!value) return "";
  return value.length > 10 ? new Date(value).toLocaleDateString("zh-CN") : value;
};

export const isDeadlineOverdue = (deadline: string, resolvedAt: string | null) => {
  if (!deadline || resolvedAt) return false;
  const due = new Date(`${deadline}T23:59:59`).getTime();
  return Number.isFinite(due) && due < Date.now();
};

export const formatRevisionLabel = (revisionNo: number, versionNo: string) => `第 ${revisionNo} 次修订 · ${versionNo}`;
