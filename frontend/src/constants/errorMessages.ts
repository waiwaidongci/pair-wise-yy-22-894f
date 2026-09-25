export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  PLAN_NOT_FOUND: "修复方案不存在",
  INVALID_PLAN_STATUS: "当前审批状态不允许执行该操作",
  PLAN_LOCKED: "方案已退回待补正，方法、风险评估和版本号已锁定，需重新提交后生成新修订",
  PLAN_PENDING_CORRECTION: "方案处于退回待补正状态，不能直接批准，须完成补正并重新提交",
  CORRECTION_ITEMS_REQUIRED: "退回补正时至少填写一条补正要求和期限",
  CORRECTION_ITEMS_UNRESOLVED: "补正清单尚未逐条处理，不能重新提交",
  CORRECTION_ITEM_NOT_FOUND: "补正条目不存在或不属于当前修订",
  NOT_PLAN_OWNER: "只有当前责任人可以处理补正条目"
};
