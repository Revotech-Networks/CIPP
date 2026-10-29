# CIPP hardening and simplicity audit

This report tracks [issue #1](https://github.com/Revotech-Networks/CIPP/issues/1). The first source wave completed three P1 repairs and one separately authorized ponytail simplification. The second wave adds four P1 repairs, each merged, independently reviewed, target-verified and issue-closed. Combined wave-two validation passed 614 unit tests and the disposable production export. Wave three repairs baseline-stage data corruption in issue #21. Its source has merged, five regressions pass on the fetched target, and combined validation passed 619 unit tests plus a disposable production export. The earlier export quota failure and two unstarted recovery allocations remain recorded below. At report preparation, #21 remains open pending report delivery and closure. The repository-wide audit remains **PARTIAL — BLOCKED**, with ordinary candidate verification still in progress. Source reading does not establish live acceptance or audit exhaustion.

## Scope and ownership

The target is `Revotech-Networks/CIPP`, branch `main`. The audit began on 2026-10-29 UTC at `243060466dc49915e06f8283e61c242241bda9e7`, tree `4f6d6b27bb655e2d88e7eb64e4fd263e511a56c6`. Wave one ended at report target `3500bbf204407343df4cc3716c97af94129340d3`. Wave two ended at report target `e1501ec56e6fdc36f6a64fb78da65b0004d11f0f`. The current frozen source target is `e2be201a7dea5c6747b8d7a9d7bdb9c957890c97`, including wave-three PR #22.

The accountable repository root is T3 thread `mcp:2ee3d9a7-99c3-4765-bd51-b58df90ba199`, working on `audit/ponytail-20261029-c6fe948e`. The combined portfolio coordinator is `d4ba2482-746c-4bf0-a13d-667f3134c71f`. Root owns candidate admission, issue identity, Git, report updates, integration and merge decisions. Read-only discovery expanded to ordinary source across pages, components, hooks, utilities, layouts and data contracts. Isolated workers completed scoped implementations for #3, #6, #8, #12, #13, #15 and #21. Root implemented #2 and #14. Root inspected each patch, serialized the shared script-page changes, performed Git/PR/merge work and reran focused tests. Read-only dependency triage completed; its clipboard verification follow-up failed at a provider account-security control before producing proof. No implementation worker remains active.

The starting inventory contains 1,003 files under `src`, 111 under `tests`, 93 under `Tests`, 29 under `.github`, seven under `Tools`, four deployment templates and the root manifests/configuration. The current frozen source target has 1,714 tracked paths; six new regression modules account for the increase from the 1,708-path continuation base. The audit includes first-party code, tests and durable documentation. Generated assets, bundled vendor files, dependency caches and build output are excluded from implementation review. Inventory is not evidence of complete source inspection.

Initial remote inspection found no tracked `AGENTS.md`, `PROJECT.md`, standing-authority document or prior QA report. `CONTRIBUTING.md`, `SECURITY.md` and `.github/copilot-instructions.md` were read. Conventional Commits apply. Security disclosure must remain private until remediation. The audit makes no upstream changes or production deployments.

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
| `git fetch origin main` | Wave-one integrated target `a6b8bbf063fc1eb6e7f24ffa151261c9b11c3f8f`; wave-two target is recorded above. |
| `npm exec --yes --package=yarn@1.22.22 -- yarn install --frozen-lockfile --ignore-scripts --non-interactive` | Failed: lockfile needs updating. No source files changed. |
| `npm exec --yes --package=yarn@1.22.22 -- yarn install --pure-lockfile --ignore-scripts --non-interactive` | Passed in 56.23 seconds with peer/workspace warnings; does not rewrite the lockfile. This is not a reproducible frozen install. |
| `node_modules/.bin/vitest run --project unit --maxWorkers=1` | Baseline passed: 62 files, 513 tests, 175.29 seconds. |
| `node_modules/.bin/eslint .` | Baseline failed: 65 errors and 268 warnings; unrelated existing failures were not weakened or broadly rewritten. |
| Repository JSON validator | 292 files checked, zero invalid. |
| Production build/export at PR #5 head | Passed in a disposable archive with one Next worker and 3 GiB heap; no deployment. |

Root-owned command output is retained privately at `/tmp/cipp-audit-20261029/`; subsequent artifacts use `/tmp/cipp-audit-2ee3d9a7/` to avoid a shared scratch-name collision. Wave-three recovery records also use `/home/cohearn/.t3/scratch/cipp-audit-2ee3d9a7/` and the separate home export root recorded below. Unknown files and failed artifacts were preserved. Unit concurrency is limited to one worker. No stress or live tenant test has run. Builds must use an isolated disposable copy because the repository build script deletes `package.json` and `yarn.lock` after a successful export. References to a 3 GiB build heap describe the parent `NODE_OPTIONS`; Next removes that option from its static worker, so they do not establish a universal process or aggregate memory cap.

## Coverage

Ordinary continuation reads used `3500bbf204407343df4cc3716c97af94129340d3`, tree `c607adb8a0865a1c56ad52d1894f7f119c731ce5`. The root discovery checkout had the same tree at `842f966acce70ec848501cdf7cdf31d1e1865365`; it was fast-forwarded after all read-only workers completed. Later repair deltas received their own tests and reviews. File counts below are unique coverage, not summed worker overlaps.

| Area | Assessed coverage | Remaining evidence |
| --- | --- | --- |
| Pages | 383 of 384 files received full ordinary-source reads. `license.js` wrapper was inspected; its static license prose was classified. All six previously unfinished baseline/drift/alignment pages were subsequently read in full. | Report-builder clipboard sections remain excluded from security assessment. Source leads need root verification and classification. Live outcomes remain unverified. |
| Components | 359 of 363 files received full ordinary-source reads. `logo.js` wrapper and embedded image were classified; `CippTable/util-handleActionsList.js` is empty. | `CippRichTextField.jsx` and `quill-editor.js` remain parked. No blanket browser, PDF, accessibility or backend claim follows from other reads. |
| Core source and data | Original 255-file slice: 238 full reads, no partial files, 17 icon wrappers with static geometry excluded. Includes all hooks, utilities, contexts, stores, layouts, theme/style/library code and all 93 apparently unused dashboard-section bodies. `src/api/ApiCall.jsx` was also fully read. All 198 standards records and all 5,998 `M365Licenses.json` records received ordinary semantic assessment and consumer tracing. | Authoritative vendor currency, entitlement membership and policy recommendations remain unverified. No license-table generator/provenance exclusion was established. `RiskyPermissions.json` received schema-consistency assessment only. |
| Configuration, tools and documentation | Root read all 19 workflows, tracked tooling/scripts, root documentation, configuration and ordinary Storybook setup. Full tracked classification at the continuation base covered 1,708 paths. | Test/story bodies have focused reading, not comprehensive semantic assessment. Authoritative deployment/runtime behavior is limited to retained metadata. |
| Exclusions | 160 static image assets, 256 generated Intune buckets, 92 generated API shape snapshots, one generated test-run output, one vendored MSW file. Lockfile generation does not exclude manifest/resolution contracts. Consumers remain in scope. | No visual/accessibility adequacy claim. Generated shape fixtures do not prove a live response. |
| Structural data checks | Strict parsing checked 419 JSON files. One development deployment template failed parsing at line 299; no active supported caller or qualifying impact was established. Generated Intune bucket consistency checked 18,227 records with zero mismatches. | Parsing is not semantic review. The malformed development template remains an unadmitted low-impact lead. |
| Manifests and installation | Original manifest/lock mismatch and installation evidence retained. Read-only triage covered all 56 critical/high alert records, representing 49 advisories. No advisory was admitted from version range alone. | Reproducible frozen installation and advisory reachability remain unproved. No dependency installation ran in waves two or three. |
| Unit and lint | Baseline 513 tests, wave-one final 559 tests and wave-two final 614 tests passed. Wave-three candidate and target pass all five stage-identity regressions. Its combined suite passed 619 tests across 72 files, and its disposable export passed after storage recovery. Changed-file lint passes, with retained pre-existing warnings. | Full lint retains the 65 errors and 268 warnings observed at baseline. Passing unit and export checks do not establish the runtime outcomes below. |
| UI, accessibility and Storybook | Original static-export browser proof reached hydrated assets but local authentication/API routes returned 404. Test server and tab were closed. | Safe API/test tenant, authenticated journeys, relevant keyboard/accessibility checks and Storybook runtime remain unavailable or unexercised. |
| API, isolation and recovery | Mounted frontend tests intercept transport and exercise actual forms, queries and payloads. Backup restore proof sends no live request. | Backend authorization, live tenant isolation, persistence, recovery, upgrades and rollback require an authorized isolated API/test tenant. |
| Concurrency, stress and performance | Focused tests cover tenant changes, pending/error/partial responses, delayed callbacks and immediate/delayed cache reopening. | No product-wide stress, production load or hardware proof. These gaps do not block independent ordinary source assessment. |

Exact private read manifests and immutable worker returns are retained under `/tmp/cipp-audit-2ee3d9a7/continued-*-files.txt` and `continued-*-result.md`. Search matches alone receive no full-read credit. The failed first pages4 slice remains in the history alongside its successful six-file completion. No coverage gap was erased by a continuation.

## Findings and rejections

| Item | Disposition and proof |
| --- | --- |
| [#2 bulk onboarding tenant](https://github.com/Revotech-Networks/CIPP/issues/2), P1 | Closed after [PR #5](https://github.com/Revotech-Networks/CIPP/pull/5), merge `c989b4105781dee80dc1abb0b8dc046114aebb84`. Original source failed two mounted-component tenant-switch tests. Four final tests pass at exact head and fetched merge. Hosted Code/Security clean; build and focused lint pass. |
| [#3 failed script saves](https://github.com/Revotech-Networks/CIPP/issues/3), P1 | Closed after [PR #7](https://github.com/Revotech-Networks/CIPP/pull/7), head `57db5e4bed728ae9bb8d3991a7ad9aa0ecd21c28`, merge `91b317ea9eae3ec4d54e63289fa3321c442dd673`. Exact-head Code/Security clean; branch-policy check passed. Fetched-target seven save tests and four prior tenant tests passed. Seven real-page tests pass for HTTP/network failures, retained dirty state, retry, cached-error result and four script types. Focused lint passes. |
| [#6 bulk script assignment](https://github.com/Revotech-Networks/CIPP/issues/6), P1 | Root executed all four actual formatters: array inputs lose ID/type/tenant. [PR #9](https://github.com/Revotech-Networks/CIPP/pull/9), head `c193700c6b2cf2f7e92def4155737a4e7b4065be`, merged at `15ce88c8603f739c61576c202cdb3b973c6cfc15`; issue closed. Hosted Code/Security clean. Original code failed 14/19 tests; candidate passed 19/19, and fetched target passed 26/26 assignment-plus-save regressions. No backend write ran. |
| Table selection migration lead | Rejected: actual toolbar resets selection when data changes. Root real table rerender proof passed; no duplicate protection added. |
| [#8 API GET invalidation duplication](https://github.com/Revotech-Networks/CIPP/issues/8), ponytail `reuse` | [PR #10](https://github.com/Revotech-Networks/CIPP/pull/10), head `571e29a9bab8d2cc5ff1ae53c0a546051b381cdd`, merge `a6b8bbf063fc1eb6e7f24ffa151261c9b11c3f8f`, removes 26 production lines by sharing the same successful invalidation block. Sixteen actual-hook contract tests pass before/after and on root uptake. Hosted Code/Security clean; fetched target passed 21/21 API-plus-dialog tests and issue closed. No excellence severity assigned. |
| Standards template bulk formatter | Withheld lead: bulk loses TemplateId, but supported behavior and backend effect need verification. No accepted severity or issue. |

Completed wave-one and wave-two counts are P0: 0, P1: 7, F0: 0, F1: 0, plus one separate ponytail repair. Eight finding issues are closed. At report preparation, wave-three issue #21 remains open pending report landing and issue closure; its passing source and integration proof do not yet increase the completed count. Twelve prior sprint PRs are merged, including bootstrap and reports. No source-review correction rounds have been spent on the accepted repairs. Test-fixture and export-recovery corrections are retained below. Bootstrap, reports, tracking work, unadmitted leads and P2 notes do not count.

### Wave-two accepted repairs

| Issue and PR | Reviewed head / merge | Repair and proof |
| --- | --- | --- |
| [#12 backup string preservation](https://github.com/Revotech-Networks/CIPP/issues/12), [PR #16](https://github.com/Revotech-Networks/CIPP/pull/16), P1 | `34791a94c0a9cc02682b6ed276cbd160da6660ec` / `fb9053b9743a425af52e5954a54104486c28b519` | A quote/escape-aware scanner protects string contents across all three cleanup substitutions and structural bracket counting. Baseline had 15 definite failures and 18 passing controls. Candidate and fetched target passed all 33 validator and mounted restore tests. |
| [#13 retention tenant binding](https://github.com/Revotech-Networks/CIPP/issues/13), [PR #17](https://github.com/Revotech-Networks/CIPP/pull/17), P1 | `5ee66fc6849984ed379e2f1aac7934e040a4f2c1` / `ded507c2423a2714d2a97208eb701e6188cbd680` | Creation follows the current tenant and clears old-tenant policy tags. Edit paths remain unchanged. Baseline had five failures and four controls. Candidate and fetched target passed nine actual-page cases, including repeated switches, delayed/error tag responses and edit controls. |
| [#14 Secure Score current-query state](https://github.com/Revotech-Networks/CIPP/issues/14), [PR #18](https://github.com/Revotech-Networks/CIPP/pull/18), P1 | `800576f34d0f3d511f3d6749e7f6a02fb0e013bc` / `b358e0bbdd09aaa10df8d1402b2ec3c3ad38e9f8` | Derived data and success state replace independent retained state. The previous tenant disappears during current pending, failed or partial queries. Baseline had five failures and three controls. Candidate and target passed eight new hook/page tests plus nine existing report/card tests. |
| [#15 report-template detail cache](https://github.com/Revotech-Networks/CIPP/issues/15), [PR #19](https://github.com/Revotech-Networks/CIPP/pull/19), P1 | `e8e306ad41f76762c2179dde7010a27ecb187400` / `8f37bf174511fd13d8a43b2425c9f62cf6ffae84` | Successful save synchronously removes the exact builder detail cache identity while preserving delayed list invalidation. Baseline had two failures and three controls. Candidate and target passed five actual Page-function lifecycle tests plus 33 report-setting tests. Editor/block UI is stubbed. |

Each issue was admitted and published before implementation, with impact, distinctness and acceptance criteria. Independent hosted Code and Security reviews completed at each exact head. PRs #16, #17 and #19 were clean. PR #18 retained one confirmed nonblocking P2: the missing aggregate `isError` can leave Executive preview loading when a current score query fails. The missing error flag pre-existed; cold-query failure already exposed it. Root inspected both hook revisions and the consumer, retained the [review disposition](https://github.com/Revotech-Networks/CIPP/pull/18#issuecomment-6491901501), and made no extra repair or issue under the P0/P1 cutoff. This review is complete with a finding, not clean.

All four issues are closed after fetched-target proof. Actual hosted CI on each PR was one successful branch-policy check and four skipped owner-filtered jobs. No admin override, check removal or workflow edit accompanied these repairs. The target contains all reviewed heads, and each affected path matched its reviewed candidate after serial merges.

### Wave-three baseline stage identity

[Issue #21](https://github.com/Revotech-Networks/CIPP/issues/21), P1, repairs state reassignment after deleting a middle baseline stage. Independent reproduction mounted the unchanged Page, StagePanel, standard controls and serializer. An unchanged-order control preserved C's 30-day condition, AND logic and limit 30. Removing B made C display and submit B's 7-day condition, additional manual condition, OR logic and limit 20 under C's name. No backend request ran.

[PR #22](https://github.com/Revotech-Networks/CIPP/pull/22) assigns stable editor-only stage IDs on load, add and copy. React keys and serializer registration, cleanup and lookup use that identity. Surviving drafts retain their own values, and explicit API serialization excludes editor IDs. The source delta is 15 additions and nine deletions in `src/pages/tenant/baselines/template.jsx`; the only other changed file is `tests/pages/BaselineStageIdentity.test.jsx`.

Reviewed head `6d0c3d724a05beb6d9f1811d8698fc24cd29dfea` merged normally at `e2be201a7dea5c6747b8d7a9d7bdb9c957890c97` on 2026-10-29 at 10:21:38 UTC. Both hosted Code and Security reviews completed without findings on that exact head. The merge tree `34a1031e7d878178fbd0f0057857c868f9ea6ecd` equals the reviewed candidate tree. Actual CI was one branch-policy success and four owner-filtered skipped jobs. No admin override or protection change occurred.

Five regressions cover unsaved drafts and ordered payloads, repeated remove/add/copy, final-survivor edits, template switching, and new/clone contracts. API, remote picker and presentation dependencies use synthetic mocks; actual React reconciliation, RHF forms, numeric/switch controls, standard dialog and serialization remain mounted. The adjacent Copy Stage current-draft and dirty-warning leads are outside this repair. Backend persistence and a live browser journey remain unverified.

### Unadmitted ordinary leads

The following groups retain unadmitted candidates, proof plans and explicit P2 dispositions. They contribute no completed finding count. Root owns lead checks, deduplication, runtime proof and disposition before any future issue. They remain outside the completed repair waves and the one-issue third wave.

| Group | Retained observations and next proof |
| --- | --- |
| Bulk dispatch and payload shape | Immediate custom actions receive nested `original` and can also mount an auto-submit dialog. Separate single-row formatters mishandle arrays in license/application-template/library actions. Reproduce through the actual toolbar/dialog. Earlier scratch toolbar probes had harness timeouts and are not defect proof. |
| Form validation and pending state | Scheduler, transport/shared mailbox, application/HVE and bulk onboarding callers bypass declared validation or use obsolete mutation loading flags. Prove zero invalid requests and one pending request without changing backend contracts. |
| Tenant/entity state | Additional create drawers and Safe Links/SharePoint forms capture tenant defaults. JIT retains old template selections. User/group/application detail loaders retain related results after entity changes. Deduplicate against completed tenant repairs, then exercise mounted navigation. |
| Cache identity and mutation | Connector/contact selectors share a resource key; CIPP users mix plain/infinite query shapes; several grouped/detail caches invalidate different identities. Quarantine display and diagnostic redaction mutate cached data. Prove with one QueryClient and actual consumers. |
| Imports and multi-step actions | Import Next/Back clears rows, Autopilot uses raw CSV splitting, vacation completion treats one successful action as complete, assignment-filter type retains an incompatible platform. Prove payloads, retry counts and supported input controls. |
| Administrative controls | Worker priority formatting, imported snapshots falling into live queues, guided log filters, table-maintenance stale filters, webhook correlation/poll lifetime and repeated Force Sync have source-supported failure paths. Intercept transport only. |
| Record actions and rule forms | Missing detail-card data disables or malforms actions; dialog recursion changes literal arrays to objects; transport domain exceptions bind ordinary fields; catalog memoization retains the old Force option. Verify actual selected records and controls. |
| Baseline/drift/report correctness | Stage index identity is now accepted as #21 above. Separate draft copying/dirty tracking, drift comparison/selection and rounded full-compliance status still need focused proofs. Alert condition deletion, CA editor switching, Geo IP result actions and BPA field/value handling also retain source evidence. Some drift/instance leads require supported response shapes. |
| Dashboard and custom tests | Actual-source React server rendering confirmed that failed or empty dashboard queries display demo counts and timestamp under the selected tenant and suite. Seven controls passed, including pending, valid, empty-counts and AllTenants cases. Root classified the demonstrated impact as P2, outside excellence admission; no issue or repair was created. Transient custom-test parameter dirty-state handling remains unverified. |
| Branding, PDF and diagnostics | Upload synchronization can reset edits, presets omit or ignore options, preview/download inputs differ, and imported diagnostic readiness follows a failed live query. Severity and actual consequences remain unassigned. |
| Ordinary data contracts | Audit property types lack matching inputs; malformed JIT/supplemental-license GUIDs reach selectors; duplicate Minsk timezone values affect hydration labels. Standards defaults also use an unsupported property or a value outside radio options, and some license plan labels conflict with their identifiers. Canonical identifiers/names and supported type contracts are prerequisites for repair. |
| Simplicity | Unused simulated backup state/timer and duplicate desktop Columns menu are separate ponytail candidates. Verify consumers and behavior preservation before admission. |

The independently executed navigation probe confirmed hidden permitted leaves, but demonstrated only a P2 navigation obstruction. It is not an excellence finding. Other withheld leads lack an active caller or authoritative response contract. No ordinary source gap is attributed to missing live access when source reading or mocked verification can proceed.

Dependency triage found no demonstrated deployed Next server/image/cache surface under `output: export` and `images.unoptimized: true`. Other advisory-specific preconditions were not established for the inspected browser JSON callers, sanitizer defaults and build/test tools. Editor clipboard handling and Storybook development access remain unaccepted verification leads. The clipboard worker received an explicit provider account-security refusal; root retained it without replay, route/model/account substitution or exploitability admission. The portfolio coordinator owns any legitimate account-readiness decision. This gap does not extend the deployment pause after routine source delivery. No exploit details are published; private advisory inventory was empty at readback.

## Source delivery window

The Azure Static Web Apps workflow `.github/workflows/azure-static-web-apps-kind-sand-0c268c510.yml`, ID `99582982`, deploys on pushes to main and PR opened/synchronize/reopened events; closed PRs close environments. Native metadata confirmed its deployment secret name exists, zero GitHub environments, and the [starting-revision deployment](https://github.com/Revotech-Networks/CIPP/actions/runs/32046590648) succeeded. No secret value was read.

Chris explicitly approved the bounded CIPP/CIPP-API source-only plan in the portfolio thread, native position 219, at 2026-10-29T05:35:39.186Z. Root independently read the full decision/proposal and the coordinator's workflow-window evidence. The coordinator alone temporarily paused the relevant deployment and PR auto-closer workflows and verified no in-flight runs before/after. Root independently read back the disabled CIPP workflows before affected events. No validation or protection was removed.

[Bootstrap PR #4](https://github.com/Revotech-Networks/CIPP/pull/4) added only a same-repository exemption to the existing external-fork rejection. Reviewed head `ef65a00a5302474ea08b14156bf91010db5c9612` merged normally at `17d7e7967bef45a9c399441ce86af6ad0eeb06ba`. Hosted Code and Security review completed clean. All 48 policy truth-table cases passed on both candidate and fetched target. The coordinator restored auto-closer `149812178` to active after this proof. The coordinator restored deployment `99582982` to active after wave-one report PR #11 landed at `3500bbf204407343df4cc3716c97af94129340d3`. Native readback and no-dispatch/no-replay confirmation closed that window. For wave two, the coordinator paused only `99582982` at 2026-10-29T08:16:00.018837Z and verified no in-flight deployment runs before and after. Report PR #20 landed at `e1501ec56e6fdc36f6a64fb78da65b0004d11f0f`; the coordinator restored deployment at 09:13:16.965928Z. Root independently read back both workflows active. No new deployment run ID, dispatch or replay was observed.

For wave three, the coordinator verified a source-only window at 10:10:54.634357Z. Only deployment `99582982` was paused; auto-closer `149812178` stayed active. Fresh trigger and before/after run reads found no in-flight deployment or new run ID. The window covered #21 and this report only. Root rechecked the states before merging #22. The export quota failure then stopped the wave before report delivery. At 10:51:49.670822Z, the coordinator restored deployment and read back both workflows active, with no new or in-flight deployment run, dispatch or replay. The separately allocated local export recovery ran while the source window remained closed. This report still requires a new, verified report-only window before push, PR or merge events. The coordinator owns that window and immediate restoration after landing or an external stop; final observed states belong in the tracking-issue receipt.

GitHub reports no branch protection for main and an empty ruleset list. Four validation jobs were SKIPPED by existing owner filters on all source PRs, not executed successes. After bootstrap restoration, the branch-policy check passed on #7, #9, #10, all four wave-two repairs and #22. Local checks and required independent reviews remain binding. No deployment, production mutation or protection bypass occurred.

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

Wave-one integrated unit suite passed at frozen target `a6b8bbf063fc1eb6e7f24ffa151261c9b11c3f8f`: 66 files / 559 tests, exit 0, 189.46 s wall time, peak child RSS 1222336 KiB. It ran once from 2026-10-29T06:23:51.836656Z to 06:27:01.300238Z. The disposable production export passed at the same target, exit 0, 28.39 s, peak child RSS 2812736 KiB, from 2026-10-29T06:27:48.371278Z to 06:28:16.764858Z. Both commands ran once; no timeout or cleanup was needed. The capacity slot was released after observed completion. The portfolio granted one sequential slot with fresh >=8 GiB available before each stage, one worker, a 3 GiB JS heap, 360 s unit deadline, 240 s build deadline and 10 s owned-process cleanup. No concurrent large job or deployment is authorized by that slot.

### Wave-two regression and review record

All four candidates preserve existing API scopes and return shapes. Deterministic mounted/frontend integration tests close the accepted criteria. No separate behavior-model or Oracle stage was selected for these Bounded repairs. Hosted Code plus Security was the single independent source-review stage; no duplicate local judge ran. Native PR watches handled pending reviews without polling.

Fetched-target commands used Node 22.23.3, `--max-old-space-size=3072`, `timeout --kill-after=5s 90s`, and `node_modules/vitest/vitest.mjs run --project unit --maxWorkers=1 --no-file-parallelism` with these paths:

| Issue | Test files |
| --- | --- |
| #12 | `tests/utils/BackupValidation.test.js`, `tests/pages/BackupRestoreValidation.test.jsx` |
| #13 | `tests/pages/RetentionTenant.test.jsx`, additionally `--testTimeout=10000` |
| #14 | `tests/hooks/use-securescore.test.jsx`, `tests/components/ExecutiveReportButton.test.jsx`, `tests/components/CippComponents/SecureScoreCard.test.jsx` |
| #15 | `tests/pages/ReportBuilderTemplateCache.test.jsx`, `tests/components/ReportBuilder/reportSettings.test.js` |

| PR | Passing tests | Actual UTC execution | Peak child RSS |
| --- | --- | --- | --- |
| #16 | 33 / 33 | `2026-10-29T08:24:08.114819+00:00` to `2026-10-29T08:24:11.578053+00:00` | 373880 KiB |
| #17 | 9 / 9 | `2026-10-29T08:28:23.917661+00:00` to `2026-10-29T08:28:35.522480+00:00` | 699176 KiB |
| #18 | 17 / 17 | `2026-10-29T08:35:20.398251+00:00` to `2026-10-29T08:35:28.463017+00:00` | 510852 KiB |
| #19 | 38 / 38 | `2026-10-29T08:56:18.258208+00:00` to `2026-10-29T08:56:21.680124+00:00` | 371468 KiB |

Candidate scoped ESLint exited 0 for every repair. Backup and Secure Score produced no diagnostics. Retention retained one untouched edit-effect warning; report builder retained six warnings on unchanged lines. The backup baseline fixture initially relied on a Node error position unavailable for its token. Correcting the fixture before source edits exposed the existing prefix-recovery corruption. Retention tests corrected a repeated selection of an already selected option and moved external test handles into an effect after lint feedback. The report-cache test scoped a deferred GET mock so a later refresh could complete. None of these corrections weakened assertions or expanded the production repair.

Implementation branches were `fix/issue-12`, `fix/issue-13`, `fix/14-securescore-tenant` and `fix/cipp-report-cache`. Worker checkouts were `t3-6b5d9b0d`, `t3-ae8f48b6` and `t3-c1044ee5`; the root Secure Score checkout was `/tmp/cipp-fix-14-securescore`. All four final candidates share parent `3500bbf204407343df4cc3716c97af94129340d3`. The root alone performed Git operations and serialized merges. Reparenting from the equivalent discovery tree did not change worker candidate bytes.

Wave-two combined validation passed once at `8f37bf174511fd13d8a43b2425c9f62cf6ffae84`, tree `c164ab07ab8b6359effb480e3b26f0904bc9e880`:

| Stage | Result | Actual UTC execution | Wall time / peak child RSS |
| --- | --- | --- | --- |
| Full unit suite | 71 files, 614 tests, exit 0 | `2026-10-29T09:02:52.339949Z` to `09:06:17.744508Z` | 205.404559 seconds / 875472 KiB |
| Disposable production export | Exit 0 | `2026-10-29T09:07:29.014299Z` to `09:07:57.793233Z` | 28.778934 seconds / 3107556 KiB |

Exact commands, using installed Node 22.23.3 first in `PATH`, were:

```sh
NODE_OPTIONS=--max-old-space-size=3072 timeout --kill-after=10s 360s node_modules/.bin/vitest run --project unit --maxWorkers=1
NODE_OPTIONS=--max-old-space-size=3072 CIRCLE_NODE_TOTAL=2 NEXT_TELEMETRY_DISABLED=1 timeout --kill-after=10s 240s npm run build
```

The unit worktree was clean at the frozen target. All 1,713 archived blobs and modes matched that same target before the build. The existing Next export-trace patch was already present; no dependency installation/change was needed. Fresh available memory was 16728420 KiB before units and 16834576 KiB before export. Both owned process groups were absent afterward, so no cleanup or retry ran. The capacity slot was released immediately after observed terminal completion. The export generated 357 static pages and exported 358 entries using one worker. Existing static-export redirect warnings remain. Browser-simulation warnings in the unit output do not establish browser support.

The portfolio granted exactly one sequential 360-second unit stage and conditional 240-second disposable export stage, with fresh 8 GiB available before each, one worker, 3 GiB JS heap and at most 10 seconds of owned process-group cleanup. No deployment, installation or service is part of that proof.

### Wave-three regression and review record

The implementation worker used `fix/baseline-stage-identities` in `/home/cohearn/.t3/worktrees/CIPP/t3-10543998`. Root alone committed, pushed and merged. The source changed once after reproduced failures; no review correction round was needed. The worker returned its package before root committed it.

The first baseline run had four selector failures and a passing clone control. Those were test setup failures, not product evidence. Restricting MUI locators to input/select elements exposed two product failures and two passing controls, with one remaining dialog-exit timing failure. Waiting for the actual dialog to disappear then reproduced the third failure: after deletion, a surviving copy showed 19 days instead of its own 29-day draft. The test copies the saved/default stage before editing it, so it does not enforce the separate Copy Stage defect. The first repaired run passed four cases; the fifth assumed an unrelated default posture. Explicitly setting the desired posture through the actual switches corrected that test without another source change.

Final candidate proof passed five tests at 10:02:20.024220035–10:02:34.326007321 UTC, Vitest duration 13.23 seconds. Scoped ESLint passed with no diagnostics at 10:02:42.944508683–10:02:44.073993756 UTC. Worker peak RSS was unavailable. Some earlier test runs emitted existing nested-button, `creatable` and Tabs `act` warnings. The first displayed DOM diagnostic was partly truncated; subsequent results and the correction history were retained.

Root fetched the merge and reran all five tests from a clean detached worktree. The command passed at 10:22:12.600138–10:22:27.195574 UTC, 14.595442 seconds wall time, peak child RSS 971568 KiB. It used installed Node 22.23.3, a 3 GiB heap and one worker:

```sh
env -u NODE_COMPILE_CACHE NODE_DISABLE_COMPILE_CACHE=1 timeout --kill-after=3s 90s /home/cohearn/.local/share/mise/installs/node/22.23.3/bin/node --max-old-space-size=3072 node_modules/vitest/vitest.mjs run --project unit tests/pages/BaselineStageIdentity.test.jsx --pool=threads --maxWorkers=1 --no-file-parallelism --no-cache
```

The matching candidate lint command used the same prefix with `node_modules/eslint/bin/eslint.js src/pages/tenant/baselines/template.jsx tests/pages/BaselineStageIdentity.test.jsx`. The focused slot ended; no process remained.

### Wave-three combined validation and storage recovery

Both passing stages used source `e2be201a7dea5c6747b8d7a9d7bdb9c957890c97`, tree `34a1031e7d878178fbd0f0057857c868f9ea6ecd`. The 619-test unit result and five-test fetched-target result were reused during export recovery because the source and test inputs stayed unchanged. No unit rerun, installation, dependency patch or live service was part of recovery.

| Stage | Result | Actual UTC execution | Wall time / peak child RSS |
| --- | --- | --- | --- |
| Full unit suite | 72 files, 619 tests, exit 0 | `2026-10-29T10:46:05.134487Z` to `10:49:42.987053Z` | 217.852571 seconds / 1247848 KiB |
| Disposable home-directory export | Exit 0, 357 static pages, 358 export entries | `2026-10-29T11:59:21.730680Z` to `11:59:50.403103Z` | 28.672425 seconds / 3006344 KiB |

The unit command was the same full-suite command recorded for wave two, under a fresh 360-second allocation. Available memory was 16955508 KiB before units. Its owned process group was absent after completion.

The original `/tmp` export started at 10:49:54.064320Z and failed during a webpack write with errno -122. Terminal-receipt persistence also failed with `OSError 122: Disk quota exceeded`, leaving an empty receipt. The launcher exited 1, but the actual child exit, exact end time and peak RSS were not retained. Its owned group was observed absent at 10:51:03.069601Z. The failed archive, log and empty receipt remain intact. Read-only storage inspection found `/tmp` mounted as tmpfs with `usrquota`; filesystem free space did not establish this user's remaining quota. The exact quota threshold was not measured.

Recovery used the private root `/home/cohearn/.t3/scratch/cipp-wave3-export-home-2ee3d9a7-20261029-v1/` on the home filesystem. Fresh archive preparation verified all 1,714 tracked blobs and modes, then linked only the existing dependencies. A preparation-only state-label mismatch had first stopped before archive creation; the authorized preparation then completed once. Independent storage-plan review required explicit npm `--cache` and `--logs-dir` paths because a separate logs setting could otherwise escape the owned root. The corrected plan also bound temporary, XDG, SWC-cache and output paths, preserved `HOME`, checked ancestor lockfiles and confirmed the existing native SWC binding without a fallback download. Syntax checks and five mocked launcher fault tests passed before execution authority was granted.

Two home-export allocations ended without starting any subprocess or creating an export process group. Allocation v1 refused an unsupported inherited `XDG_CONFIG_DIRS` at 11:38:02.092632Z, exit 75. A complete names-only inventory identified 14 unsupported inherited XDG settings. The coordinator approved omitting those names from the controller invocation; none was present in the already-frozen child environment. Allocation v2 then refused its expired latest-start deadline at 11:55:30.666488Z, exit 75. Both refusal receipts remain unchanged. Each subsequent invocation required a distinct written allocation; no guard or frozen launcher was relaxed.

Allocation v3 passed fresh source, archive, dependency, native binding, npm path, lockfile, environment, admission, readiness and memory checks. Available memory was 16999944 KiB immediately before export. The exact timeout command, under the reviewed child environment, was:

```sh
timeout --kill-after=10s 240s /home/cohearn/.local/share/mise/installs/node/22.23.3/bin/npm --cache /home/cohearn/.t3/scratch/cipp-wave3-export-home-2ee3d9a7-20261029-v1/cache/npm --logs-dir /home/cohearn/.t3/scratch/cipp-wave3-export-home-2ee3d9a7-20261029-v1/logs/npm run build
```

The working directory was that root's `archive/`. The frozen environment retained `NODE_OPTIONS=--max-old-space-size=3072`, `CIRCLE_NODE_TOTAL=2` and disabled Next telemetry. This configures one static worker; that worker removes the heap option. The reported RSS comes from `wait4` of the exact timeout command, including descendants it reaped, and is not aggregate concurrent memory usage. The export completed before its deadline. Its owned group was absent without a cleanup signal, the launcher exited 0, and terminal output preceded the successfully persisted receipt. Capacity was released. No deployment or live API outcome follows from the export.

The passing unit receipt is retained as `wave3-final-unit-receipt.json` under the audit's home scratch, SHA-256 `3a9336369653dd29f9a66465b5369ad37d9535986989e2258164f0c4667d98f5`. The home export's `receipts/export.json` has SHA-256 `06b1e97b51656a1e5688b5e2a9c83b9713cca6ef928ca5cf0fb913f58b459b0b`; its complete `logs/export.log` has SHA-256 `14787e61aad7d8b8514f041e232272f1226e3a5d9fcd2b227f11a72ffabe087f`. Root read both back at 12:00:18.454727Z. The coordinator independently verified the receipt, log, 357 HTML files and clean source checkout. These artifacts supplement the preserved failed attempt and refusals.

## Current disposition

**PARTIAL — BLOCKED.** The seven prior P1 repairs and separate ponytail repair are complete. Wave-three #21 is merged; five fetched-target regressions, 619 unit tests and the disposable export pass. At report preparation, this report's delivery and #21 closure remain pending, so the completed count stays unchanged. Ordinary page, component and core/data read coverage is recorded above. The repository-wide audit continues with unadmitted ordinary leads and precise test/runtime gaps. Safe API/test-tenant acceptance and the provider-refused clipboard investigation remain separate blocked obligations. No exhaustion is claimed.

Root owns ordinary follow-through, classification and any later finite repair proposal. The portfolio coordinator owns environment/account decisions and deployment `99582982` restoration. Both workflows are restored active; a report-only delivery window remains a prerequisite for affected push, PR and merge events. Read-only discovery and unrelated gaps cannot prolong that future pause.

## Live work reconciliation

Wave-one report PR #11 landed at `3500bbf204407343df4cc3716c97af94129340d3`. Wave-two report PR #20 landed at `e1501ec56e6fdc36f6a64fb78da65b0004d11f0f`. Each window ended with coordinator-verified workflow restoration. The third source window also closed with restoration after the export quota failure. Its successful local recovery did not reopen source delivery.

Earlier exhaustive open-list reads at 06:28:52Z and 09:03:20.803527Z each found only tracker #1 open and no open PR. The wave-two review reconciliation at 09:05:08Z retained PR #18's P2. Those historical results remain separate from later delivery readbacks.

At 2026-10-29T10:46:59.769270Z, live GitHub open-list reads used `per_page=100`, complete pagination and full page retention. The issues endpoint returned one final page containing tracker #1 and accepted repair #21. The PR endpoint returned one final empty page. Individual readbacks confirmed PRs #4, #5, #7, #9, #10, #11, #16, #17, #18, #19, #20 and #22 merged. Issues #2, #3, #6, #8, #12, #13, #14 and #15 were closed. No closed-unmerged, unavailable or unrelated open item was observed.

Paginated conversations, inline comments and review submissions were reconciled for all twelve PRs. The only posted finding remains the retained PR #18 P2. All twelve PRs are registered in the root's native app thread and completed watches are off. The historical open-list read above is not a final delivery readback. After a fresh report-only window is verified, root will register this report PR, reconcile any posted feedback, satisfy normal checks and verify its fetched merge and unchanged non-report source. Issue #21 closure, exhaustive open-work and individual sprint-PR reads, and a final report SHA/count/restoration receipt on #1 remain delivery obligations. Tracker #1 stays open with this root as owner for the remaining coverage and ordinary candidate dispositions. No audit exhaustion, deployment, live tenant outcome or security exploitability is claimed.
