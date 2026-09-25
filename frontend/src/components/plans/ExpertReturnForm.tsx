import { useState } from "react";

export interface DraftCorrectionItem {
  requirement: string;
  deadline: string;
}

export function ExpertReturnForm({
  onSubmit,
  busy
}: {
  onSubmit: (opinion: string | undefined, items: DraftCorrectionItem[]) => Promise<boolean> | boolean;
  busy?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [opinion, setOpinion] = useState("");
  const [items, setItems] = useState<DraftCorrectionItem[]>([{ requirement: "", deadline: "" }]);
  const [error, setError] = useState<string | null>(null);

  const patch = (index: number, patchValue: Partial<DraftCorrectionItem>) => {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...patchValue } : item)));
  };

  const submit = async () => {
    if (items.some((item) => !item.requirement.trim())) {
      setError("每条补正要求都必须填写具体内容");
      return;
    }
    if (items.some((item) => !item.deadline.trim())) {
      setError("每条补正要求都必须填写补正期限");
      return;
    }
    setError(null);
    const ok = await onSubmit(opinion.trim() || undefined, items);
    if (ok) {
      setOpen(false);
      setOpinion("");
      setItems([{ requirement: "", deadline: "" }]);
    }
  };

  if (!open) {
    return <button type="button" className="btn warning" disabled={busy} onClick={() => setOpen(true)}>退回补正（逐条填写要求与期限）</button>;
  }

  return (
    <div className="return-form">
      <label className="field">
        <span>总体审查意见（可选）</span>
        <textarea value={opinion} rows={2} onChange={(event) => setOpinion(event.target.value)} placeholder="线下口头意见请在此同步留痕" />
      </label>
      {items.map((item, index) => (
        <div key={index} className="return-row">
          <div className="return-row-head">
            <strong>第 {index + 1} 条补正要求</strong>
            {items.length > 1 ? (
              <button type="button" className="link danger" onClick={() => setItems((current) => current.filter((_, i) => i !== index))}>删除</button>
            ) : null}
          </div>
          <textarea
            rows={2}
            value={item.requirement}
            placeholder="写明本条需要补正的具体内容"
            onChange={(event) => patch(index, { requirement: event.target.value })}
          />
          <label className="deadline-field">
            <span>补正期限</span>
            <input type="date" value={item.deadline} onChange={(event) => patch(index, { deadline: event.target.value })} />
          </label>
        </div>
      ))}
      {error ? <p className="error-text">{error}</p> : null}
      <div className="form-actions">
        <button type="button" className="btn secondary" onClick={() => setItems((current) => [...current, { requirement: "", deadline: "" }])}>+ 增加一条</button>
        <button type="button" className="btn ghost" onClick={() => setOpen(false)}>取消</button>
        <button type="button" className="btn warning" disabled={busy} onClick={() => void submit() }>确认退回并进入待补正</button>
      </div>
      <p className="muted">退回后原修复方法、风险评估和版本号将锁定，负责人须逐条处理后才能重提。</p>
    </div>
  );
}
