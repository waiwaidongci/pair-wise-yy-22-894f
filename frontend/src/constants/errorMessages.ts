export const ERROR_MESSAGES: Record<string, string> = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  PLAN_NOT_FOUND: "修复方案不存在或已被删除",
  CORRECTION_ITEM_NOT_FOUND: "补正条目不存在",
  INVALID_PLAN_STATUS: "当前方案状态不允许执行该操作",
  PLAN_FIELDS_LOCKED: "方案待补正期间，修复方法、风险评估和版本号已锁定，不可修改",
  CORRECTION_ITEMS_OPEN: "补正清单尚未逐条处理完成，不能重提，也不能直接批准",
  CORRECTION_REQUIREMENT_MISSING: "每条补正要求都必须填写具体内容",
  CORRECTION_DEADLINE_MISSING: "每条补正要求都必须填写补正期限",
  CORRECTION_RESOLUTION_MISSING: "请先填写该条目的处理说明"
};
