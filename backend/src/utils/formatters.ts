export const toAuditTarget = (type: string, id: string | number) => `${type}#${id}`;

export const bumpVersionNo = (revisionNo: number) => `V${revisionNo}.0`;
