import { useEffect, useState } from "react";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { usePlanApproval } from "../hooks/usePlanApproval";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { ApprovalTimeline } from "../components/common/ApprovalTimeline";
import { EmptyState } from "../components/common/EmptyState";
import { CorrectionItemStatusText } from "../constants/CorrectionItemStatus";
import { RevisionReasonText } from "../constants/RevisionReason";
import { formatDate, formatDeadline, formatRevision, formatStatus } from "../utils/formatters";
import type { CorrectionItemInput } from "../mocks/localPlanWorkflow";

const EXPERT_ACTOR = { id: 90, role: "expert" };
const OWNER_ACTOR = { id: 1, role: "restorer" };

export function PlansPage() {
  const store = useRestorationPlanStore();
  const [view, setView] = useState<"expert" | "owner">("expert");
  const actor = view === "expert" ? EXPERT_ACTOR : OWNER_ACTOR;

  useEffect(() => {
    store.setActor(actor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);
  useEffect(() => {
    void store.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const plan = store.rows.find((row) => row.id === store.selectedId) ?? null;
  const approval = usePlanApproval(plan, store.corrections, actor.id);

  const [returnItems, setReturnItems] = useState<CorrectionItemInput[]>([{ requirement: "", deadline: "" }]);
  const [resolutionDrafts, setResolutionDrafts] = useState<Record<number, string>>({});
  const [resubmitForm, setResubmitForm] = useState({ change_note: "", method: "", risk_assessment: "" });

  const pendingPlanCount = store.rows.filter((row) => row.approval_status === "RETURNED").length;
  const pendingItemCount = store.rows.reduce((sum, row) => sum + (row.open_correction_count ?? 0), 0);

  const submitReturn = async () => {
    const ok = await store.returnForCorrection(returnItems);
    if (ok) setReturnItems([{ requirement: "", deadline: "" }]);
  };
  const submitResolution = async (itemId: number) => {
    const ok = await store.resolveItem(itemId, resolutionDrafts[itemId] ?? "");
    if (ok) setResolutionDrafts((drafts) => ({ ...drafts, [itemId]: "" }));
  };
  const submitResubmit = async () => {
    const ok = await store.resubmit(resubmitForm);
    if (ok) setResubmitForm({ change_note: "", method: "", risk_assessment: "" });
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">relic-restore</p>
          <h1>修复方案</h1>
        </div>
        <div className="view-switch">
          <span>当前视角</span>
          <button className={view === "expert" ? "active" : ""} onClick={() => setView("expert")}>专家 #{EXPERT_ACTOR.id}</button>
          <button className={view === "owner" ? "active" : ""} onClick={() => setView("owner")}>负责人 #{OWNER_ACTOR.id}</button>
        </div>
      </section>

      <section className="metrics">
        <StatCard label="待补正方案" value={pendingPlanCount} />
        <StatCard label="待处理补正条目" value={pendingItemCount} />
        <StatCard label="当前方案修订次数" value={store.revisions.length} />
      </section>

      {store.notice ? <p className={`notice ${store.notice.kind}`}>{store.notice.text}</p> : null}

      <section className="workbench">
        <div className="panel wide">
          <h2>方案列表</h2>
          <div className="table">
            {store.rows.map((row) => (
              <article key={row.id} className={`row selectable ${row.id === store.selectedId ? "selected" : ""}`} onClick={() => void store.select(row.id)}>
                <strong>{row.plan_title}</strong>
                <span>{row.version_no} · {formatRevision(row.revision_no)} · 责任人 #{row.owner_id}</span>
                {(row.open_correction_count ?? 0) > 0 ? <span className="tag warn">待补正 {row.open_correction_count} 条</span> : null}
                <StatusBadge value={row.approval_status} label={formatStatus(row.approval_status)} />
              </article>
            ))}
          </div>

          {plan ? (
            <>
              <h2>补正清单（当前修订 {formatRevision(plan.revision_no)}）</h2>
              {approval.currentItems.length === 0 ? <EmptyState title="当前修订没有补正条目" /> : (
                <div className="table">
                  {approval.currentItems.map((item) => (
                    <article key={item.id} className="correction-item">
                      <header>
                        <strong>#{item.item_no} {item.requirement}</strong>
                        <StatusBadge value={item.status} label={CorrectionItemStatusText[item.status as keyof typeof CorrectionItemStatusText] ?? item.status} />
                      </header>
                      <p>期限：{formatDeadline(item.deadline)} · 专家 #{item.raised_by} 提出于 {formatDate(item.raised_at)}</p>
                      {item.status === "RESOLVED" ? (
                        <p className="resolution">处理说明：{item.resolution_note}（责任人 #{item.resolved_by}，{item.resolved_at ? formatDate(item.resolved_at) : "-"}）</p>
                      ) : approval.isReturned && approval.isOwner && view === "owner" ? (
                        <div className="resolve-form">
                          <textarea
                            placeholder="填写该条目的处理说明"
                            value={resolutionDrafts[item.id] ?? ""}
                            onChange={(event) => setResolutionDrafts((drafts) => ({ ...drafts, [item.id]: event.target.value }))}
                          />
                          <button onClick={() => void submitResolution(item.id)}>提交处理说明</button>
                        </div>
                      ) : (
                        <p className="hint">待责任人逐条处理{view === "owner" && !approval.isOwner ? "（当前登录不是该方案责任人）" : ""}</p>
                      )}
                    </article>
                  ))}
                </div>
              )}

              <h2>修订历史与补正意见</h2>
              <ApprovalTimeline
                title="每次修订"
                entries={store.revisions.map((revision) => ({
                  key: revision.id,
                  label: `${formatRevision(revision.revision_no)} · ${revision.version_no} · ${RevisionReasonText[revision.reason as keyof typeof RevisionReasonText] ?? revision.reason}`,
                  value: revision.reason,
                  detail: `${revision.change_note}｜方法：${revision.method}｜风险：${revision.risk_assessment}`,
                  at: formatDate(revision.created_at)
                }))}
              />
              {store.revisions.map((revision) => {
                const items = store.corrections.filter((item) => item.revision_no === revision.revision_no);
                if (items.length === 0) return null;
                return (
                  <div key={revision.id} className="revision-items">
                    <h3>{formatRevision(revision.revision_no)} 补正意见（{items.length} 条）</h3>
                    {items.map((item) => (
                      <p key={item.id} className="resolution">
                        #{item.item_no} {item.requirement}（期限 {formatDeadline(item.deadline)}）→ {item.resolution_note || "未处理"}
                      </p>
                    ))}
                  </div>
                );
              })}
            </>
          ) : <EmptyState title="请选择方案" />}
        </div>

        <div className="panel">
          {plan ? (
            <>
              <h2>{plan.plan_title}</h2>
              <p><StatusBadge value={plan.approval_status} label={formatStatus(plan.approval_status)} /></p>
              <p>当前责任人：#{plan.owner_id}{plan.owner_id === actor.id ? "（当前登录）" : ""}</p>
              <dl className="locked-fields">
                <dt>版本号 {approval.isReturned ? "🔒" : ""}</dt><dd>{plan.version_no}</dd>
                <dt>修复方法 {approval.isReturned ? "🔒" : ""}</dt><dd>{plan.method}</dd>
                <dt>风险评估 {approval.isReturned ? "🔒" : ""}</dt><dd>{plan.risk_assessment}</dd>
              </dl>
              {approval.isReturned ? <p className="hint">方案已退回待补正，方法、风险评估和版本号已锁定，重提后由系统生成新修订。</p> : null}

              {view === "expert" ? (
                <>
                  <h3>专家审批</h3>
                  {approval.isSubmitted ? (
                    <div className="return-form">
                      <h4>退回补正（逐条填写补正要求和期限）</h4>
                      {returnItems.map((item, index) => (
                        <div key={index} className="return-item">
                          <textarea
                            placeholder={`补正要求 ${index + 1}`}
                            value={item.requirement}
                            onChange={(event) => setReturnItems((items) => items.map((row, i) => (i === index ? { ...row, requirement: event.target.value } : row)))}
                          />
                          <input
                            type="date"
                            value={item.deadline}
                            onChange={(event) => setReturnItems((items) => items.map((row, i) => (i === index ? { ...row, deadline: event.target.value } : row)))}
                          />
                          {returnItems.length > 1 ? <button onClick={() => setReturnItems((items) => items.filter((_, i) => i !== index))}>删除</button> : null}
                        </div>
                      ))}
                      <button onClick={() => setReturnItems((items) => [...items, { requirement: "", deadline: "" }])}>+ 增加一条</button>
                      <button className="primary" onClick={() => void submitReturn()}>退回补正</button>
                    </div>
                  ) : null}
                  <button className="primary" disabled={!approval.canApprove} title={approval.approveBlockReason ?? ""} onClick={() => void store.approve()}>
                    批准方案
                  </button>
                  {approval.approveBlockReason && approval.isReturned ? <p className="hint">{approval.approveBlockReason}</p> : null}
                </>
              ) : (
                <>
                  <h3>负责人补正</h3>
                  {approval.isReturned ? (
                    <div className="return-form">
                      <label>修订说明<input value={resubmitForm.change_note} onChange={(event) => setResubmitForm((form) => ({ ...form, change_note: event.target.value }))} /></label>
                      <label>修订后方法（留空则沿用锁定内容）<textarea value={resubmitForm.method} onChange={(event) => setResubmitForm((form) => ({ ...form, method: event.target.value }))} /></label>
                      <label>修订后风险评估（留空则沿用锁定内容）<textarea value={resubmitForm.risk_assessment} onChange={(event) => setResubmitForm((form) => ({ ...form, risk_assessment: event.target.value }))} /></label>
                      <button className="primary" disabled={!approval.canResubmit} title={approval.resubmitBlockReason ?? ""} onClick={() => void submitResubmit()}>
                        重新提交（生成新修订）
                      </button>
                      {approval.resubmitBlockReason ? <p className="hint">{approval.resubmitBlockReason}</p> : null}
                    </div>
                  ) : (
                    <p className="hint">方案未处于待补正状态。</p>
                  )}
                </>
              )}
            </>
          ) : <EmptyState title="请选择方案" />}
        </div>
      </section>
    </main>
  );
}
