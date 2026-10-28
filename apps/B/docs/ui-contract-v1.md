# UI / API contract v1

Spec: common/spec-v1.md. Contract: v1. Baseline commit: a96fdf6.

Every page uses UTF-8, responsive viewport, `/shared.css`, deferred `/shared.js`, `<header class="site-header" data-shell></header>` and a `<main>` containing task content. shared.js supplies identical Request Desk brand, navigation and aria-current. Do not duplicate or modify the shell in task code.

Use `.stack` for 24px vertical groups, `.card.stack` for content panels, `.field` wrapping label and input, `.actions` for actions, `.muted`, `.error`, `.success` for messages. Native input/button and `.button` links consume shared components. Main max-width is 960px, system 16px, mobile outer spacing 16px. Use DOM textContent for user data. Task CSS only when necessary; shared changes require main coordination.

TASK1 POST payload `{title, contact}` and response `{request:{id,title,contact}}`; TASK2 GET query q and response `{requests:[{id,title,contact}]}`. Both feature adapters return `(status, JSON-compatible dict)`. Records mutable list from server scaffold. Spec contains limits and validation requirements. No dependence on other worker implementation.
