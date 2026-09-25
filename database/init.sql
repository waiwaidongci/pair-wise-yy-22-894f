CREATE TABLE IF NOT EXISTS relic_item (
  id INTEGER PRIMARY KEY,
  relic_code TEXT,
  name TEXT,
  era TEXT,
  material TEXT,
  collection_level TEXT,
  storage_location TEXT,
  current_condition TEXT
);

CREATE TABLE IF NOT EXISTS damage_record (
  id INTEGER PRIMARY KEY,
  relic_id TEXT,
  damage_type TEXT,
  position_desc TEXT,
  severity TEXT,
  discovered_by TEXT,
  discovered_at TEXT,
  image_url TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS restoration_plan (
  id INTEGER PRIMARY KEY,
  relic_id TEXT,
  damage_record_id TEXT,
  plan_title TEXT,
  method TEXT,
  risk_assessment TEXT,
  version_no TEXT DEFAULT 'V1.0',
  revision_no INTEGER DEFAULT 1,
  approval_status TEXT,
  owner_id TEXT,
  reviewer_id TEXT,
  current_assignee_id TEXT
);

-- 退回补正清单：专家退回时逐条写入补正要求与期限，负责人逐条填写处理说明
CREATE TABLE IF NOT EXISTS restoration_plan_correction (
  id INTEGER PRIMARY KEY,
  plan_id INTEGER,
  revision_no INTEGER,
  item_no INTEGER,
  requirement TEXT,
  deadline TEXT,
  status TEXT,
  resolution_note TEXT,
  created_by TEXT,
  created_at TEXT,
  resolved_at TEXT
);

-- 方案修订历史：提交/退回/重提/批准均留痕，旧审查意见随修订永久保留
CREATE TABLE IF NOT EXISTS restoration_plan_revision (
  id INTEGER PRIMARY KEY,
  plan_id INTEGER,
  revision_no INTEGER,
  version_no TEXT,
  action TEXT,
  method_snapshot TEXT,
  risk_assessment_snapshot TEXT,
  review_opinion TEXT,
  actor_id TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS restoration_step (
  id INTEGER PRIMARY KEY,
  plan_id TEXT,
  step_order TEXT,
  technique TEXT,
  material_used TEXT,
  operator_id TEXT,
  step_status TEXT,
  finished_at TEXT
);

CREATE TABLE IF NOT EXISTS image_version (
  id INTEGER PRIMARY KEY,
  relic_id TEXT,
  plan_id TEXT,
  version_no TEXT,
  image_type TEXT,
  file_path TEXT,
  capture_at TEXT,
  note TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  actor TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  created_at TEXT
);
