# CIPP hardening and simplicity audit

This report tracks [issue #1](https://github.com/Revotech-Networks/CIPP/issues/1). This bounded source wave repaired three P1 defects and completed one separately authorized ponytail simplification. Each repair is merged, independently reviewed, target-verified and issue-closed. Final integrated validation passes; this report records the completed source outcomes and remaining audit limits. The repository-wide audit remains **PARTIAL — BLOCKED**, not exhausted: live acceptance and a provider-blocked security investigation remain unavailable, and source coverage is explicitly partial.

## Scope and ownership

The target is `Revotech-Networks/CIPP`, branch `main`. The audit began on 2026-10-29 UTC at `243060466dc49915e06f8283e61c242241bda9e7`, tree `4f6d6b27bb655e2d88e7eb64e4fd263e511a56c6`. The last fetched target is `a6b8bbf063fc1eb6e7f24ffa151261c9b11c3f8f`, including PRs #4, #5, #7, #9 and #10.

The accountable repository root is T3 thread `mcp:2ee3d9a7-99c3-4765-bd51-b58df90ba199`, working on `audit/ponytail-20261029-c6fe948e`. The combined portfolio coordinator is `d4ba2482-746c-4bf0-a13d-667f3134c71f`. Root owns candidate admission, issue identity, Git, report updates, integration and merge decisions. Read-only discovery covered high-risk components and pages. Isolated workers completed scoped implementations for #3, #6 and #8. Root inspected each patch, serialized the shared script-page changes, performed Git/PR/merge work and reran focused tests. Read-only dependency triage completed; its clipboard verification follow-up failed at a provider account-security control before producing proof. No implementation worker remains active.

The tracked inventory contains 1,003 files under `src`, 111 under `tests`, 93 under `Tests`, 29 under `.github`, seven under `Tools`, four deployment templates and the root manifests/configuration. The audit includes first-party code, tests and durable documentation. Generated assets, bundled vendor files, dependency caches and build output are excluded from implementation review. Inventory is not evidence of complete source inspection.

Fresh remote inspection found no tracked `AGENTS.md`, `PROJECT.md`, standing-authority document or prior QA report. `CONTRIBUTING.md`, `SECURITY.md` and `.github/copilot-instructions.md` were read. Conventional Commits apply. Security disclosure must remain private until remediation. The audit makes no upstream changes or production deployments.

Initial fully paginated GitHub all-state issue and PR lists were empty. The only worktrees were the clean main checkout and this audit checkout. The live CIPP T3 project contained only this repository root. The portfolio coordinator subsequently enabled Issues; native readback confirmed `has_issues=true`. This root changed no repository settings.

## Product contract

CIPP is a multi-tenant Microsoft partner administration portal. This repository provides the Next.js/React frontend and Azure Static Web Apps routing/deployment configuration. The separate CIPP API supplies authenticated tenant data and administrative operations. Critical journeys include login, role-aware navigation, tenant selection, listing and editing users/groups/devices, bulk actions, standards deployment and reporting.

The frontend uses React Query for server state and Redux/persisted browser state for preferences. Frontend permission controls do not establish backend authorization. Microsoft tenant mutations, authentication, isolation and recovery need a safe API/test tenant to verify end to end. None has been established for this audit. Unit tests and Storybook mocks cannot satisfy that requirement.

## Plan and gates

The audit uses the Bounded engineering lane. Each admitted repair receives its own actual lane and smallest complete plan. Scope expands only after the causal premise, affected callers and required proof are reassessed. P0/P1/F0/F1 admission requires demonstrated impact and root cause. Ponytail simplifications are tracked separately and require behavior preservation. There is no finding quota.

The authorized endpoint is reviewed and verified source merges, fetched-target regression/integration verification, issue closure and a merged final report. Deployment, publication, production mutations and credential changes are excluded. Required checks and reviews remain binding. Documentation is required for this report; root checks its claims against source and native readback. No new project-memory document is required.

## Environment and baseline

The audit runs on Linux. The default Node is 26.12.1; commands use the already installed Node 22.23.3 to satisfy `engines.node=^22.22.0`. Yarn Classic 1.22.22 runs through `npm exec`. Third-party installation scripts remain disabled by repository configuration and explicit flags.

| Command | Observed result |
| --- | --- |
| `git fetch origin main` | Frozen integrated target `a6b8bbf063fc1eb6e7f24ffa151261c9b11c3f8f`. |
| `npm exec --yes --package=yarn@1.22.22 -- yarn install --frozen-lockfile --ignore-scripts --non-interactive` | Failed: lockfile needs updating. No source files changed. |
| `npm exec --yes --package=yarn@1.22.22 -- yarn install --pure-lockfile --ignore-scripts --non-interactive` | Passed in 56.23 seconds with peer/workspace warnings; does not rewrite the lockfile. This is not a reproducible frozen install. |
| `node_modules/.bin/vitest run --project unit --maxWorkers=1` | Baseline passed: 62 files, 513 tests, 175.29 seconds. |
| `node_modules/.bin/eslint .` | Baseline failed: 65 errors and 268 warnings; unrelated existing failures were not weakened or broadly rewritten. |
| Repository JSON validator | 292 files checked, zero invalid. |
| Production build/export at PR #5 head | Passed in a disposable archive with one Next worker and 3 GiB heap; no deployment. |

Root-owned command output is retained privately at `/tmp/cipp-audit-20261029/`; new artifacts use `/tmp/cipp-audit-2ee3d9a7/` to avoid a shared scratch-name collision. Unknown files were preserved. Unit concurrency is limited to one worker. No stress or live tenant test has run. Builds must use an isolated disposable copy because the repository build script deletes `package.json` and `yarn.lock` after a successful export.

## Coverage

| Area | Current assessment | Remaining evidence |
| --- | --- | --- |
| Components and forms | 363-file inventory; focused high-risk forms/actions review. Bulk tenant defect reproduced and repaired; table-selection lead rejected by actual clearing effect and rerender regression. | Most decorative/reporting/settings components remain uninspected; browser/live proof remains. |
| Pages and critical workflows | 384-file inventory (359 JS/JSX, 25 JSON); targeted user/offboarding, group/device, JIT, CA, restore and script journeys. Save failure and bulk script assignment admitted. | Remaining pages and backend/live outcomes; standards template bulk lead not admitted. |
| API hooks, permissions and browser state | GET query hook and critical dialog consumers inspected; 16 hook contracts and five dialog tests pass after the shared invalidation repair. Permission/menu/context paths received partial source reads only. | Remaining hooks/state/utility source and real tenant isolation proof. |
| Manifests and installation | Manifest requests jsdom 29.0.1; that exact selector is absent from the lock. Non-mutating installation works. Native Dependabot reported 124 open alerts. Read-only triage covered all 56 critical/high records (49 distinct advisories); none is admitted from version range alone. | Reproducible frozen install and advisory reachability; no blind severity admission. |
| CI and deployment | Approved source window in effect; bootstrap merged and target tested. Validation workflows remain enabled; four checks skip this fork under existing owner filters. | Coordinator restoration of deployment workflow at source-wave completion. |
| Unit and lint baseline | Baseline 513 unit tests pass; final integrated suite passes 559. Full lint has 65 pre-existing errors; changed files pass focused lint. Final export passes. | Existing full-lint failures remain a baseline limitation; no checks were weakened. |
| UI/accessibility and Storybook | Real static export loaded in a background T3 incognito preview at PR #5 head. Assets hydrated; missing local `/.auth/me` and `/api/me` returned 404 and prevented authenticated use. Test server and tab were closed. | Safe API/test tenant, relevant keyboard/accessible journeys and Storybook runtime remain unverified; this is not live E2E proof. |
| API integration, authentication and tenant isolation | Blocked: no safe runtime/test tenant. | Authorized isolated API and synthetic tenant data. |
| Concurrency, stress, recovery and upgrades | Not exercised yet. | Bounded relevant scenarios after baseline. |
| Durable docs, assets and remaining utilities | Inventory and partial inspection only. | Complete first-party classification and source coverage. |

## Findings and rejections

| Item | Disposition and proof |
| --- | --- |
| [#2 bulk onboarding tenant](https://github.com/Revotech-Networks/CIPP/issues/2), P1 | Closed after [PR #5](https://github.com/Revotech-Networks/CIPP/pull/5), merge `c989b4105781dee80dc1abb0b8dc046114aebb84`. Original source failed two mounted-component tenant-switch tests. Four final tests pass at exact head and fetched merge. Hosted Code/Security clean; build and focused lint pass. |
| [#3 failed script saves](https://github.com/Revotech-Networks/CIPP/issues/3), P1 | Closed after [PR #7](https://github.com/Revotech-Networks/CIPP/pull/7), head `57db5e4bed728ae9bb8d3991a7ad9aa0ecd21c28`, merge `91b317ea9eae3ec4d54e63289fa3321c442dd673`. Exact-head Code/Security clean; branch-policy check passed. Fetched-target seven save tests and four prior tenant tests passed. Seven real-page tests pass for HTTP/network failures, retained dirty state, retry, cached-error result and four script types. Focused lint passes. |
| [#6 bulk script assignment](https://github.com/Revotech-Networks/CIPP/issues/6), P1 | Root executed all four actual formatters: array inputs lose ID/type/tenant. [PR #9](https://github.com/Revotech-Networks/CIPP/pull/9), head `c193700c6b2cf2f7e92def4155737a4e7b4065be`, merged at `15ce88c8603f739c61576c202cdb3b973c6cfc15`; issue closed. Hosted Code/Security clean. Original code failed 14/19 tests; candidate passed 19/19, and fetched target passed 26/26 assignment-plus-save regressions. No backend write ran. |
| Table selection migration lead | Rejected: actual toolbar resets selection when data changes. Root real table rerender proof passed; no duplicate protection added. |
| [#8 API GET invalidation duplication](https://github.com/Revotech-Networks/CIPP/issues/8), ponytail `reuse` | [PR #10](https://github.com/Revotech-Networks/CIPP/pull/10), head `571e29a9bab8d2cc5ff1ae53c0a546051b381cdd`, merge `a6b8bbf063fc1eb6e7f24ffa151261c9b11c3f8f`, removes 26 production lines by sharing the same successful invalidation block. Sixteen actual-hook contract tests pass before/after and on root uptake. Hosted Code/Security clean; fetched target passed 21/21 API-plus-dialog tests and issue closed. No excellence severity assigned. |
| Standards template bulk formatter | Withheld lead: bulk loses TemplateId, but supported behavior and backend effect need verification. No accepted severity or issue. |

Verified source outcomes are P0: 0, P1: 3, F0: 0, F1: 0, plus one ponytail repair. Final integrated verification passes; these are the completed counts once this report lands. Four finding issues are closed. Five implementation/policy PRs are merged: three P1 repairs, one simplicity repair and the non-counting bootstrap. This report PR is also administrative and does not count as a finding. No correction rounds have been spent on the accepted repairs. Policy bootstrap, report and tracking work do not count.

Dependency triage found no demonstrated deployed Next server/image/cache surface under `output: export` and `images.unoptimized: true`. Other advisory-specific preconditions were not established for the inspected browser JSON callers, sanitizer defaults and build/test tools. Editor clipboard handling and Storybook development access remain unaccepted verification leads. The clipboard worker received an explicit provider account-security refusal; root retained it without replay, route/model/account substitution or exploitability admission. The portfolio coordinator owns any legitimate account-readiness decision. This gap does not extend the deployment pause after routine source delivery. No exploit details are published; private advisory inventory was empty at readback.

## Source delivery window

The Azure Static Web Apps workflow `.github/workflows/azure-static-web-apps-kind-sand-0c268c510.yml`, ID `99582982`, deploys on pushes to main and PR opened/synchronize/reopened events; closed PRs close environments. Native metadata confirmed its deployment secret name exists, zero GitHub environments, and the [starting-revision deployment](https://github.com/Revotech-Networks/CIPP/actions/runs/32046590648) succeeded. No secret value was read.

Chris explicitly approved the bounded CIPP/CIPP-API source-only plan in the portfolio thread, native position 219, at 2026-10-29T05:35:39.186Z. Root independently read the full decision/proposal and the coordinator's workflow-window evidence. The coordinator alone temporarily paused the relevant deployment and PR auto-closer workflows and verified no in-flight runs before/after. Root independently read back the disabled CIPP workflows before affected events. No validation or protection was removed.

[Bootstrap PR #4](https://github.com/Revotech-Networks/CIPP/pull/4) added only a same-repository exemption to the existing external-fork rejection. Reviewed head `ef65a00a5302474ea08b14156bf91010db5c9612` merged normally at `17d7e7967bef45a9c399441ce86af6ad0eeb06ba`. Hosted Code and Security review completed clean. All 48 policy truth-table cases passed on both candidate and fetched target. The coordinator restored auto-closer `149812178` to active after this proof. Deployment `99582982` was coordinator-owned paused throughout source delivery. The coordinator must restore it immediately after this report lands and handback is verified, without dispatch/rerun. Post-handback native state is recorded on tracking issue #1; this report does not claim an unobserved restoration.

GitHub reports no branch protection for main and an empty ruleset list. Four validation jobs were SKIPPED by existing owner filters on all source PRs, not executed successes. After bootstrap restoration, the branch-policy check passed on #7, #9 and #10. Local checks and required independent reviews remain binding. No deployment, production mutation or protection bypass occurred.

## Verification record

All focused commands used installed Node 22.23.3 and `node_modules/.bin/vitest run --project unit --maxWorkers=1`, naming the following files:

| Issue / PR | Regression files | Candidate / fetched-target result |
| --- | --- | --- |
| #2 / #5 | `tests/components/CippComponents/CippBulkOnboardingTenant.test.jsx` | 4 / 4 pass; original tenant-switch pair failed. |
| #3 / #7 | `tests/pages/IntuneScriptSave.test.jsx` | 7 pass; fetched target also reran the prior four tenant tests, 11 total. |
| #6 / #9 | `tests/pages/IntuneScriptAssignment.test.jsx` | 19 pass; fetched target also reran seven save tests, 26 total, 42.66 s, peak child RSS 821896 KiB. |
| #8 / #10 | `tests/api/ApiGetCall.test.jsx`, `tests/components/CippComponents/CippApiDialog.test.jsx` | 16 before/after hook contracts; fetched target 21 total pass. |

Focused ESLint and diff checks passed on changed source/tests. A missing `/usr/bin/time` caused one target-test launcher to exit before any tests ran; the unchanged command then passed using Python standard-library timing. No installation, retries of failed product tests, or weaker assertions were used.

Isolated branches/worktrees: #4 `fix/same-repository-pr-routing` (`/tmp/cipp-bootstrap`); #2 `fix/2-bulk-onboarding-tenant` (`/tmp/cipp-fix-bulk-tenant`); #3 `fix/script-save-errors` (T3 worker checkout `t3-3b2c7dbb`); #6 `fix/6-script-assignment` (`/tmp/cipp-fix-6-script-assignment`); #8 `fix/8-get-invalidation` (`/tmp/cipp-fix-8-get-invalidation`). Root alone serialized Git and merge operations. Returned worker checkouts and unknown scratch files were preserved.

Final integrated unit suite passed at frozen target `a6b8bbf063fc1eb6e7f24ffa151261c9b11c3f8f`: 66 files / 559 tests, exit 0, 189.46 s wall time, peak child RSS 1222336 KiB. It ran once from 2026-10-29T06:23:51.836656Z to 06:27:01.300238Z. The disposable production export passed at the same target, exit 0, 28.39 s, peak child RSS 2812736 KiB, from 2026-10-29T06:27:48.371278Z to 06:28:16.764858Z. Both commands ran once; no timeout or cleanup was needed. The capacity slot was released after observed completion. The portfolio granted one sequential slot with fresh >=8 GiB available before each stage, one worker, a 3 GiB JS heap, 360 s unit deadline, 240 s build deadline and 10 s owned-process cleanup. No concurrent large job or deployment is authorized by that slot.

## Current disposition

**PARTIAL — BLOCKED.** All accepted repairs in the current bounded source wave are merged and target-verified, and final local integration passes. This report is the remaining source delivery artifact; its merge/readback closes the bounded source wave. No audit exhaustion is claimed. Tracking issue #1 stays open for safe API/test-tenant acceptance, provider-blocked clipboard verification, Storybook development exposure, uninspected source and other explicitly unexercised coverage. The repository root owns follow-through; the portfolio coordinator owns account/environment decisions and immediate deployment-workflow restoration at source-wave handback. No new source side effect may assume a paused workflow after restoration.

## Live work reconciliation

At 2026-10-29T06:28:52Z, exhaustive native GitHub open-list queries used `per_page=100`, automatic pagination and full page retention. The issues endpoint returned one final page with one issue: tracking #1, owned by this root, remaining open for the explicit coverage gaps. The PR endpoint returned one final empty page. No unrelated open issue or PR was observed. Individual native readbacks confirmed #4, #5, #7, #9 and #10 merged; #2, #3, #6 and #8 are closed. None is closed-unmerged or unavailable.

After this report merges, root will repeat exhaustive open-work and individual sprint-PR readbacks and record the final report-merge SHA on #1. Current post-handback workflow state belongs in that same native record. No audit exhaustion, deployment, live Microsoft tenant outcome or security exploitability is claimed.
