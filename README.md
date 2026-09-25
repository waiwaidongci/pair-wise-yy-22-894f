# 文物修复档案协作平台

面向博物馆修复团队的文物病害记录、修复方案、影像版本和审批归档平台。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20110>

后端健康检查：<http://localhost:21110/health>


## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。


## 修复方案退回补正流程

方案页（`/plans`）支持专家与负责人之间的逐条退回补正闭环，替代线下口头反馈：

1. **专家退回**：专家对处于「待审批（SUBMITTED）」的方案逐条填写补正要求与补正期限（至少一条，每条都必须有要求和期限），可附总体意见。方案随即进入「待补正（PENDING_CORRECTION）」。
2. **字段锁定**：待补正期间原修复方法、风险评估和版本号只读锁定（后端更新接口返回 `423 PLAN_FIELDS_LOCKED`），不能被直接改动。
3. **逐条处理**：负责人对每条补正填写处理说明并标记已处理；处理说明为空时后端返回 `400 CORRECTION_RESOLUTION_MISSING`。
4. **重提生成新修订**：清单未全部处理时重提会被拒绝（`409 CORRECTION_ITEMS_OPEN`）；全部处理后重提，方案回到待审批，修订号 +1、版本号递增（如 `V1.0 → V2.0`），本次退回意见保留在修订历史中。
5. **禁止直接批准**：存在未处理补正条目时，专家的批准操作同样返回 `409 CORRECTION_ITEMS_OPEN`。
6. **页面可观测信息**：方案清单与详情展示待补正条数、当前责任人（待补正→负责人，待审批→专家）、每次修订记录（提交/退回/重提/批准、版本号、意见快照）。

接口（角色由请求头 `x-role` / `x-user-id` 模拟，经 RBAC 中间件校验）：

| 方法 | 路径 | 角色 | 说明 |
|---|---|---|---|
| POST | `/api/restoration-plan/:id/return` | EXPERT | 退回，body：`{ opinion?, items:[{requirement, deadline}] }` |
| POST | `/api/restoration-plan/:planId/correction-items/:itemId/resolve` | RESTORER | 逐条处理，body：`{ resolution_note }` |
| POST | `/api/restoration-plan/:id/resubmit` | RESTORER | 全部处理后重提，生成新修订 |
| POST | `/api/restoration-plan/:id/approve` | EXPERT | 批准（存在未处理条目时拒绝） |
| GET | `/api/restoration-plan/:id` | - | 方案详情：方案、补正清单、修订历史 |

前端在后端不可达时自动回退到 `mocks/planWorkflowMock`，校验规则与后端一致，可离线演示完整流程。


## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Ant Design + Zustand |
| 后端 | NestJS + TypeScript + Prisma |
| 数据库 | PostgreSQL 15 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `relic-restore`
- `FRONTEND_PORT`: 前端端口，默认 `20110`
- `BACKEND_PORT`: 后端端口，默认 `21110`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: relic-restore`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-relic-restore}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- RelicCondition: constants/RelicCondition、types/RelicCondition、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- PlanApprovalStatus: constants/PlanApprovalStatus、types/PlanApprovalStatus、constructors/RestorationPlan(Correction|Revision)Constructor、logTemplates、errorMessages、utils/formatters、mocks/seedData、stores/RestorationPlanStore、pages/PlansPage、components/plans/*、components/common/StatusBadge、services/PlanCorrectionService、controllers/RestorationPlan*Controller、routes/RestorationPlan*Routes、database/init.sql 均有引用。新增取值 `PENDING_CORRECTION`（待补正）。
- CorrectionItemStatus（PENDING / RESOLVED）与 PlanRevisionAction（SUBMIT / RETURN / RESUBMIT / APPROVE）: 前后端 constants/CorrectionItemStatus、types/RestorationPlanCorrection、types/RestorationPlanRevision、constructors、logTemplates（RestorationPlanCorrection）、statusText、components/plans/CorrectionChecklist、components/plans/RevisionHistory、services/PlanCorrectionService 均有引用。
- DamageSeverity: constants/DamageSeverity、types/DamageSeverity、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
