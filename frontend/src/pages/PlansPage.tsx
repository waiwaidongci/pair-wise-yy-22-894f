import { useEffect, useMemo, useState } from "react";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { setCurrentUser, getCurrentUser } from "../api/RestorationPlan";
import { usePlanApproval } from "../hooks/usePlanApproval";
import { usePlanCorrection } from "../hooks/usePlanCorrection";
import { StatusBadge } from "../components/common/StatusBadge";
import { StatCard } from "../components/common/StatCard";
import { EmptyState } from "../components/common/EmptyState";
import { PlanApprovalStatusText } from "../constants/PlanApprovalStatus";
import { formatAssignee } from "../constants/planAssignees";
import { CorrectionChecklist } from "../components/plans/CorrectionChecklist";
import { ExpertReturnForm } from "../components/plans/ExpertReturnForm";
import { RevisionHistory } from "../components/plans/RevisionHistory";
import type { RestorationPlan } from "../types/RestorationPlan";

const ROLES = [
  { id: 2, role: "EXPERT", label: "专家（审批）" },
  { id: 3, role: "RESTORER", label: "负责人（补正）" }
] as const;

function PlanLockedFields({ label, value }: { label: string; value: string }) {
  return (
    <label className="field locked">
      <span>{label}<em className="lock-tag">待补正期间锁定</em></span>
      <textarea value={value} readOnly rows={label.includes("方法") ? 4 : 3} />
    </label>
  );
}

export function PlansPage() {
  const { rows, loading, load, detail, detailLoading, selectPlan, returnPlan, resolveItem, resubmit, approve, actionError, clearError } =
    useRestorationPlanStore();
  const { pageRows } = usePlanApproval(rows);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [user, setUser] = useState(getCurrentUser());
  const [approveOpen, setApproveOpen] = useState(false);
  const [opinion, setOpinion] = useState("");
  const correction = usePlanCorrection(detail);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (selectedId === null && rows.length > 0) setSelectedId(3);
  }, [rows, selectedId]);

  useEffect(() => {
    if (selectedId !== null) void selectPlan(selectedId);
  }, [selectedId, selectPlan]);

  const isExpert = user.role === "EXPERT";
  const pendingPlans = rows.filter((plan) => plan.approval_status === "PENDING_CORRECTION");

  const switchRole = (next: (typeof ROLES)[number]) => {
    setCurrentUser({ id: next.id, role: next.role });
    setUser(getCurrentUser());
  };

  const openCountOf = (plan: RestorationPlan) => plan.open_correction_count ?? 0;

  const headerStats = useMemo(
    () => ({
      pendingPlanCount: pendingPlans.length,
      currentAssignee: detail ? formatAssignee(detail.plan.current_assignee_id) : "请选择方案",
      revisionCount: detail?.revisions.length ?? 0
    }),
    [pendingPlans.length, detail]
  );

  return (
    <section className="plans-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">relic-restore / restoration plans</p>
          <h1>修复方案 · 退回补正</h1>
        </div>
        <div className="role-switch">
          <span>当前操作角色</span>
          {ROLES.map((entry) => (
            <button
              key={entry.role}
              type="button"
              className={user.role === entry.role ? "active" : ""}
              onClick={() => switchRole(entry)}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      <section className="metrics">
        <StatCard label="待补正方案" value={headerStats.pendingPlanCount} />
        <StatCard label="当前方案待补正条数" value={selectedId === null ? "—" : correction.openCount} />
        <StatCard label="当前责任人" value={headerStats.currentAssignee} />
        <StatCard label="当前方案修订次数" value={headerStats.revisionCount} />
      </section>

      {actionError ? (
        <div className="error-banner" role="alert">
          <span>{actionError}</span>
          <button type="button" className="link" onClick={clearError}>关闭</button>
        </div>
      ) : null}

      <section className="workbench plans-layout">
        <div className="panel">
          <h2>方案清单</h2>
          {loading ? <p className="muted">加载中…</p> : null}
          <div className="plan-list">
            {pageRows.map((plan) => (
              <button
                key={plan.id}
                type="button"
                className={`plan-row ${selectedId === plan.id ? "active" : ""}`}
                onClick={() => setSelectedId(plan.id)}
              >
                <div className="plan-row-main">
                  <strong>{plan.plan_title}</strong>
                  <span>版本 {plan.version_no} · 第 {plan.revision_no} 次修订 · 责任人 {formatAssignee(plan.current_assignee_id)}</span>
                </div>
                <span className="plan-row-meta">
                  <StatusBadge value={plan.approval_status} />
                  {plan.approval_status === "PENDING_CORRECTION" ? (
                    <em className="open-count">待补正 {openCountOf(plan)} 条</em>
                  ) : null}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="panel wide">
          {detailLoading ? <p className="muted">方案详情加载中…</p> : null}
          {!detailLoading && !detail ? <EmptyState title="请选择左侧方案查看补正流程" /> : null}
          {!detailLoading && detail && correction.plan ? (
            <div className="plan-detail">
              <div className="detail-head">
                <div>
                  <h2>{correction.plan.plan_title}</h2>
                  <p className="muted">
                    {PlanApprovalStatusText[correction.plan.approval_status as keyof typeof PlanApprovalStatusText] ?? correction.plan.approval_status}
                    {" · "}版本 {correction.plan.version_no} · 第 {correction.plan.revision_no} 次修订 · 当前责任人：{formatAssignee(correction.plan.current_assignee_id)}
                  </p>
                </div>
                <StatusBadge value={correction.plan.approval_status} />
              </div>

              <div className="locked-fields">
                {correction.fieldsLocked ? (
                  <>
                    <PlanLockedFields label="修复方法" value={correction.plan.method} />
                    <PlanLockedFields label="风险评估" value={correction.plan.risk_assessment} />
                    <label className="field locked">
                      <span>版本号<em className="lock-tag">待补正期间锁定</em></span>
                      <input value={correction.plan.version_no} readOnly />
                    </label>
                  </>
                ) : (
                  <>
                    <label className="field">
                      <span>修复方法</span>
                      <textarea value={correction.plan.method} readOnly rows={4} />
                    </label>
                    <label className="field">
                      <span>风险评估</span>
                      <textarea value={correction.plan.risk_assessment} readOnly rows={3} />
                    </label>
                  </>
                )}
              </div>

              <div className="correction-section">
                <div className="section-head">
                  <h3>补正清单</h3>
                  <span className={correction.openCount > 0 ? "open-count strong" : "muted"}>
                    共 {correction.totalCount} 条，待补正 {correction.openCount} 条，已处理 {correction.resolvedItems.length} 条
                  </span>
                </div>
                <CorrectionChecklist
                  items={correction.items}
                  locked={isExpert || correction.plan.approval_status !== "PENDING_CORRECTION"}
                  busy={detailLoading}
                  onResolve={(itemId, note) => resolveItem(detail.plan.id, itemId, note)}
                />
              </div>

              <div className="actions-section">
                {isExpert && correction.plan.approval_status === "SUBMITTED" ? (
                  <ExpertReturnForm onSubmit={(opinionValue, items) => returnPlan(detail.plan.id, { opinion: opinionValue, items })} busy={detailLoading} />
                ) : null}

                {isExpert && correction.plan.approval_status === "SUBMITTED" ? (
                  approveOpen ? (
                    <div className="approve-box">
                      <label className="field">
                        <span>批准意见</span>
                        <textarea rows={2} value={opinion} onChange={(event) => setOpinion(event.target.value)} />
                      </label>
                      <div className="form-actions">
                        <button type="button" className="btn ghost" onClick={() => setApproveOpen(false)}>取消</button>
                        <button
                          type="button"
                          className="btn primary"
                          disabled={!correction.canApprove || detailLoading}
                          title={correction.canApprove ? "" : "补正清单未逐条处理完成，不能直接批准"}
                          onClick={() => void approve(detail.plan.id, opinion.trim() || undefined)}
                        >
                          确认批准
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn primary"
                      disabled={!correction.canApprove}
                      title={correction.canApprove ? "" : "补正清单未逐条处理完成，不能直接批准"}
                      onClick={() => setApproveOpen(true)}
                    >
                      批准方案
                    </button>
                  )
                ) : null}

                {isExpert && correction.plan.approval_status === "PENDING_CORRECTION" ? (
                  <p className="muted">方案已退回补正，等待负责人逐条处理后重提，期间不能直接批准。</p>
                ) : null}

                {!isExpert && correction.plan.approval_status === "PENDING_CORRECTION" ? (
                  <div className="resubmit-box">
                    <button
                      type="button"
                      className="btn primary"
                      disabled={!correction.canResubmit || detailLoading}
                      title={correction.canResubmit ? "" : "补正清单未逐条处理完成，不能重提"}
                      onClick={() => void resubmit(detail.plan.id)}
                    >
                      全部条目已处理，重新提交
                    </button>
                    {!correction.canResubmit ? (
                      <p className="error-text">还有 {correction.openCount} 条补正未写处理说明，清单逐条处理完成后才能重提。</p>
                    ) : (
                      <p className="muted">重提后系统将生成新修订（第 {correction.plan.revision_no + 1} 次），本次退回意见保留在历史中。</p>
                    )}
                  </div>
                ) : null}

                {!isExpert && correction.plan.approval_status === "SUBMITTED" ? (
                  <p className="muted">方案已重提，等待专家审批。</p>
                ) : null}
              </div>

              <div className="history-section">
                <RevisionHistory revisions={correction.revisions} />
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </section>
  );
}
