import { mockData } from "../mocks/seedData";
import { planWorkflowMock, type MockHttpError } from "../mocks/planWorkflowMock";
import type { RestorationPlan } from "../types/RestorationPlan";
import type { RestorationPlanDetail } from "../types/RestorationPlanRevision";

const endpoint = "/api/restoration-plan";

export interface CurrentUser {
  id: number;
  role: string;
}

let currentUser: CurrentUser = { id: 2, role: "EXPERT" };

export const setCurrentUser = (user: CurrentUser) => {
  currentUser = user;
};

export const getCurrentUser = () => currentUser;

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  let res: Response;
  try {
    res = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-user-id": String(currentUser.id),
        "x-role": currentUser.role,
        ...(options.headers ?? {})
      }
    });
  } catch {
    throw new ApiError(0, "OFFLINE", "后端不可达，请先启动 backend 服务");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.code ?? "INTERNAL_ERROR", body?.message ?? `请求失败 (${res.status})`);
  }
  return (await res.json()) as T;
};

const offlineOr = async <T>(remote: () => Promise<T>, fallback: () => T): Promise<T> => {
  try {
    return await remote();
  } catch (error) {
    if (error instanceof ApiError && (error.status === 0 || error.status === 404)) {
      // Local mock fallback keeps the workflow available during offline review.
      return fallback();
    }
    throw error;
  }
};

export async function listRestorationPlan(): Promise<RestorationPlan[]> {
  return offlineOr(
    () => request<RestorationPlan[]>(endpoint),
    () => planWorkflowMock.list()
  );
}

export async function getRestorationPlanDetail(id: number): Promise<RestorationPlanDetail> {
  return offlineOr(
    () => request<RestorationPlanDetail>(`${endpoint}/${id}`),
    () => planWorkflowMock.detail(id)
  );
}

export async function returnRestorationPlan(
  id: number,
  payload: { opinion?: string; items: Array<{ requirement: string; deadline: string }> }
): Promise<RestorationPlanDetail> {
  return offlineOr(
    () => request<RestorationPlanDetail>(`${endpoint}/${id}/return`, { method: "POST", body: JSON.stringify(payload) }),
    () => planWorkflowMock.returnPlan(id, currentUser.id, payload)
  );
}

export async function resolveCorrectionItem(
  planId: number,
  itemId: number,
  resolution_note: string
): Promise<RestorationPlanDetail> {
  return offlineOr(
    () =>
      request<RestorationPlanDetail>(`${endpoint}/${planId}/correction-items/${itemId}/resolve`, {
        method: "POST",
        body: JSON.stringify({ resolution_note })
      }),
    () => planWorkflowMock.resolveItem(planId, itemId, currentUser.id, resolution_note)
  );
}

export async function resubmitRestorationPlan(
  id: number,
  payload: { method?: string; risk_assessment?: string } = {}
): Promise<RestorationPlanDetail> {
  return offlineOr(
    () => request<RestorationPlanDetail>(`${endpoint}/${id}/resubmit`, { method: "POST", body: JSON.stringify(payload) }),
    () => planWorkflowMock.resubmit(id, currentUser.id, payload)
  );
}

export async function approveRestorationPlan(id: number, opinion?: string): Promise<RestorationPlanDetail> {
  return offlineOr(
    () => request<RestorationPlanDetail>(`${endpoint}/${id}/approve`, { method: "POST", body: JSON.stringify({ opinion }) }),
    () => planWorkflowMock.approve(id, currentUser.id, opinion)
  );
}

export async function saveRestorationPlan(payload: RestorationPlan) {
  console.info("save RestorationPlan", payload);
  return payload;
}

export { mockData };
export type { MockHttpError };
