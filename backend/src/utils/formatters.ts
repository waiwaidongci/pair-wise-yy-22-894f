export const toAuditTarget = (type: string, id: string | number) => `${type}#${id}`;
export const formatRevisionLabel = (revisionNo: number) => `R${revisionNo}`;
export const nextVersionNo = (versionNo: string) => {
  const match = /^V(\d+)\.(\d+)$/i.exec(versionNo.trim());
  if (!match) return `${versionNo}.1`;
  return `V${match[1]}.${Number(match[2]) + 1}`;
};
