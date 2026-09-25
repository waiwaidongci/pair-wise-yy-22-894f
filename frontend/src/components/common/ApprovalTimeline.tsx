import { StatusBadge } from "./StatusBadge";

export type ApprovalTimelineEntry = {
  key: string | number;
  label: string;
  value: string;
  detail?: string;
  at?: string;
};

export function ApprovalTimeline({ title = "ApprovalTimeline", value = "READY", entries }: { title?: string; value?: string; entries?: ApprovalTimelineEntry[] }) {
  if (!entries) {
    return <div className="shared-widget"><strong>{title}</strong><StatusBadge value={value} /></div>;
  }
  return (
    <div className="shared-widget timeline">
      <strong>{title}</strong>
      <ol>
        {entries.map((entry) => (
          <li key={entry.key}>
            <div className="timeline-head">
              <span>{entry.label}</span>
              <StatusBadge value={entry.value} />
            </div>
            {entry.detail ? <p>{entry.detail}</p> : null}
            {entry.at ? <time>{entry.at}</time> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
