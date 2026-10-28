# TASK1 independent specification review

Recorded UTC: 2026-10-27T17:05:05.364505+00:00
Candidate: 170c1a1e083402e6ce1875cea1df6276d3b4cc8f
Compared with common original base: 2656ef69b087b5dde3f65cde4d83bc8e350aadcf
Reviewer did not implement TASK1. No other arm or task results inspected.

## Verdict: PASS for TASK1 scope

Read common/spec-v1.md followed by common/spec-v2.md before the actual candidate/base diff and complete TASK1 code. No specification defect found; no blocker and no severity/file:line finding.

- features/create_api.py:9-40 implements nested requester name/email, trim and inclusive title/name limits, basic email shape, 422 string errors, contact-only rejection, server UUID, in-memory append only after validation, and output restricted to id/title/requester. A valid v2 payload with an extra contact key is harmlessly ignored; the specification specifically requires rejection of contact-only v1 requests.
- web/create.html:19-40 and web/create.js:25-74 provide exact labels/button, matching client checks, meaningful inline errors/focus, keyboard form use, busy-state duplicate protection, explicit success and /requests link. Dynamic request title and errors use textContent; submitted HTML is plain data.
- Existing main-owned shared.css/shared.js supply the common shell/nav/current location, 960px main, system 16px type, 24px groups, #2563eb primary, 8px corners, and >=40px button. Existing worker browser script/result/stdout and desktop/mobile screenshots support the required viewport/no-overflow behavior. Independently viewed task1-v2-desktop.png and task1-v2-mobile-success.png and inspected the browser assertions rather than relying on a PASS label alone.
- seed.json contains the prescribed v2 synthetic records without contact; worker records main-owned coordinated seed cherry-pick.

Independent verification: seven Python unittest methods PASS; node --check web/create.js PASS; git diff --check BASE CANDIDATE PASS; 22 additional direct create() boundary/type/email/legacy/nonmutation/HTML cases PASS. Raw commands/results saved in review-task1-spec-checks.json. Independent checks used no server, browser/network, installation, product edits, or commits.

Integration limit: this independent TASK1 worktree intentionally has no TASK2 implementation. Full create -> list -> email search -> reload, list initial data/name search/empty state, and both pages' integration belong to the parent integration gate. This is not a TASK1 blocker or a claim that those end-to-end checks have run.

This specification verdict was saved before starting the distinct code-quality review.
