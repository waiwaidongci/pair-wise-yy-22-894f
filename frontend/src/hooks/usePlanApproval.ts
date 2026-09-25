import { useMemo } from "react";
import type { RestorationPlan } from "../types/RestorationPlan";
import type { PlanCorrectionItem } from "../types/PlanCorrectionItem";
import { ERROR_MESSAGES } from "../constants/errorMessages";

export function usePlanApproval(plan: RestorationPlan | null, corrections: PlanCorrectionItem[], actorId: number) {
  return useMemo(() => {
    const currentItems = plan ? corrections.filter((item) => item.revision_no === plan.revision_no) : [];
    const openItems = currentItems.filter((item) => item.status === "OPEN");
    const historyItems = plan ? corrections.filter((item) => item.revision_no !== plan.revision_no) : [];
    const isReturned = plan?.approval_status === "RETURNED";
    const isSubmitted = plan?.approval_status === "SUBMITTED";
    const isOwner = !!plan && plan.owner_id === actorId;
    const allResolved = currentItems.length > 0 && openItems.length === 0;

    const canResubmit = isReturned && isOwner && allResolved;
    const resubmitBlockReason = !isReturned
      ? null
      : !isOwner
        ? ERROR_MESSAGES.NOT_PLAN_OWNER
        : !allResolved
          ? ERROR_MESSAGES.CORRECTION_ITEMS_UNRESOLVED
          : null;

    const canApprove = isSubmitted;
    const approveBlockReason = isReturned
      ? ERROR_MESSAGES.PLAN_PENDING_CORRECTION
      : !isSubmitted
        ? ERROR_MESSAGES.INVALID_PLAN_STATUS
        : null;

    return {
      currentItems,
      openItems,
      historyItems,
      isReturned,
      isSubmitted,
      isOwner,
      allResolved,
      canResubmit,
      resubmitBlockReason,
      canApprove,
      approveBlockReason
    };
  }, [plan, corrections, actorId]);
}
