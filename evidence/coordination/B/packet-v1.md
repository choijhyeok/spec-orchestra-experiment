# B v1 task packet

Common spec: [original-experiment-root]/common/spec-v1.md
Workflow: common/protocol-A.md + protocol-B.md; read only those and own arm files. Do not read another arm.

Spec v1 / API + UI contract v1. Baseline commit a96fdf66038c1775e1ead91d0f949c12415ccf00. Branch base will include docs/ui-contract-v1.md; read it and inspect `/baseline`/shared assets before implementing. Shared CSS/JS define shell, nav, width, font, spacing and components and must be consumed. Main owns shared files/server/seed; request changes via message. No subagents. No packages, external APIs, push, PR, deployment, security changes. Only local synthetic files. Work solely in assigned task worktree and feature-owned paths.

Implement only assigned task under v1, meaningfully test API + runnable UI using assigned localhost port, self-review actual diff, and commit. Preserve stdout/stderr and browser/API evidence in absolute arm/evidence task-specific files, never repo/evidence. Existing Playwright: require('[user-home]/.npm/_npx/bd29c0cb7c2b284c/node_modules/playwright'), executablePath='[user-home]/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell'. Local server/browser may require exact scoped escalation if sandbox denies. Do not bypass rejection.

Final submission: task/spec/contract versions, branch/base/candidate SHA, UTC ready time, owned file list, meaningful tests and stdout/stderr paths, self-review findings, any blockers. Stop after v1 candidate commit. Do not implement unseen v2 or request final approval/integration. Budget ~8min v1 target; whole arm active25min including TASK0. Main will await common change barrier; workers exit.
