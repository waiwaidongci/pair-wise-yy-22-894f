import { useMemo, useState } from "react";
import type { RestorationPlanDetail } from "../types/RestorationPlanRevision";

// 补正流程守卫：锁住方法/风险评估/版本号、清单未逐条处理时禁止重提与直接批准。
export function usePlanCorrection(detail: RestorationPlanDetail | null) {
  const [acting, setActing] = useState(false);
  return useMemo(() => {
    const plan = detail?.plan ?? null;
    const items = detail?.correction_items ?? [];
    const revisions = detail?.revisions ?? [];
    const openItems = items.filter((item) => item.status === "PENDING");
    const resolvedItems = items.filter((item) => item.status === "RESOLVED");
    const openCount = openItems.length;
    const totalCount = items.length;
    const isPendingCorrection = plan?.approval_status === "PENDING_CORRECTION";
    const isSubmitted = plan?.approval_status === "SUBMITTED";
    const fieldsLocked = isPendingCorrection;
    const allItemsHandled = totalCount > 0 && openCount === 0;
    const canResubmit = isPendingCorrection && allItemsHandled;
    const canApprove = isSubmitted && openCount === 0;
    const latestRevision = revisions.length > 0 ? revisions[revisions.length - 1] : null;
    return {
      plan,
      items,
      openItems,
      resolvedItems,
      openCount,
      totalCount,
      fieldsLocked,
      canResubmit,
      canApprove,
      revisions,
      latestRevision,
      acting,
      setActing
    };
  }, [detail, acting]);
}
