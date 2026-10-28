# UI / API contract v2

Authoritative input: common/spec-v2.md (sha256 eb90c3bed2bc4fddfe74b0c2bb63c6138097948ba53c48b6a1a03967332bd31b), applied on top of spec-v1. Replaces contract v1 data/API fields; common UI contract in ui-contract-v1.md remains.

Request = `{id: string, title: string, requester: {name: string, email: string}}`. No contact field in response or seed. POST `{title, requester:{name,email}}` produces 201 `{request:Request}`. Invalid/missing types, title/name limits, missing or basic-invalid email produce 422 `{error:string}`; legacy contact-only payload rejected. Trim title/name/email before validation/storage. Basic email has nonempty local/domain, no whitespace and domain contains a dot.

GET returns `{requests:Request[]}`, searches case-insensitive substring over title/requester.name/requester.email. Seed now includes Mina Park mina@example.test and Jun Lee jun@example.test.

Create UI labels Title, Requester name, Requester email and Create request button. List displays title/name/email and keeps Search input/button. Consume the identical shared shell and components. Both tasks are affected. v1 candidate evidence remains checkpoint evidence only; v2 code/base changes require new unit/HTTP/browser verification and self-review before submission. Main rejects spec/contract v1 as a v2 final review/merge candidate.
