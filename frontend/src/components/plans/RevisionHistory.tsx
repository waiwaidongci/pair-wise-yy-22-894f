import { ApprovalTimeline, type ApprovalTimelineEvent } from "../common/ApprovalTimeline";
import type { RestorationPlanRevision } from "../../types/RestorationPlanRevision";
import { PlanRevisionActionText } from "../../constants/CorrectionItemStatus";
import { formatRevisionLabel } from "../../utils/formatters";

export function RevisionHistory({ revisions }: { revisions: RestorationPlanRevision[] }) {
  const events: ApprovalTimelineEvent[] = [...revisions]
    .sort((a, b) => a.id - b.id)
    .map((revision) => ({
      key: revision.id,
      label: `${formatRevisionLabel(revision.revision_no, revision.version_no)} · ${PlanRevisionActionText[revision.action as "SUBMIT"] ?? revision.action}`,
      value: revision.action,
      description: revision.review_opinion,
      time: revision.created_at
    }));
  return <ApprovalTimeline title="修订与审批历史（旧意见永久留痕）" value="READY" events={events} />;
}
