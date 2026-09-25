import { StatusBadge } from "./StatusBadge";
import { formatDate } from "../../utils/formatters";

export interface ApprovalTimelineEvent {
  key: string | number;
  label: string;
  value?: string;
  description?: string | null;
  time?: string | null;
}

export function ApprovalTimeline({
  title = "ApprovalTimeline",
  value = "READY",
  events
}: {
  title?: string;
  value?: string;
  events?: ApprovalTimelineEvent[];
}) {
  if (!events) {
    return <div className="shared-widget"><strong>{title}</strong><StatusBadge value={value} /></div>;
  }
  return (
    <div className="timeline">
      <h3>{title}</h3>
      {events.length === 0 ? <p className="muted">暂无修订记录</p> : null}
      <ol>
        {events.map((event) => (
          <li key={event.key} className="timeline-item">
            <div className="timeline-head">
              <strong>{event.label}</strong>
              {event.value ? <StatusBadge value={event.value} /> : null}
            </div>
            {event.description ? <p>{event.description}</p> : null}
            {event.time ? <time>{formatDate(event.time)}</time> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
