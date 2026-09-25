export const mockData = {
  "relicItem": [
    {
      "id": 1,
      "relic_code": "relic code 1",
      "name": "name 1",
      "era": "era 1",
      "material": "material 1",
      "collection_level": "LOW",
      "storage_location": "storage location 1",
      "current_condition": "current condition 1"
    },
    {
      "id": 2,
      "relic_code": "relic code 2",
      "name": "name 2",
      "era": "era 2",
      "material": "material 2",
      "collection_level": "MEDIUM",
      "storage_location": "storage location 2",
      "current_condition": "current condition 2"
    },
    {
      "id": 3,
      "relic_code": "relic code 3",
      "name": "name 3",
      "era": "era 3",
      "material": "material 3",
      "collection_level": "HIGH",
      "storage_location": "storage location 3",
      "current_condition": "current condition 3"
    }
  ],
  "damageRecord": [
    {
      "id": 1,
      "relic_id": 1,
      "damage_type": "FRAGILE",
      "position_desc": "position desc 1",
      "severity": "severity 1",
      "discovered_by": "discovered by 1",
      "discovered_at": "2026-06-11T09:00:00Z",
      "image_url": "/mock/image_url-1.png",
      "status": "SUBMITTED"
    },
    {
      "id": 2,
      "relic_id": 2,
      "damage_type": "DAMAGED",
      "position_desc": "position desc 2",
      "severity": "severity 2",
      "discovered_by": "discovered by 2",
      "discovered_at": "2026-06-12T09:00:00Z",
      "image_url": "/mock/image_url-2.png",
      "status": "APPROVED"
    },
    {
      "id": 3,
      "relic_id": 3,
      "damage_type": "IN_RESTORATION",
      "position_desc": "position desc 3",
      "severity": "severity 3",
      "discovered_by": "discovered by 3",
      "discovered_at": "2026-06-13T09:00:00Z",
      "image_url": "/mock/image_url-3.png",
      "status": "DRAFT"
    }
  ],
  "restorationPlan": [
    {
      "id": 1,
      "relic_id": 1,
      "damage_record_id": 1,
      "plan_title": "plan title 1",
      "method": "method 1",
      "risk_assessment": "risk assessment 1",
      "version_no": "V1.0",
      "revision_no": 1,
      "approval_status": "SUBMITTED",
      "owner_id": 1,
      "reviewer_id": 2,
      "current_assignee_id": 2
    },
    {
      "id": 2,
      "relic_id": 2,
      "damage_record_id": 2,
      "plan_title": "plan title 2",
      "method": "method 2",
      "risk_assessment": "risk assessment 2",
      "version_no": "V1.0",
      "revision_no": 1,
      "approval_status": "APPROVED",
      "owner_id": 2,
      "reviewer_id": 2,
      "current_assignee_id": 2
    },
    {
      "id": 3,
      "relic_id": 3,
      "damage_record_id": 3,
      "plan_title": "plan title 3",
      "method": "method 3",
      "risk_assessment": "risk assessment 3",
      "version_no": "V1.0",
      "revision_no": 1,
      "approval_status": "PENDING_CORRECTION",
      "owner_id": 3,
      "reviewer_id": 2,
      "current_assignee_id": 3
    }
  ],
  "restorationPlanRevision": [
    {
      "id": 1,
      "plan_id": 1,
      "revision_no": 1,
      "version_no": "V1.0",
      "action": "SUBMIT",
      "method_snapshot": "method 1",
      "risk_assessment_snapshot": "risk assessment 1",
      "review_opinion": null,
      "actor_id": 1,
      "created_at": "2026-09-10T09:00:00Z"
    },
    {
      "id": 2,
      "plan_id": 2,
      "revision_no": 1,
      "version_no": "V1.0",
      "action": "SUBMIT",
      "method_snapshot": "method 2",
      "risk_assessment_snapshot": "risk assessment 2",
      "review_opinion": null,
      "actor_id": 2,
      "created_at": "2026-08-20T09:00:00Z"
    },
    {
      "id": 3,
      "plan_id": 2,
      "revision_no": 1,
      "version_no": "V1.0",
      "action": "APPROVE",
      "method_snapshot": "method 2",
      "risk_assessment_snapshot": "risk assessment 2",
      "review_opinion": "同意按方案实施。",
      "actor_id": 2,
      "created_at": "2026-08-25T09:00:00Z"
    },
    {
      "id": 4,
      "plan_id": 3,
      "revision_no": 1,
      "version_no": "V1.0",
      "action": "SUBMIT",
      "method_snapshot": "method 3",
      "risk_assessment_snapshot": "risk assessment 3",
      "review_opinion": null,
      "actor_id": 3,
      "created_at": "2026-09-15T09:00:00Z"
    },
    {
      "id": 5,
      "plan_id": 3,
      "revision_no": 1,
      "version_no": "V1.0",
      "action": "RETURN",
      "method_snapshot": "method 3",
      "risk_assessment_snapshot": "risk assessment 3",
      "review_opinion": "方法与风险评估存在缺项，请按清单逐条补正并注意期限。",
      "actor_id": 2,
      "created_at": "2026-09-20T09:00:00Z"
    }
  ],
  "restorationPlanCorrection": [
    {
      "id": 1,
      "plan_id": 3,
      "revision_no": 1,
      "item_no": 1,
      "requirement": "补色范围超出病害记录标注位置，请按病害图缩小补色范围并注明边界依据。",
      "deadline": "2026-09-30",
      "status": "RESOLVED",
      "resolution_note": "已按病害图将补色边界收窄至残缺边缘 2mm 内，并补充边界对照图 3 张。",
      "created_by": 2,
      "created_at": "2026-09-20T09:00:00Z",
      "resolved_at": "2026-09-23T14:00:00Z"
    },
    {
      "id": 2,
      "plan_id": 3,
      "revision_no": 1,
      "item_no": 2,
      "requirement": "风险评估缺少颜料可逆性试验结论，请补充实验编号、条件与结果。",
      "deadline": "2026-09-28",
      "status": "PENDING",
      "resolution_note": null,
      "created_by": 2,
      "created_at": "2026-09-20T09:00:00Z",
      "resolved_at": null
    }
  ],
  "restorationStep": [
    {
      "id": 1,
      "plan_id": 1,
      "step_order": "step order 1",
      "technique": "technique 1",
      "material_used": "material used 1",
      "operator_id": 1,
      "step_status": "SUBMITTED",
      "finished_at": "2026-06-11T09:00:00Z"
    },
    {
      "id": 2,
      "plan_id": 2,
      "step_order": "step order 2",
      "technique": "technique 2",
      "material_used": "material used 2",
      "operator_id": 2,
      "step_status": "APPROVED",
      "finished_at": "2026-06-12T09:00:00Z"
    },
    {
      "id": 3,
      "plan_id": 3,
      "step_order": "step order 3",
      "technique": "technique 3",
      "material_used": "material used 3",
      "operator_id": 3,
      "step_status": "DRAFT",
      "finished_at": "2026-06-13T09:00:00Z"
    }
  ],
  "imageVersion": [
    {
      "id": 1,
      "relic_id": 1,
      "plan_id": 1,
      "version_no": "version no 1",
      "image_type": "FRAGILE",
      "file_path": "file path 1",
      "capture_at": "2026-06-11T09:00:00Z",
      "note": "note 1"
    },
    {
      "id": 2,
      "relic_id": 2,
      "plan_id": 2,
      "version_no": "version no 2",
      "image_type": "DAMAGED",
      "file_path": "file path 2",
      "capture_at": "2026-06-12T09:00:00Z",
      "note": "note 2"
    },
    {
      "id": 3,
      "relic_id": 3,
      "plan_id": 3,
      "version_no": "version no 3",
      "image_type": "IN_RESTORATION",
      "file_path": "file path 3",
      "capture_at": "2026-06-13T09:00:00Z",
      "note": "note 3"
    }
  ]
} as const;
