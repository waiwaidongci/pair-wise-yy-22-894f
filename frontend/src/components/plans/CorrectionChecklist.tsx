import { useState } from "react";
import type { RestorationPlanCorrection } from "../../types/RestorationPlanCorrection";
import { CorrectionItemStatusText } from "../../constants/CorrectionItemStatus";
import { formatDeadline, isDeadlineOverdue } from "../../utils/formatters";

export function CorrectionChecklist({
  items,
  locked,
  onResolve,
  busy
}: {
  items: RestorationPlanCorrection[];
  locked: boolean;
  onResolve: (itemId: number, note: string) => Promise<boolean> | boolean;
  busy?: boolean;
}) {
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [errorId, setErrorId] = useState<number | null>(null);

  if (items.length === 0) {
    return <p className="muted">本方案暂无退回补正清单。</p>;
  }

  const submitNote = async (item: RestorationPlanCorrection) => {
    const note = (drafts[item.id] ?? item.resolution_note ?? "").trim();
    if (!note) {
      setErrorId(item.id);
      return;
    }
    setErrorId(null);
    const ok = await onResolve(item.id, note);
    if (ok) setDrafts((current) => ({ ...current, [item.id]: "" }));
  };

  return (
    <ol className="correction-list">
      {items.map((item) => {
        const pending = item.status === "PENDING";
        const overdue = pending && isDeadlineOverdue(item.deadline, item.resolved_at);
        const value = drafts[item.id] ?? item.resolution_note ?? "";
        return (
          <li key={item.id} className={`correction-item ${pending ? "pending" : "resolved"}`}>
            <div className="correction-head">
              <strong>第 {item.item_no} 条 · {CorrectionItemStatusText[item.status as "PENDING"] ?? CorrectionItemStatusText[item.status as "RESOLVED"] ?? item.status}</strong>
              <span className={overdue ? "deadline overdue" : "deadline"}>
                期限：{formatDeadline(item.deadline)}{overdue ? "（已逾期）" : ""}
              </span>
            </div>
            <p className="requirement">{item.requirement}</p>
            <label className="field">
              <span>处理说明</span>
              <textarea
                value={value}
                disabled={!pending || locked || busy}
                placeholder={pending ? "逐条写明本条补正的处理说明后，再标记已处理" : undefined}
                onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: event.target.value }))}
                rows={2}
              />
            </label>
            {errorId === item.id ? <p className="error-text">处理说明不能为空，未逐条处理不能重提。</p> : null}
            <div className="correction-foot">
              {pending ? (
                <button
                  type="button"
                  className="btn secondary"
                  disabled={locked || busy}
                  onClick={() => void submitNote(item)}
                >
                  标记已处理
                </button>
              ) : (
                <span className="resolved-at">已于 {item.resolved_at ? formatDeadline(item.resolved_at.slice(0, 10)) : "-"} 处理</span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
