export type CorrectionItemInput = { requirement: string; deadline: string };
export type ReturnForCorrectionPayload = { items: CorrectionItemInput[] };
export type ResolveCorrectionItemPayload = { resolution_note: string };
