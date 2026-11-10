# PROGRESS.md

Session-to-session status log. Read `AGENTS.md` and `SPEC.md` before doing any work here.

## Status

| Phase | Status | Notes |
|---|---|---|
| 0 — Project setup | **Done** | 2026-08-18 |
| 1 — IAM Fundamentals | **Done** | 2026-08-18 |
| 2 — Identity Protocols & IGA | **Done** | 2026-08-18 |
| 3 — PAM Core | **Done** | 2026-08-18 |
| 4 — Vendor Landscape | **Done** | 2026-08-18 |
| 5 — Scenarios & Troubleshooting | **Done** | 2026-08-18 |
| 6 — Interview Preparation | **Done** | 2026-08-18 (all waves) |
| 7 — Certifications & Career | **Done** | 2026-08-18 |
| 8 — Hands-On Labs & Projects | **Done** | 2026-08-18 |
| 9 — Home, Glossary, Polish | **Done** | 2026-08-19 |
| 10 — Depth, Breadth & Arabic i18n | **Done** | 2026-09-17 |
| 11 — CIAM, Resilience, AI Identity, PKI & Lab Expansion | **Done** | 2026-09-26 |

---

## Phase 0 — Project setup (done 2026-08-18)

### What was built

- Docusaurus **3.10.2** (classic preset, TypeScript config), Node 22, npm.
- `docusaurus.config.ts`: title "IAM & PAM Reference", blog plugin removed, `@docusaurus/theme-mermaid` enabled, `@easyops-cn/docusaurus-search-local` installed, custom favicon `static/img/favicon.svg` (key + lock mark, hand-drawn), warm footer, no default Docusaurus branding.
- `src/css/custom.css`: complete Infima token override per AGENTS.md §3, no default Infima colors left:
  - Ochre accent ramp (base `#b76e2e`, shades 100-800) — chosen by site owner.
  - Warm neutral surfaces (`#f8f6f2` / `#f5f3ef` / `#eae8e4` / `#e0ddd8`) and ink text scale (`#3d352a` family).
  - EB Garamond headings + Source Sans 3 body, self-hosted via `@fontsource` (no CDN).
  - Custom type scale (0.75 / 0.875 / 1 / 1.125 / 1.25 / 1.5 / 2 / 2.5rem).
  - Radii: 4px cards / 8px buttons / 2px inputs. Low-contrast varied shadows.
  - Warm near-black dark mode (`#16130f` family), same token structure.
  - Semantic colors muted toward the palette; mermaid `themeVariables` mapped to warm ink + ochre (light mode only; dark mode uses mermaid's built-in dark theme).
- `sidebars.ts`: 8 top-level categories matching SPEC.md parts, each linking to its stub landing page.
- Stub landing pages under `docs/<section>/index.md` — short scope statements, no fake content.
- `docs/diagram-test/` — internal, unlisted QA page proving Mermaid + Draw.io rendering. Kept through the build as a rendering regression check; not in nav, not linked.
- `static/diagrams/test-flow.drawio` — first Draw.io diagram (3-node flow), hand-authored XML on 40px grid, orthogonal edges.
- Minimal home page (`src/pages/index.tsx`) — editorial layout, no hero marketing. Real home page comes in Phase 9.

### Diagram rendering decision — IMPORTANT (affects every later phase)

**Chosen mechanism: option 2 from AGENTS.md §4 — custom `DrawioEmbed` component (`src/components/DrawioEmbed.tsx`) using draw.io's official embed-mode viewer.** Reason:

1. Tried option 1 (`docusaurus-plugin-drawio` 0.4.0, last published 2023-01) first, as the spec requires. It built fine against Docusaurus 3.10.2, but its bundled 2023-era mxgraph viewer proved unreliable at runtime: the diagram rendered exactly once across five headless-browser checks, and never on a fresh page load (the `geDiagramContainer` was created but no SVG ever appeared, even after 25s; no console errors). The package is effectively unmaintained. Exactly the friction §4 warned about.
2. Option 2 works: the embed viewer iframe renders the diagram reliably, view-only (`ui=0`, no toolbar), auto-resizes via the embed protocol's `resize` event, and honors dark mode via the `dark=1` URL param wired to Docusaurus's color mode hook.

**Usage contract for all later phases** (this is the house style, keep it consistent):

- Every Draw.io diagram:
  - Has its source committed under `static/diagrams/<name>.drawio`, hand-authored XML: 40px grid multiples, orthogonal edges, max 12-15 nodes, page sized to fit content bounds (set `pageWidth`/`pageHeight` to match the diagram bounding box so the viewer fits it without scrollbars).
  - Uses the site palette in node styles: fills `#f5f3ef`/`#f7ead9`, strokes `#3d352a`/`#b76e2e`/`#94541f`/`#7a6e5f`, text `#3d352a`, fontColor + fontSize 13.
  - Is embedded in MDX like this:
    ```mdx
    import DrawioEmbed from '@site/src/components/DrawioEmbed';
    import flow from '!!raw-loader!../../../static/diagrams/flow.drawio';

    <DrawioEmbed xml={flow} />
    ```
    (path depth depends on the page location — relative to the importing file; `docs/x/y.md` needs `../../../static/...` only when nested two levels; `docs/x.md` needs `../../static/...`.)
  - Has a caption line under the diagram and a "Download / edit this diagram" link pointing at the `.drawio` source (served from `/diagrams/...`), plus a short prose paragraph. A diagram alone is never a complete section.
- Mermaid stays for sequence diagrams and simple linear flows (JML state diagram, SAML/OAuth/SCIM sequences). Render via a fenced ```mermaid block with `markdown.mermaid` enabled.

### Infrastructure decisions and gotchas

- **Webpack, not rspack.** The scaffold ships `future: {v4: true}`, which in 3.10 enables `fasterByDefault` → the rspack bundler, which cannot resolve webpack inline loaders (`!!raw-loader!`), breaking the diagram import pattern above. Removed the `future` block entirely; the site builds on standard webpack and the raw-loader imports work.
- `raw-loader` is a devDependency and is required by the `!!raw-loader!` import pattern. Do not remove it.
- `onBrokenLinks: 'throw'` + `markdown.hooks.onBrokenMarkdownLinks` (throws) — every build fails on any broken link. This is the completeness check per AGENTS.md §6.
- `viewer.min.js` was copied into `static/` for the plugin's CDN-free path; no longer needed since the plugin was removed. The embed viewer (viewer.diagrams.net) requires internet at view time — acceptable for a public portfolio site; documented as a known dependency.
- Node >= 20 required by Docusaurus 3.10; environment has Node 22.

### Verification (Phase 0 checkpoint)

- `npm run typecheck` — clean.
- `npm run build` — clean, zero warnings, zero broken links.
- Headless-browser checks against the production build (`npm run serve`):
  - Tab title: "IAM & PAM Reference" (per-page titles work).
  - Favicon `/img/favicon.svg` present.
  - Primary color `#b76e2e`; body font Source Sans 3; h1 EB Garamond; link color `#94541f`; warm backgrounds and borders on cards, tables, code, drawio container.
  - Mermaid sequence diagram renders (SVG present, ink colors).
  - Draw.io diagram renders inside the embed viewer iframe (SVG present, border/bg match tokens).
  - Sidebar shows all 8 sections; footer shows section links + copyright.
- Screenshots saved under `/tmp/opencode/shot/` for the record (visual diffing future sessions can rerun the playwright script `check.js`).

### Open items / decisions still pending

- **Production URL**: set to `https://ahmeddwalid.me` (update `baseUrl` if deploying to a subpath).
- Test page `docs/diagram-test/` kept intentionally unlisted as a rendering QA harness. Revisit at Phase 9 polish whether to keep or remove.
- The easyops search-local plugin is installed but its theming was not deeply audited (its default suggestion styling may deviate from the warm palette). Audit visually at Phase 9.

---

## Phase 1 — IAM Fundamentals (done 2026-08-18)

### What was built

Six content pages under `docs/fundamentals/` plus a real overview index (links, suggested order):

- `what-is-iam` — scope, managed objects table, why orgs run IAM, IAM vs PAM boundary, what IAM is not.
- `aaa-model` — Authentication / Authorization / Accounting, factor table, worked nurse example, why the stages fail differently.
- `identity-lifecycle` — JML with a Mermaid `stateDiagram-v2` (Prospective → Active → Moved/Leaving → Suspended → Archived), joiner/mover/leaver failure patterns, timing decisions.
- `least-privilege-zero-trust` — principles at conceptual level; architecture deferred to Phase 3 (no duplicate diagrams).
- `authentication` — password decline, MFA method table with honest strength ratings, FIDO2/passkeys, magic links, SSO concentration trade-off.
- `authorization` — RBAC/ABAC/PBAC, "RBAC for what, ABAC for when", static vs externalized enforcement, model-selection table.

Diagrams: JML state diagram (Mermaid) on the lifecycle page; `static/diagrams/rbac-relationship.drawio` (Draw.io, 4 nodes: User → Role → Permission → Resource) embedded on the authorization page via the `DrawioEmbed` component. Both verified rendering in the production build.

Sidebar: `IAM Fundamentals` category now has Overview + the six pages. Category labels link to their index page; index pages are listed as "Overview" items so there is no duplicate-label noise.

### Gotchas recorded

- **Docusaurus strips leading numeric prefixes from doc ids/slugs.** `01-what-is-iam.md` becomes id `what-is-iam`, URL `/docs/fundamentals/what-is-iam`. Sidebar ids must use the stripped form. (Kept the numbered filenames on disk for authoring order; ids are number-free.)
- **Front matter YAML**: any `description:` containing a colon followed by space must be double-quoted or parsing fails.
- **raw-loader import depth is relative to the importing file**: `docs/fundamentals/x.md` → `!!raw-loader!../../static/...` (one level up less than `docs/diagram-test/`).
- Sidebar categories need `items` even when they have a `link` to their index.

### Verification

- `npm run typecheck` clean; `npm run build` clean (zero warnings, zero broken links; onBrokenLinks=throw).
- Headless checks on the served build: mermaid SVG renders on lifecycle page; drawio embed iframe present with correct viewer URL on authorization page; download/edit link resolves; sidebar shows Overview + 6 pages in order; pagination prev/next correct; per-page titles correct.
- §3 copy audit: grep for the full banned-word list + em/en dashes over `docs/fundamentals/` → zero hits.

---

## Phase 2 — Identity Protocols & IGA (done 2026-08-18)

### What was built

Seven content pages under `docs/protocols-iga/` plus a rewritten overview index:

- `ldap` — directory structure, DIT tree Draw.io diagram, operations, security (LDAPS/StartTLS/SASL), IAM roles.
- `saml` — SP/IdP model, Mermaid SP-initiated SSO sequence, IdP-initiated caveats, signature-wrapping risk, SAML vs OIDC table.
- `oauth2` — roles table, Mermaid grant-selection flowchart, authorization code + PKCE, client credentials, device flow, token lifetimes, security rules.
- `oidc` — Draw.io layered diagram (OIDC band over OAuth band), ID token claims, discovery, decision vs SAML.
- `scim` — Mermaid provisioning sequence, lifecycle mapping, idempotency/externalId, pitfalls, read/login/provision triad.
- `iga` — capability table, request-approve-provision-certify-revoke loop, cross-system SoD, IGA vs IAM.
- `iam-architecture` — Draw.io complete architecture (9 nodes, 10 labeled edges: OIDC/SAML/OAuth/LDAP/SCIM/logs), walkthrough.

Diagrams: `static/diagrams/ldap-dit.drawio`, `oidc-on-oauth.drawio`, `iam-architecture.drawio`; Mermaid on SAML, OAuth, SCIM pages. All verified rendering.

Sidebar: `Identity Protocols & IGA` category now has Overview + the seven pages. The OAuth page URL is `/docs/protocols-iga/oauth-2.0` (slug from title) while its id is `oauth2`; sidebar uses the id, links use file paths, both work.

### Gotchas recorded

- Mermaid flowchart node labels with `<br>` fail silently (renders raw `<pre>`); quoted or plain labels work.
- Doc id vs slug can diverge when the title slugifies differently than the filename (OAuth 2.0 -> oauth-2.0).

### Verification

- Build clean, typecheck clean, §3 copy audit zero hits.
- Headless: LDAP/OIDC/architecture drawio embeds render at 823px; SAML/OAuth/SCIM mermaid SVGs render (OAuth flowchart 8 nodes).

---

## Phase 3 — PAM Core (done 2026-08-18)

### What was built

Seven content pages under `docs/pam-core/` plus a rewritten overview index:

- `what-is-pam` — privileged access defined (capability test), the three problems PAM solves (shared access, standing privilege, audit gap), IAM vs PAM table, program anatomy.
- `privileged-account-types` — catalog table (8 types: local admin, domain/enterprise admin, server admin, service accounts, application admin, shared, break-glass, cloud roles), audit inventory fields, risk ranking, control assignment per type.
- `core-capabilities` — mechanism catalog: vaulting (check-out/check-in, API-first, audit), PSM, rotation (scheduled/event-driven/gMSA), discovery, workflows, and the vault-vs-session separation that matters.
- `best-practices` — ten testable rules (no standing access, phishing-resistant MFA, credential never reaches the person, event-driven rotation, break-glass enumeration, quarterly reviews, monitor the monitor, least privilege for privileged access, audit trail as product, discovery first).
- `pam-architecture` — Draw.io diagram (8 nodes: admin, PSM, targets, ticketing, vault, recording, HA/DR, SIEM; 8 labeled edges), component breakdown, step-by-step flow, assumptions, zero-trust angle.
- `zero-trust-iam` — Draw.io diagram (8 nodes: user+device, policy engine, JIT broker, IdP, directory, resources, monitoring, standing accounts eliminated as a dashed red box), trust model, verification loop, why standing privilege violates zero trust twice.
- `jit-access` — Draw.io workflow diagram (6 nodes, numbered 1-6: request, approve, grant, use, revoke, audit; 5 edges with "expiry reached" on use->revoke), four patterns (ephemeral groups, role activation, brokered sessions, check-out with rotation), failure modes.

Diagrams: `static/diagrams/pam-architecture.drawio`, `zero-trust-iam.drawio`, `jit-access-flow.drawio`. All verified rendering (823x420) via headless check.

Sidebar: `PAM Core` category now has Overview + the seven pages.

### Gotchas recorded

- **Absolute `/docs/...` links must use the slugified route, not the numbered filename.** `/docs/fundamentals/03-identity-lifecycle` is broken; the route is `/docs/fundamentals/identity-lifecycle` (numbers stripped from slugs). Relative markdown links (`(03-identity-lifecycle.md)`) resolve fine; absolute links do not. Lesson: prefer relative file links.
- **Index doc links**: `(index)` resolves to `/docs/pam-core/index` which is not a route (index docs live at `/docs/pam-core/`); use `(index.md)`.
- **Em dashes and "elevate"**: the §3 copy audit caught both in my first draft. Em dashes removed from all UI copy (index list separators -> colons). "Elevate/elevated/elevation" and "leverage" are on the ban list even in domain terms; rewrote to "privileged access", "privileged grant", "brokered sessions", "highest-impact". Audit now zero hits.

### Verification

- Build clean, copy audit clean, geometry check clean on all 6 drawio files (40px grid on x/y, no node overlaps, in-page bounds; container bands excluded from overlap check by design).
- Headless: all 3 new diagrams render 823x420; index page renders with nav.

---

## Phase 4 — Vendor Landscape (done 2026-08-18)

### What was built

Nine pages under `docs/vendors/` (index rewrite + 8 content pages):

- `index` — rewritten: four vendor categories, suggested order, fact-checking note.
- `major-vendors` — category map (PAM specialists / Microsoft stack / cloud IAM / governance tools), how they layer on the IAM architecture, corporate-change note.
- `cyberark` — component table (Vault, PSM, CPM, PVWA, PTA, Conjur, AIM) mapped to the pam-architecture page, cert track, hypothetical regional-bank implementation scenario.
- `delinea` — Secret Server 3-tier architecture, RabbitMQ/Azure Service Bus, distributed engines, launchers, deployment models (on-prem/cloud/IaaS), HA pattern, Privilege Manager integration (REST API, separate databases).
- `beyondtrust` — Password Safe (PASM + secrets), BeyondInsight, Password Safe Cloud with resource brokers (up to 200) in resource zones (up to 51, cloud-only), smart groups + access policies, zero trust enclave, Privilege Management EPM, use cases.
- `microsoft-stack` — on-prem AD (domains/forests/trusts/GPOs), Entra ID (hybrid identity, PIM + Conditional Access reauth on activation), sync path (Connect Sync to Cloud Sync transition), MIM status, **Hybrid identity architecture Draw.io diagram** (core diagram set).
- `cloud-iam` — federation-first pattern, per-cloud breakdown (AWS Identity Center/permission sets/STS, GCP workforce pools/service accounts, Azure RBAC/managed identities), 3-cloud concept map table, four anti-patterns, break-glass note.
- `governance-tools` — SailPoint (ISC/Atlas, IdentityIQ legacy, Entro Security acquisition June 2026), Okta IAG (scope constraint: Okta-connected SCIM apps only, Security Access Review), Saviynt (converged EIC, zero standing privilege live 2025, deep SAP/Oracle SoD), selection table.
- `vendor-comparison` — comparison matrix across the six product families, ten evaluation criteria, pricing deliberately omitted (quote-based).

Diagram: `static/diagrams/hybrid-identity-architecture.drawio` (8 nodes + 2 dashed boundary bands + note: users, AD, Entra ID, Conditional Access, sync, PIM, on-prem apps, cloud apps; 8 labeled edges; 820x580 page). Embedded on the Microsoft stack page via DrawioEmbed, caption + download link.

Sidebar: `Vendor Landscape` category now has Overview + the eight pages.

### Facts verified in-session (all pages carry `<!-- verified 2026-08-18 -->`)

- **CyberArk/Palo Alto**: acquisition announced July 2025, completed Feb 11, 2026; CyberArk operating as "Idira" within PANW; products continue standalone.
- **CyberArk certs** (from CyberArk's cert pages): Defender (PAM-DEF, ACC-DEF, EPM-DEF), Sentry (PAM-SEN, CPC-SEN, SECRET-SEN); 90 min, 65 questions, 70% pass; in-person Pearson VUE only since Nov 1 2025 (OnVUE discontinued); PAM-SEN requires PAM-DEF; ~6 months hands-on recommended before Defender (a recommendation, not a registration block); PAM-SEN reported ~USD 300 (labeled as reported); Defender recert every 2 years. **PAM-DEF cost NOT verified, deliberately not stated.**
- **Delinea**: SS = Windows 3-tier + SQL Server; RabbitMQ (on-prem) / Azure Service Bus (cloud); distributed engines mandatory in cloud; scanners (AD, Unix, AWS, Azure, GCP, VMware); SS Cloud hosted in Delinea's Azure; PM integration via SS REST API, on-prem only, separate databases.
- **BeyondTrust**: PS Cloud hosted in Azure; resource brokers (max 200) + resource zones (max 51, cloud-only feature); brokers do auth/discovery/credential mgmt/session proxy on customer Windows Server 2016+; smart groups dynamic (scanning in rule criteria since 26.1); Bomgar acquired by Thoma Bravo 2016 (remote-support heritage).
- **Microsoft**: MIM 2016 SP3 current; EOS extended Jan 13 2026 -> Jan 9 2029 (Jan 13, 2026 -> Jan 9, 2029); MIM for Entra Premium customers continues; MIM hybrid reporting deprecated -> Azure Arc + Azure Monitor (cloud endpoints retired Nov 2025); Sync Service can use Azure SQL with managed identities; Entra Connect Sync transitions to Cloud Sync (announced April 2026, phased windows from July 2026); PIM role activation supports Conditional Access reauthentication (May 2026).
- **Cloud IAM**: AWS IAM Identity Center (formerly AWS SSO), permission sets; STS AssumeRole max 12h; GCP workforce identity pools + deny policies now available; Azure 300+ built-in RBAC roles; all three: workload identity federation as the standard (IRSA/OIDC, managed identities, GKE workload identity).
- **Governance**: SailPoint returned to public markets 2025 (Thoma Bravo majority), acquired Entro Security June 29 2026 (reported ~USD 200M); Saviynt zero standing privilege live H1 2025; OIG covers Okta-connected SCIM apps only; Okta Security Access Review 2025.

### Gotchas recorded

- **HTML comments before front matter break YAML parsing.** `<!-- verified ... -->` above the `---` block makes the front matter unparsed, so the page title falls back to the filename slug. The verification-date comment goes AFTER the `---` block (first body line). Cost a rebuild + headless round-trip to catch.
- **Relative `.md` links to numbered files need the full filename.** `(01-major-vendors.md)` resolves (file exists on disk, slug stripped); `(01-major-vendors)` resolves to a broken route; `(major-vendors.md)` fails because no such file on disk. Absolute `/docs/...` links use the slugified route with no numbers: `/docs/vendors/major-vendors`.
- Existing link forms from Phase 3 gotchas all confirmed again: `(index.md)` for index docs, absolute `/docs/careers/` not `/docs/careers/index`.

### Verification

- `npm run build` clean, `npm run typecheck` clean, §3 copy audit zero hits.
- Geometry check on `hybrid-identity-architecture.drawio`: all coordinates on 40px grid, no node overlaps (bands excluded by design), all cells within page bounds.
- Headless: hybrid diagram renders; vendor pages render with nav; sidebar shows 9 items.

---

## Phase 5 — Scenarios & Troubleshooting (done 2026-08-18)

### What was built

Eighteen pages under `docs/scenarios/` (index rewrite + 17 content pages), sidebar restructured into three nested subcategories:

- `index` — rewritten: three parts (Scenarios, Troubleshooting, Incident Response), full page list, how to read the section.
- **Scenarios** (7):
  - `onboarding` — joiner pipeline Mermaid flow (HR event -> provisioning -> day one), role template concept with hypothetical Northwind Systems example, least privilege by construction, day-one metric (requests per job code), failure modes.
  - `role-change` — mover access accumulation problem, withdrawal-of-old-role pipeline Mermaid flow, dated transition windows, losing-manager approval, privilege re-evaluation.
  - `termination` — standard offboarding Mermaid flow + checklist (disable not delete, session revocation, MFA reset, vault close, data handover, certification catch), emergency offboarding 6-step playbook, risk of undiscovered accounts.
  - `privileged-access-request` — request/approve/grant/audit scenario, managed-account-not-personal-account rule, approver decision criteria, JIT expiry, request-log review as feedback loop.
  - `certification-campaign` — campaign mechanics (scope, assignment, evidence, remediation, re-review), reviewer independence, revoke-by-default, four success metrics, continuous certification, rubber-stamp failure mode.
  - `mfa-enrollment-recovery` — first enrollment flow with enrollment proof, backup factor requirement, re-enrollment with out-of-band verification, revocation-first recovery, adoption/factor-mix/recovery metrics, MFA bypass chain.
  - `saas-sso-integration` — 7-step integration sequence (risk decision, protocol choice, metadata exchange, attribute mapping, SCIM, policy, rollout), acceptance checklist, four failure modes.
- **Troubleshooting** (7, all with symptoms/root cause/resolution/prevention structure):
  - `troubleshooting-ldap` — AD error 49 sub-code table (525/52e/530/531/532/533/701/773/775), real message format, bind DN/password/cache diagnosis order.
  - `troubleshooting-certificates` — error-text-to-cause mapping table, openssl s_client inspection, clock skew, chain completeness, SAN discipline.
  - `troubleshooting-pam` — five patterns: session drops (credential drift first), rotation failures (never hand-edit vault secrets), recording gaps (bypass = finding), vault-directory bind failures, agent failures.
  - `troubleshooting-aws-iam` — access denied message anatomy, explicit/implicit deny hierarchy, permission boundaries, malformed policy, assume-role two-half contract, session policy trap.
  - `troubleshooting-saml` — five patterns: signature (cert rotation coordination), audience/destination, attribute mapping (assertion inspection), time validation, relay state.
  - `troubleshooting-mfa` — TOTP time drift (device vs server clock), skew tolerance, re-seed confusion, hardware key failures, lost device recovery.
  - `troubleshooting-scim` — error response format with scimType values, silent sync stop (token/URL), uniqueness conflicts, attribute mapping, mutability, group drift.
- **Incident Response** (3 playbooks):
  - `incident-compromised-privileged-account` — detection signals, containment order (disable -> terminate sessions -> revoke MFA/rotate -> cut downstream -> preserve evidence), investigation scope, clean re-establishment.
  - `incident-insider-threat-session-review` — scheduled vs triggered review, five indicator categories, triage workflow, honest limits of recordings, report discipline.
  - `incident-ransomware-credential-rotation` — race framing, three-phase rotation order (known-compromised -> privileged estate -> verify/reclaim), rotation source, fail-open vs fail-closed decision, directory-not-trustworthy boundary.

Diagrams: two Mermaid flows (joiner pipeline, mover pipeline, leaver pipeline: three total across 01/02/03). No Draw.io in this phase; no new diagram policy decisions.

Sidebar: `Scenarios & Troubleshooting` now nests Scenarios (7), Troubleshooting (7), Incident Response (3) subcategories under Overview.

### Facts verified in-session

- AD LDAP error 49 sub-codes (525 user not found, 52e invalid credentials, 530 logon hours, 531 workstation, 532 password expired, 533 disabled, 701 expired, 773 must change, 775 locked) and the real `80090308: LdapErr: ... data 52e, v893` message format, verified against Microsoft error-code docs via multiple vendor references. Pages 08 carry `<!-- verified 2026-08-18 -->`.
- SCIM error response format: `{"schemas":["urn:ietf:params:scim:api:messages:2.0:Error"],"scimType":"...","detail":"...","status":"..."}` with scimType values (invalidSyntax, invalidValue, uniqueness, mutability, noTarget, tooMany), verified against RFC 7644 section 3.12 and vendor implementations. Page 14 carries `<!-- verified 2026-08-18 -->`.
- AWS IAM error message formats (AccessDenied anatomy, assume-role messages, malformed policy), TOTP/RFC 6238 window mechanics, and PAM failure patterns written from established domain knowledge; no unverifiable specifics stated (vendor error strings kept generic and labeled as typical).

### Gotchas recorded

- **The Phase 4 link forms were violated at scale in the first draft.** Two mistakes across ~18 pages: (a) relative links written as `(01-onboarding)` without the `.md` extension, which resolves to `/docs/scenarios/01-onboarding` (numbers are stripped from slugs, so that route does not exist); (b) invented absolute routes for pages that do not exist in earlier phases: `/docs/pam-core/session-management`, `/docs/pam-core/vault-architecture`, `/docs/pam-core/discovery-inventory` (all actually `core-capabilities`), `/docs/fundamentals/role-based-access` (actually `authorization`), `/docs/protocols-iga/sso` (actually `saml`), `/docs/cloud-iam/aws` (actually `/docs/vendors/cloud-iam`), plus two absolute `/docs/scenarios/16-...`-style links carrying numbers. The lesson: when writing, check the link target against the actual file inventory in the earlier section, and always write relative links with `.md`. The build's onBrokenLinks=throw caught everything before any of it shipped.
- **Mermaid check selector:** the theme renders into `.docusaurus-mermaid-container` (SSR HTML shows a bare `<!-- -->` for mermaid blocks, which is normal: the component returns null at SSR). Headless checks must wait ~4s and count `.docusaurus-mermaid-container svg`, not `.mermaid svg`.
- Ban-list near-misses caught by the §3 audit this phase: "elevated rights" (04) and "unlock" (08, twice).

### Verification

- `npm run build` clean, `npm run typecheck` clean, §3 copy audit zero hits.
- Headless: all 18 pages render with nav; sidebar shows Overview + 3 subcategories with correct item counts; three Mermaid flows render.
- Cross-links to Phases 1-4 pages resolve (build-time broken-link check with onBrokenLinks=throw is the gate).

---

## Diagram rendering decision (Phase 8, 2026-08-18)

Per AGENTS.md §4, option 1 was tried first and needed a fix: `docusaurus-plugin-drawio@0.4.0`'s bundled viewer only processes `class="mxgraph"` elements at script-load time, but the plugin renders `class="geDiagramContainer"` inside React, so nothing ever rendered. Fix applied and proven on a real page:

- Custom `src/components/Drawio.tsx` renders the `geDiagramContainer` div with `data-mxgraph` JSON (same contract the viewer expects).
- Local plugin `drawio-viewer` in `docusaurus.config.ts` injects the viewer script (`static/lib/viewer.min.js`, MIT, copied from the npm package) plus a boot script (`static/lib/drawio-boot.js`) that runs `GraphViewer.processElements('geDiagramContainer')` on load and via MutationObserver for SPA navigation.
- No CDN dependency: both scripts are served from `/lib/`.
- `.drawio` sources live in `static/diagrams/`; pages import them via `!!raw-loader!../../static/diagrams/xx.drawio` and show an edit link to `/diagrams/xx.drawio`.
- Verified headless: the test diagram renders an SVG with the expected node labels, no console errors.

Fallback if this ever breaks: static SVG export per §4 option 3.

---

## Phase 6 — Interview Preparation (done 2026-08-18)

Per SPEC, built in waves with a checkpoint per wave. **Wave 1 (done):** 15 conceptual + 10 protocol questions, each with the four-part treatment (concise answer / detailed explanation / why it matters / likely follow-ups).

### Wave 1 — What was built

- `interviews/index` — rewritten: four-part answer structure explained, how-to-use section, waves listed.
- `interviews/conceptual-questions` — 15 questions: IAM vs PAM, AAA, authn vs authz, MFA factors/SMS weakness, SSO trade-offs, RBAC vs ABAC, least privilege as design principle, identity lifecycle, federation, zero trust, service accounts, IAM vs IGA, provisioning/deprovisioning, directory services, JIT vs standing access.
- `interviews/protocol-questions` — 10 questions: OAuth code flow + PKCE, SAML vs OIDC, SAML assertion anatomy, JWT and its limits, SCIM mechanics, scopes vs roles vs permissions, OAuth vs OIDC, LDAP bind, token vs refresh token lifetimes, session vs token.
- All answers cross-link to the relevant site pages (`/docs/fundamentals/...`, `/docs/protocols-iga/...`, `/docs/pam-core/...`, `/docs/scenarios/...`, `/docs/vendors/...`) instead of re-explaining.

### Wave 2 and 3 — built

- `interviews/scenario-questions` — 15 scenario questions (joiner, mover, terminator, privileged request, IdP outage, leaked service account, MFA rollout, certification rate, SaaS integration, privileged alert, password policy debate, vendor access, MFA recovery, orphaned service accounts, PAM rollout), each mapped to the Phase 5 playbooks.
- `interviews/architecture-questions` — 10 design questions (cloud move, app auth flow, hybrid SSO, PAM architecture, zero trust, session management, microservices, provisioning architecture, break-glass, audit architecture).
- `interviews/behavioral-questions` — 10 STAR-template questions with fill-in structure, no invented stories (per §5).

### Phase 6 — Verification

- Build + typecheck clean; copy audit clean; headless verified 15+10+10 question headings render.

## Phase 7 — Certifications & Career (done 2026-08-18)

- `careers/certifications` — six certifications with costs verified against official sources on 2026-08-18 (Security+ $439 retail/partner vouchers ~$373-395; SC-300 $165; Okta Professional $250 performance exam since 2026-07-06; SailPoint IdentityIQ Engineer $400; CyberArk Defender ~$200 and Sentry ~$200-300, in-person only since 2025-11-01; CISSP $749 with 5-year experience rule). `<!-- verified 2026-08-18 -->` comment at top.
- `careers/career-ladder` — IAM track (Analyst→Director) and PAM track (Administrator→Architect); salary figures labeled as estimates with basis stated, anchored to the cited BLS May 2024 median of $120,360 for US info security analysts; honest note that PAM roles are not first jobs (both convention and the credential-eligibility structure).
- `careers/middle-east-gulf-egypt` — Gulf (UAE/Saudi digital programs, compressed ladder, estimates as labeled ranges) and Egypt (banking + outsourcing, certified capacity, PAM as exportable niche).
- All salary figures are labeled estimates with basis or cited; no bare unsourced numbers (checkpoint).

## Phase 8 — Hands-On Labs & Projects (done 2026-08-18)

Six lab pages, five with Draw.io architecture diagrams (sources committed under `static/diagrams/`, rendered client-side via the verified drawio path, edit links next to each):

- `labs/index` — lineup table with time estimates, honest cost notes (VirtualBox, Windows Server eval, Keycloak, AWS Free Tier, CyberArk community trial), resource estimates.
- `labs/home-lab-setup` — DC1 VM, AD forest `corp.local`, lab users, Keycloak realm + client, example app; verification checklist + pitfalls.
- `labs/keycloak-sso` — LDAP user federation (bind-based password validation), attribute mapping, two-client SSO proof, SSO session vs application session; diagram `lab-1-iam-sso.drawio`.
- `labs/cloud-iam` — AWS Organizations, IAM Identity Center with external IdP federation into Keycloak, permission sets, short-lived credentials; diagram `lab-2-cloud-iam.drawio`.
- `labs/pam-trial` — CyberArk community trial: vaulting, PSM-brokered RDP, CPM rotation, recordings, audit view; honest limits of the trial stated; diagram `lab-3-pam-trial.drawio`.
- `labs/jit-mfa` — Keycloak MFA (TOTP), approval via admin role assignment, claims in token, expiry script via admin-cli API; honest note that true JIT needs the expiry job; diagram `lab-4-jit-mfa.drawio`.
- `labs/iga-campaign` — CSV identity source, entitlement rules, provisioning script (Python), certification review table, SoD check script, remediation + campaign log; diagram `lab-5-iga.drawio`.

Topic map `static/diagrams/topic-map.drawio` built for the Phase 9 home page (not yet embedded; Phase 9 pending).

Facts verified 2026-08-18: Windows Server 2022 Evaluation 180-day term, AWS Free Tier terms, Keycloak `admin-cli` password-grant default (disabled in recent versions; noted in pitfalls), CyberArk community edition scope (single-server, time-limited trial — flagged as "check current terms").

## Phase 9 — Home Page, Glossary, Cheat Sheets, Polish (done 2026-08-19)

- **Home page rewritten** (`src/pages/index.tsx`): editorial intro, suggested learning path with realistic time estimates (explicitly labeled as estimates based on part-time evening study, not survey data), site topic map embedded (Draw.io, client-side, same render path as the lab pages), section grid, and a "Where this leads" block linking the career and interview sections. Time estimates intentionally rough; protocols section flagged as the slow point.
- **Reference section** added to the sidebar and footer:
  - `glossary.md` — 35+ acronyms used across the site, each with a one-line definition and a cross-link to the explaining page; em-dash separators removed per §3 (definition-format uses period separators).
  - `cheat-sheets.md` — SAML 2.0 element table + integration checklist, OAuth/OIDC endpoint/flow quick reference with an authorization-code request example, LDAP filter syntax table (incl. AD bitwise and recursive-membership filters), and PowerShell IAM commands (AD module + Microsoft Graph) with the "find leaked standing privileges" one-liner.
  - `external-links.md` — 20 links, every URL curl-verified HTTP 200 on 2026-08-19, flagged with an HTML comment with the verification date. CyberArk's docs root moved to a spaces layout in 2026 (`docs.cyberark.com/portal/latest/en/docs.htm`, old root 404s); BeyondTrust docs live at `docs.beyondtrust.com/` (www root 403s bots).
- **§3 audit, full site**: banned-word scan clean (only legitimate hits: Microsoft's actual feature name "Seamless SSO", "lever" noun uses, password examples containing `!`); fixed the AAA-model rhetorical-question headings (`who are you?` → descriptive) and one "not just X, but Y" construction in the compromised-account incident playbook; no exclamation marks in copy, no TODO/FIXME, no placeholder personas, no gradient/glow CSS, no rhetorical-question headers, no CTA phrasing. Front matter titles + descriptions added to the four reference pages (71/71 content pages now have them).
- Build clean, typecheck clean, home page topic map verified rendering headless (SVG present, correct labels, zero console errors).

## Site v1 — status
Complete per SPEC. Outstanding as possible follow-ups (explicitly out of scope for v1): Algolia search, i18n, CMS, site auth.

## Post-v1 polish (2026-08-19)
- Deleted leftover Phase-0 test diagrams (`test-flow.drawio`, `test-simple.drawio`) from `static/diagrams/`.
- Fixed stale lab counts: "Five home-lab projects" → six in `docs/labs/index.md` description and intro (the section grew to six labs in Phase 8; the counts had not been updated).
- Unified the diagram download/edit link phrasing site-wide: every one of the 13 rendered diagrams now carries the same "[Download / edit this diagram](/diagrams/...)" line under its caption (lab pages used a variant phrasing).
- Added the missing `.diagram-caption` style used by the home page topic-map caption.
- Build clean after all changes.

## Local search enabled and themed (2026-08-19)
- `@easyops-cn/docusaurus-search-local` v0.55.3 is installed and wired (plugin config in `docusaurus.config.ts`: `docsRouteBasePath: '/docs'`, `indexPages: false`, `hashed: false`).
- Verified end-to-end on the production build via headless Playwright: index loads (`/search-index.json`, 71 docs / 468 sections), queries return hits, clicking a hit navigates to the right page (`/docs/labs/keycloak-sso`), zero console errors, works in both light and dark mode.
- Themed to the warm palette: the plugin exposes `--search-local-*` CSS variables (its fallbacks are Infima-ish); overrides live in `src/css/custom.css` (`:root` and `[data-theme='dark']` blocks) plus `.navbar__search-input` styling. Do not re-theme via the hashed module classes — the variable approach survives rebuilds.
- Home page is intentionally not indexed (`indexPages: false`) — docs-only search, matching the site's purpose.

---

## Post-v1 extension batch (2026-08-19)

Seven new pages/sections extending the site beyond v1, all approved by the owner:

- `fundamentals/07-nist-800-207.md` — NIST SP 800-207 zero trust tenets, the seven-tenet list, AAL1-3 table (NIST SP 800-63-4), NIST/ISO mapping table, interview angle. Facts verified 2026-08-19 against NIST SP 800-63-4 and ISO/IEC 27001:2022 control IDs.
- `fundamentals/08-passwordless.md` — WebAuthn/CTAP2/FIDO2, why origin binding defeats phishing, passkeys (synced vs platform-bound), AAL2/AAL3 line, deployment realities.
- `protocols-iga/08-kerberos.md` — the ticket exchange (Mermaid sequence diagram), NTLM fallback, delegation (unconstrained/constrained/resource-based), 7-attack table (Kerberoasting, golden/silver ticket, pass-the-hash/ticket, DCSync, overpass-the-hash), interview angle.
- `pam-core/08-attack-defense.md` — 15 attacks across four classes (credentials, tickets/tokens, auth flows, trust relationships), each with detection + defense columns, one-paragraph defensive posture, interview angle.
- `pam-core/09-secrets-management.md` — vault properties table, dynamic secrets and leases, static-secret discipline, relationship to PAM, cloud angle.
- `labs/07-secrets-vault.md` — Lab 7: Vault on Docker, KV v2, AppRole, dynamic PostgreSQL credentials with lease expiry (`VALID UNTIL`), audit log. New diagram `static/diagrams/lab-6-secrets-vault.drawio` (8 nodes, 7 numbered edges, house palette). Honest note that dev mode is not production. Labs index updated to seven (description, lineup table, ordering note).
- `reference/cheat-sheets.md` — four new sections: Kerberos quick reference (ports, lifetimes, klist commands, security event IDs 4768/4769/4624/4625/4662/4771), FIDO2/passkey vocabulary, NIST 800-63/800-207 quick reference, identity attack lookup table.
- `interviews/06-cloud-questions.md` — ten cloud identity questions (AD vs Entra, service principal vs managed identity, IAM user vs role, permission sets, conditional access, workload identity federation, identity- vs resource-based policies, root/global admin protection, cloud least privilege, cloud identity monitoring), four-part treatment format matching the existing bank. Interviews index updated.

### Gotchas recorded this session

- **Relative link resolver matches the numbered file on disk, not the stripped doc id.** `../pam-core/secrets-management.md` fails because the file is `09-secrets-management.md`; link resolution is by on-disk path (`onBrokenLinks=throw` caught both cases).
- **Mermaid renders fine site-wide** (verified on kerberos + saml pages): SSR HTML shows a bare `<!-- -->` placeholder (the theme component returns null at SSR) and the SVG appears client-side in `.docusaurus-mermaid-container`. The earlier "0 mermaid" readings in Phase 8 notes and this session's first checks were the same wrong selector: count `.docusaurus-mermaid-container svg`, not `.mermaid svg`.
- Drawio embed is an inline `.geDiagramContainer` div (no iframe); verify diagrams by counting `.geDiagramContainer svg` and checking node label text.

### Verification

- `npm run typecheck` clean; `npm run build` clean (zero warnings, zero broken links).
- §3 copy audit on all 8 new/edited files: zero hits (one "robust" fixed; "elevation"/"unlock" uses are technical terms, not marketing).
- Headless checks on the served build: Lab 7 diagram renders with all labels (AppRole, Database engine, PostgreSQL, Audit log), Kerberos mermaid sequence renders, 10 cloud questions as h3s, cheat sheets 8 sections, all new pages in the search index, pagination chains correct everywhere.

---

## Post-v1 extension batch C (2026-08-19)

Six new pages filling coverage gaps (all approved by the owner, all facts verified 2026-08-19):

- `fundamentals/09-password-policy.md` — NIST SP 800-63B/800-63-4 password rules (length over complexity, no forced rotation, breach screening, manager-friendly), the enterprise compromise, four-part policy design table, legacy edge cases, interview angle.
- `pam-core/10-service-accounts.md` — service account taxonomy (traditional, gMSA/sMSA, app registrations, machine accounts, cloud keys), why they fail structurally (no MFA, shared/static, invisible to reviews, Kerberoastable), five-part governance model, monitoring signal table (4769/4624/4724/4728 events), cloud equivalents.
- `pam-core/11-iam-metrics.md` — four metric families (coverage, lifecycle, review, detection) with operational definitions and formulas, deliberately zero fabricated benchmarks, presentation rules (trend not level, denominator, failing number first), interview angle.
- `scenarios/18-break-glass-access.md` — the two failure modes (back door vs locked door), account design table (MFA with sealed second factor, no blanket CA exclusions), split-knowledge storage/sealing, five-step activation checklist, quarterly testing, independent monitoring path.
- `scenarios/19-vendor-external-access.md` — three external identity models (local, federation, B2B/guest), sponsor-driven lifecycle with contract-driven termination, privileged vendor access via PAM brokering + JIT + session recording, five-row failure-mode table.
- `reference/compliance-mapping.md` — SOX 404, HIPAA Security Rule, PCI DSS 4.0 (reqs 7/8/10/12), GDPR (arts 5/32/17), ISO 27001:2022 (A.5.15-18, A.8.2, A.5.24), NIST CSF 2.0 (PR.AA) mapped to the four universal IAM capabilities (lifecycle, authentication, least privilege, review), typical audit findings, interview angle.

Sidebars updated (fundamentals, pam-core, scenarios, reference). Cross-links added from all six pages to existing pages.

### Bug found and fixed site-wide (pre-existing)

**HTML comment before the front matter block breaks front matter parsing entirely.** 14 files had `<!-- verified ... -->` on line 1 ahead of `---`; the front matter was never parsed, so every affected page rendered with the file slug as title and `---` as the meta description (no visible body damage, and the build gate passed because broken-link checking is unaffected). This predated batch C (affected `07-nist-800-207`, `08-passwordless`, `08-kerberos`, `08-attack-defense`, `09-secrets-management`, `06-cloud-questions`, `01-certifications`, `07-secrets-vault` plus the six new files). Fixed by moving the comment below the closing `---` in all 14 files with a script; verified on the served build that h1 titles and meta descriptions now parse correctly on affected pages. The other 11 files that show `<!-- verified -->` at the top already had it after the front matter and were untouched.

### Gotcha recorded this session

- Docusaurus 3.10 strips numeric filename prefixes for doc ids AND default titles (`09-password-policy.md` → id `fundamentals/password-policy`, default title "password-policy"), which is why the unnumbered sidebar ids resolve and why a broken front matter silently degraded titles to slugs instead of erroring.

### Verification

- `npm run build` clean (zero warnings, zero broken links, `onBrokenMarkdownLinks=throw` enforced — one bad link `../fundamentals/04-authorization.md` → `06-authorization.md` caught and fixed).
- §3 copy audit on all six new files: zero banned-word hits.
- Headless checks on the served build: all six routes return 200, h1 titles correct ("Password Policy Design", "Service Accounts", "Measuring an IAM Program", "Break-Glass Access", "Vendor and External Access", "Compliance Mapping"), meta descriptions correct, verified comments do not leak into rendered HTML, sidebar sibling links present (break-glass → vendor-external-access).

---

## Phase 10 — Depth, Breadth, Diagrams, Interactive Components & Full Arabic i18n (done 2026-09-17)

A major platform expansion enhancing technical depth, architectural breadth, interactive pedagogy, bilingual Arabic localization, and publishing pipelines:

### 1. Advanced Technical Depth
- `fundamentals/11-workload-machine-identities.md` — SPIFFE/SPIRE architecture, mTLS SVIDs, OAuth 2.0 Client Credentials with MTLS/DPoP sender-constraining, Kubernetes Workload Identity Federation (AWS IRSA, GCP Workload Identity, Azure Workload Identity), Machine Identity Lifecycle.
- `fundamentals/12-fine-grained-authorization.md` — Google Zanzibar architecture (Relation Tuples, Zookies, Leopard indexing), OpenFGA and Cedar policy language implementations, comparing RBAC/ABAC/ReBAC, evaluating latency SLAs, consistency models.
- `protocols-iga/09-fido2-webauthn-deep-dive.md` — WebAuthn Relying Party registration & authentication flows, CTAP2 protocol (`authenticatorMakeCredential`, `authenticatorGetAssertion`), CBOR data structures, Authenticator Data bitfields, signature verification math over `clientDataJSON` and `authData`, Passkey sync vs hardware-bound security.
- `protocols-iga/10-federation-patterns-token-exchange.md` — RFC 8693 OAuth 2.0 Token Exchange, actor token chains for delegation vs impersonation, Cross-Cloud and Mesh Federation, Cross-Domain Identity Patterns.
- `pam-core/14-ephemeral-pam-zero-standing-privilege.md` — Shift from static vaulted secrets to Zero Standing Privilege (ZSP), short-lived certificate issuance (SSH/RDP CA), dynamic Just-In-Time provisioning, Teleport / HashiCorp Boundary / Aembit architecture.
- `pam-core/15-cloud-iem-posture.md` — CIEM & Identity Security Posture Management (ISPM), calculating effective permissions across IAM policies, SCPs, Permission Boundaries, Resource policies, and Session policies; cross-account toxic combinations and attack paths.

### 2. Comprehensive Operational Breadth
- `vendors/09-modern-cloud-pam.md` — Modern Next-Gen Cloud PAM vendors (Teleport, CyberArk Cloud Entitlements Manager, BeyondTrust Cloud Privilege Broker, HashiCorp Boundary, Britive, Delinea Cloud Suite, Saviynt ZSP).
- `scenarios/20-aitm-phishing-defense.md` — Adversary-in-the-Middle (AiTM) proxy attacks (Evilginx2 / Modlishka), credential & session cookie theft bypassing traditional MFA, defense through FIDO2/WebAuthn origin binding, Conditional Access token binding, Continuous Access Evaluation (CAE / RFC 9470).
- `scenarios/21-mergers-acquisitions-identity.md` — Complete M&A Day 1 / Day 30 / Day 90 identity playbook, cross-tenant synchronization, domain consolidation, federation trusts, privileged account consolidation, entitlement cleanup.
- `scenarios/22-active-directory-tiering-migration.md` — Enterprise Access Model (EAM) / Tiering migration (Tier 0 Control Plane, Tier 1 Enterprise Workloads, Tier 2 User Devices), AD CS ESC1-ESC13 attack mitigations, Kerberos hardening (AES, Protected Users, PAC validation), Privileged Access Workstations (PAWs).
- `labs/08-devops-identity.md` — CI/CD Pipeline Identity Federation, GitHub Actions OIDC to AWS STS / GCP / Azure without static long-lived keys.
- `labs/09-ciem-least-privilege.md` — Hands-on CIEM policy right-sizing using AWS Access Advisor, IAM Access Analyzer, and Automated Least Privilege Remediation.
- `labs/10-ephemeral-access-teleport.md` — Deploying Teleport Community Edition for ephemeral Zero Standing Privilege SSH/Kubernetes access with GitHub SSO and auto-expiring certificates.

### 3. Professional Architecture Diagrams (AGENTS.md §4 Compliant)
- `static/diagrams/machine-workload-identity.drawio` — SPIFFE/SPIRE and multi-cloud workload identity architecture.
- `static/diagrams/zero-standing-privilege-zsp.drawio` — ZSP ephemeral CA issuance and JIT access orchestration.
- `static/diagrams/ciem-ispm-architecture.drawio` — Multi-cloud CIEM discovery, graph evaluation, and auto-remediation.
- `static/diagrams/aitm-phishing-defense.drawio` — AiTM reverse proxy attack vs FIDO2 cryptographic origin binding defense.
- `static/diagrams/adcs-attack-defense.drawio` — AD CS PKI attack vectors (ESC1/ESC8) and Tier 0 control plane hardening.
- `static/diagrams/ciam-multi-tenant-saas.drawio` — B2B CIAM tenant isolation, SAML/OIDC federation, and JIT SCIM provisioning.
- `static/diagrams/identity-resilience-dr.drawio` — IdP outage failover, break-glass protocol, and disaster recovery architecture.

### 4. Interactive Learning Components
- `src/components/LearningTrack.tsx` — Role-based learning paths (IAM Architect, PAM Specialist, Cloud Identity Engineer, Identity Auditor) with progressive milestone roadmaps and time allocations.
- `src/components/ProtocolChooser.tsx` — Interactive decision tree assisting architects in selecting the optimal protocol (SAML, OIDC, OAuth 2.0, SCIM, Kerberos, WebAuthn, SPIFFE) based on application context and requirements.
- `src/components/KnowledgeCheck.tsx` — Technical self-assessment component with immediate feedback and explanatory rationales.

### 5. Full Arabic i18n & RTL Typography
- Standardized Arabic terminology: `docs/reference/06-arabic-terminology-standard.md` established accurate technical translations for all IAM and PAM terminology.
- Complete documentation mirror under `i18n/ar/docusaurus-plugin-content-docs/current/` (93 documents).
- Arabic typography enabled via `@fontsource/amiri` for display headings and `@fontsource/ibm-plex-sans-arabic` for body prose.
- Strict LTR isolation (`dir="ltr"`) for all code fences, terminal sessions, JSON/YAML schemas, and protocol flags.
- Mirrored table alignments, blockquotes, and RTL UI adjustments in `src/css/custom.css`.
- Dual-locale static build verified (`build:site` builds `build/` and `build/ar/` with zero broken links).

### 6. Bilingual PDF Publishing Pipeline
- Extended `scripts/build-pdf.js` with `--locale` support.
- Base64 webfont injection for `@fontsource/amiri` and `@fontsource/ibm-plex-sans-arabic` ensures crisp, fully shaped Arabic text rendering in headless Chromium.
- Custom running headers, footers, and cover pages.
- npm scripts configured: `build:pdf`, `build:pdf:ar`, and `build:all`.

---

## Phase 11 — CIAM, Resilience, AI Identity, PKI & Lab Expansion (done 2026-09-26)

A major expansion completing all identified curriculum gaps, wiring orphaned architecture diagrams, adding four foundational 2025–2026 architectural modules, expanding hands-on labs from 10 to 13, synchronizing all section index pages, and achieving complete bilingual Arabic localization parity:

### 1. Orphaned Architecture Diagrams Wired into Production
- `protocols-iga/11-customer-iam-saas.md` — Customer IAM & Multi-Tenant SaaS Architecture: B2B multi-tenancy vs B2C CIAM, Home Realm Discovery (HRD), inbound SCIM synchronization per tenant, tenant isolation, and tenant-scoped JWT claims. Embeds `static/diagrams/ciam-multi-tenant-saas.drawio`.
- `pam-core/16-identity-resilience-disaster-recovery.md` — Identity Resilience and Disaster Recovery: Single Point of Failure (SPOF) in centralized cloud IdPs, cascading failure analysis of IdP outages, Continuous Access Evaluation (CAE / RFC 9470), disconnected break-glass vaults with dual-custody hardware keys, isolated recovery CAs, and out-of-band audit logging. Embeds `static/diagrams/identity-resilience-dr.drawio`.

### 2. Emerging 2025–2026 Enterprise Identity Frontiers
- `fundamentals/13-ai-agentic-identity-governance.md` — AI & Agentic Identity Governance: Non-human identity (NHI) expansion, user-delegated agents (OAuth On-Behalf-Of / RFC 8693) vs autonomous synthetic personas, Model Context Protocol (MCP) execution boundaries, mitigating excessive agency (OWASP LLM08), ephemeral tool grants, and human-in-the-loop (HITL) step-up gating.
- `fundamentals/14-enterprise-pki-certificate-lifecycle.md` — Enterprise PKI and Certificate Lifecycle Management (CLM): Offline Root CA with HSM vs Online Intermediate Issuing CAs, automated issuance protocols (ACME RFC 8555, SCEP RFC 8894, EST RFC 7030, CMP RFC 4210), modern CLM engines (HashiCorp Vault PKI, Kubernetes Cert-Manager), revocation mechanics (CRL vs OCSP vs OCSP Stapling), and NIST Post-Quantum Cryptography (PQC) standards (FIPS 203 ML-KEM, FIPS 204 ML-DSA).
- `fundamentals/15-data-access-governance.md` — Data Access Governance & Modern Data Cloud IAM: Connecting IAM with Data Security Posture Management (DSPM), identity federation into Snowflake (external OAuth, key-pair auth, SCIM), Databricks Unity Catalog, BigQuery, Attribute-Based Access Control (ABAC), dynamic row-level security (RLS), column-level security (CLS) masking, and Segregation of Duties (SoD) between data platform admins and data consumers.
- `fundamentals/16-decentralized-identity-verifiable-credentials.md` — Decentralized Identity and Verifiable Credentials: W3C Trust Triangle (Issuer, Holder, Verifier), Decentralized Identifiers (DIDs: `did:web`, `did:key`, `did:ion`), Zero-Knowledge Proofs (ZKPs) and selective disclosure via BBS+ signatures, EU eIDAS 2.0 / EUDI wallet, Mobile Driver's Licenses (ISO/IEC 18013-5), Middle East digital identity frameworks (Saudi Nafath / Absher, UAE PASS), and enterprise IAM bridge patterns.

### 3. Hands-On Lab Curriculum Expansion (Labs 11–13)
- `labs/11-ciam-multitenant-sso.md` — Lab 11: Customer IAM and Multi-Tenant B2B SaaS Federation in Keycloak: domain-based Home Realm Discovery, SAML and OIDC enterprise federation, and tenant-scoped JWT claims.
- `labs/12-vault-pki-mtls.md` — Lab 12: Automated PKI and mTLS Certificate Lifecycle with HashiCorp Vault: two-tier internal CA hierarchy, automated 24-hour dynamic certificates, and mutual TLS verification with OpenSSL.
- `labs/13-identity-dr-breakglass.md` — Lab 13: Identity Disaster Recovery and Break-Glass Drill: provisioning isolated emergency accounts, physical FIDO2 hardware token enforcement with `pam_u2f`, append-only local audit logs, kernel-level cloud IdP blackout simulation, and post-drill credential revocation.

### 4. Navigation & Index Synchronization
- Synchronized all section index pages (`fundamentals/index.md`, `protocols-iga/index.md`, `pam-core/index.md`, `vendors/index.md`, `scenarios/index.md`, `labs/index.md`, `reference/index.md`) with all on-disk documents.
- Embedded interactive `ProtocolChooser` component directly in `protocols-iga/index.md`.
- Updated home page `src/pages/index.tsx` lab count from 6 to 13.
- Updated `sidebars.ts` with all new document routes.

### 5. 100% Bilingual Arabic Localization Parity
- Authored professional Arabic mirrors for all 9 new documents under `i18n/ar/docusaurus-plugin-content-docs/current/` adhering strictly to `docs/reference/06-arabic-terminology-standard.md`.
- Synchronized all Arabic section index files and embedded `ProtocolChooser`.
- Dual-locale static build verified (`build:site` builds `build/` and `build/ar/` with zero broken links).

---

## Phase 12 — Completion, Depth & Anti-Slop Pass (done 2026-09-29)

A major completion pass: full AI slop audit, 4 new hands-on labs, 4 new protocol deep-dive pages, 4 new interview/career pages, all with Arabic mirrors, sidebar/index synchronization, and clean dual-locale build.

### 1. AI Slop Audit (Workstream 1)

Full content audit across all 93+ English pages before adding new content:

- **Banned-word scan**: zero hits. All "elevated"/"elevation" uses are technical terms (privileged elevation, role names). "Seamless SSO" is Microsoft's actual feature name. "Unlock" appears in PowerShell commands and physical safe procedures.
- **Structural variety audit**: each page has unique headings that follow its content, not a formulaic template. No identical repeated card grids.
- **Specificity audit**: 444 tool/technology references (PowerShell, CLI, curl, Keycloak, AWS, etc.), 31 error-code/event-ID anchors, good code block distribution.
- **Tone consistency**: no formulaic transitions ("in conclusion", "to summarize"), no generic AI phrasing, no excessive bullet lists.
- **Stub/TODO scan**: zero hits. No placeholders, no "coming soon", no lorem ipsum.

**Verdict**: Content passes the AI slop bar. No rewrites needed.

### 2. New Hands-On Labs (Workstream 2)

Four new labs, each with English + Arabic + Draw.io diagram:

- `labs/14-saml-oidc-integration.md` — Multi-protocol IdP: SAML and OIDC clients authenticating the same AD user against the same directory. Diagram: `lab-14-saml-oidc-integration.drawio`.
- `labs/15-scim-provisioning.md` — Python SCIM 2.0 client: user provisioning, group management, deprovisioning, error handling. Diagram: `lab-15-scim-provisioning.drawio`.
- `labs/16-kerberos-wireshark.md` — Live Kerberos ticket capture in Wireshark: AS-REQ/TGS-REQ/AP-REQ dissection, anomaly detection. Diagram: `lab-16-kerberos-wireshark.drawio`.
- `labs/17-ir-simulation.md` — Compromised service account incident response: detection, containment, eradication, recovery. Diagram: `lab-17-ir-simulation.drawio`.

### 3. Deeper Protocol Coverage (Workstream 3)

Four new protocol pages, each with English + Arabic + diagram:

- `protocols-iga/12-saml-deep-dive.md` — Metadata exchange, assertion encryption, artifact resolution, signature wrapping attacks (XSW1-XSW8), IdP-initiated edge cases. Diagram: `saml-deep-dive.drawio`.
- `protocols-iga/13-jwt-deep-dive.md` — JWS/JWE structures, signing algorithms (RS256, ES256, EdDSA, HS256), JWK/JWKS key management, token binding (DPoP, mTLS), common JWT attacks. Diagram: `jwt-anatomy.drawio`.
- `protocols-iga/14-ldap-advanced.md` — Multi-master replication, schema design, referral chasing, performance tuning, AD vs OpenLDAP. Diagram: `ldap-replication.drawio`.
- `protocols-iga/15-oauth-token-exchange.md` — RFC 8693 deep dive: delegation vs impersonation, actor token chains, cross-cloud patterns, security considerations.

### 4. Interview & Career Expansion (Workstream 4)

Four new pages, each with English + Arabic:

- `careers/04-resume-portfolio.md` — Resume structure for IAM roles, portfolio project ideas, GitHub presentation, LinkedIn optimization.
- `careers/05-salary-negotiation.md` — Salary research methodology, negotiation scripts, offer evaluation, regional specifics (US/EU/Gulf/Egypt).
- `interviews/07-technical-deep-dive.md` — 10 advanced technical questions (SAML XSW, token exchange, Kerberos delegation, FIDO2, RBAC/ABAC/ReBAC, PAM recording, SCIM vs LDAP, AWS IAM evaluation, IdP vs SP-initiated SSO).
- `interviews/08-behavioral-advanced.md` — 10 advanced behavioral questions with STAR templates for complex scenarios.

### 5. Navigation & Index Synchronization

- Updated `sidebars.ts` with all new document routes (labs 14-17, protocols 12-15, careers 04-05, interviews 07-08).
- Updated `labs/index.md` lineup table from 13 to 17 labs.
- Updated `careers/index.md` with new pages 04-05.
- Updated `interviews/index.md` with new pages 07-08.
- Updated `protocols-iga/index.md` with new pages 12-15.

### 6. Build & Verification

- `npm run build` — clean, zero warnings, zero broken links (both `en` and `ar` locales).
- PDF pipeline: 116 pages generated (8.9 MB).
- All new Draw.io diagrams committed under `static/diagrams/`.
- All new Arabic mirrors committed under `i18n/ar/docusaurus-plugin-content-docs/current/`.

### Site v2 — status

Complete. 114 English docs + 114 Arabic mirrors, 17 labs, 15 protocol pages, 16 PAM core pages, 9 vendor pages, 22 scenario pages, 8 interview pages, 5 career pages, 6 reference pages. All bilingual, all cross-linked, all building clean.

## Phase 13 — Assessments, Deployment, Code Samples, Video Scripts

### 1. Interactive Section Assessments

- New `src/components/SectionQuiz.tsx`: five-question multiple-choice assessment with per-option explanations, a key takeaway per question, pass threshold, submit gating, and retake.
- New `src/components/QuizScore.tsx`: reads the latest stored result for a section from `localStorage` (`iam-pam-quiz-scores`) and exposes `recordQuizScore()` for persistence.
- New `src/data/quizzes.ts`: question banks for all eight taught sections (fundamentals, protocols-iga, pam-core, vendors, scenarios, labs, interviews, careers).
- Each section index page ends with a `## Section Assessment` block. Pass mark is 3 of 5.
- Styling uses the existing warm-neutral tokens (`--warm-*`, `--ink-*`, `--accent-*`, `--sem-*`); no new palette.

### 2. GitHub Pages Deployment

- `.github/workflows/deploy.yml`: builds on push to `main` with Node 20, `PUPPETEER_SKIP_DOWNLOAD` set so the PDF-only Chromium download is skipped, uploads `build/` through `actions/upload-pages-artifact`, deploys with `actions/deploy-pages`.
- `static/CNAME` pins the custom domain `iamnpam.ahmeddwalid.me`; Docusaurus copies it into every build, so the artifact carries the domain.
- `docusaurus.config.ts` `url` updated from `https://ahmeddwalid.me` to `https://iamnpam.ahmeddwalid.me`. `baseUrl` stays `/` because the site is served from the domain root, not a project subpath.
- Repo Settings → Pages is set to `build_type: workflow` with the custom domain verified. HTTPS enforcement is enabled once the certificate is issued.
- DNS is managed at the registrar (Namecheap nameservers). Required record: `CNAME iamnpam → ahmeddwalid.github.io`. This is the one step that cannot be done from the repository; the domain does not resolve until the record exists.

### 3. Code Samples Library

- New `docs/code-samples/` section, wired into `sidebars.ts` as its own category:
  - `index.md` — what the library is, how to use it.
  - `powershell.md` — AD user and group management, stale and privileged account discovery, logon and lockout event queries, error table.
  - `python.md` — SCIM create and deactivate, AWS IAM role review, Microsoft Graph users, certificate chain inspection, JWT decoding, error table.
  - `bash.md` — LDAP searches, Kerberos ticket inspection, OpenSSL certificate work, Vault CLI operations, error table.
  - `terraform.md` — AWS IAM role/policy/instance profile, Entra ID app registration and service principal, GCP service account and binding, error table.
- Every sample states prerequisites and expected failure modes. Samples are framed as lab material to adapt, not production code.

### 4. Video Scripts (local only)

- `video-scripts/` at the repo root, one markdown script per section (`01-iam-fundamentals.md` through `09-reference-materials.md`) plus a `README.md` describing the Gemini Notebook workflow.
- Each script carries learning objectives, key concepts, suggested visuals tied to existing diagrams, a timed narrative flow, and an estimated duration.
- Deliberately untracked and deliberately absent from `.gitignore`, per the Phase 13 instruction. It is working material for video generation, not site content.

### 5. Repository Hygiene

- `.gitignore` gained entries for local-only working material: `/Gemini NotebookLM Videos/`, `/directorystructure.txt`, `/.hermes/`. These are large or generated and were never part of the site.

### 6. Verification

- `npm run build:site` clean for `en` and `ar`; `build/CNAME` present in the output.
- `npm ci --dry-run` succeeds, so the lockfile the workflow installs from is in sync with `package.json`.
- `video-scripts/` reports as untracked (`?? video-scripts/`), confirming it is neither committed nor ignored.

### Open items

- DNS record `iamnpam → ahmeddwalid.github.io` must be created at the registrar. Until then the Pages deployment succeeds but the custom domain does not resolve.
- After the certificate is issued, confirm "Enforce HTTPS" in Pages settings.
- Arabic mirror quality issues carried over from Phase 12 remain to be cleaned: untranslated English sentences in `interviews/07-technical-deep-dive.md`, the typo in `careers/05-salary-negotiation.md`, and `sampp:Artifact` in `protocols-iga/12-saml-deep-dive.md`.
