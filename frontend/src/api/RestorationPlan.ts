import type { RestorationPlan } from "../types/RestorationPlan";
import type { PlanCorrectionItem } from "../types/PlanCorrectionItem";
import { ERROR_CODES, type ErrorCode } from "../constants/errorCodes";
import { localPlanWorkflow, WorkflowError } from "../mocks/localPlanWorkflow";
import type { Actor, CorrectionItemInput, PlanDetail, ResubmitPayload } from "../mocks/localPlanWorkflow";

const endpoint = "/api/restoration-plan";

const headersOf = (actor: Actor) => ({
  "Content-Type": "application/json",
  "x-user-id": String(actor.id),
  "x-role": actor.role
});

async function request<T>(path: string, init: RequestInit, actor: Actor, fallback: () => T): Promise<T> {
  try {
    const res = await fetch(`${endpoint}${path}`, { ...init, headers: headersOf(actor) });
    if (res.ok) return (await res.json()) as T;
    const body = (await res.json().catch(() => null)) as { code?: string } | null;
    const code = body?.code as ErrorCode | undefined;
    if (code && code in ERROR_CODES) throw new WorkflowError(code);
    throw new Error(`unexpected status ${res.status}`);
  } catch (err) {
    if (err instanceof WorkflowError) throw err;
    // Local mock fallback keeps the UI available during offline review.
    return fallback();
  }
}

export async function listRestorationPlan(actor: Actor = { id: 1, role: "admin" }): Promise<RestorationPlan[]> {
  return request("", { method: "GET" }, actor, () => localPlanWorkflow.list());
}

export async function getRestorationPlanDetail(planId: number, actor: Actor): Promise<PlanDetail> {
  return request(`/${planId}`, { method: "GET" }, actor, () => localPlanWorkflow.detail(planId));
}

export async function returnPlanForCorrection(planId: number, items: CorrectionItemInput[], actor: Actor): Promise<PlanDetail> {
  return request(`/${planId}/return`, { method: "POST", body: JSON.stringify({ items }) }, actor, () =>
    localPlanWorkflow.returnForCorrection(planId, items, actor)
  );
}

export async function resolveCorrectionItem(planId: number, itemId: number, resolutionNote: string, actor: Actor): Promise<PlanCorrectionItem> {
  return request(`/${planId}/corrections/${itemId}/resolve`, { method: "POST", body: JSON.stringify({ resolution_note: resolutionNote }) }, actor, () =>
    localPlanWorkflow.resolveItem(planId, itemId, resolutionNote, actor)
  );
}

export async function resubmitRestorationPlan(planId: number, payload: ResubmitPayload, actor: Actor): Promise<PlanDetail> {
  return request(`/${planId}/resubmit`, { method: "POST", body: JSON.stringify(payload) }, actor, () =>
    localPlanWorkflow.resubmit(planId, payload, actor)
  );
}

export async function approveRestorationPlan(planId: number, actor: Actor): Promise<RestorationPlan> {
  return request(`/${planId}/approve`, { method: "POST", body: JSON.stringify({}) }, actor, () =>
    localPlanWorkflow.approve(planId, actor)
  );
}
