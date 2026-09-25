export const PLAN_ASSIGNEE_TEXT: Record<number, string> = {
  1: "修复师 · 周一（负责人）",
  2: "专家 · 沈审（审批人）",
  3: "修复师 · 王绣（负责人）"
};

export const formatAssignee = (id: number | null | undefined) =>
  id == null ? "待指派" : PLAN_ASSIGNEE_TEXT[id] ?? `用户 #${id}`;
