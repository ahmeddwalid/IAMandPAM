# SPEC.md — Content Specification

Read `AGENTS.md` first — it governs design, diagram, and content-integrity rules for every phase below. This file is the "what to build," organized into phases. Each phase ends at a **checkpoint**: stop, run the build, summarize what you did and any facts you couldn't verify, and wait for review before starting the next phase.

Phases roughly track the original ten-part outline, but re-sequenced so foundational content ships before the content that depends on it, and with realistic scope per pass instead of "everything, fully fleshed out, in one shot."

## Core diagram set (Draw.io)

These are the comprehensive, professional diagrams the site is built around — see `AGENTS.md` §4 for format policy and rendering mechanism. Track these explicitly; they're easy to lose across a phased build.

| Diagram | Phase | Shows |
|---|---|---|
| Complete IAM architecture | 2 | Users → IdP → applications → directories, pulling together the protocols covered in that phase |
| Complete PAM architecture | 3 | Admin → PSM → vault → target, with HA/DR and SIEM/ticketing integration points |
| Zero-trust IAM architecture | 3 | How JIT access and standing-privilege elimination fit a zero-trust model |
| JIT access workflow | 3 | Request → approval → time-boxed grant → automatic revocation |
| Hybrid identity architecture | 4 | On-prem AD + Entra ID + cloud apps, in the Microsoft stack section |
| Per-project lab architecture | 8 | One per hands-on project (5 total) |
| Site topic map | 9 | How every part of the site relates to and builds on every other part |

Everything else diagram-worthy (protocol sequence flows, simple lifecycle states) is Mermaid per `AGENTS.md` §4 and is called out inline in each phase below.

---

## Phase 0 — Project setup
**Deliverable:** a running Docusaurus v3 site, empty of real content but fully configured.
- `docusaurus.config.ts`, `sidebars.ts`, `package.json` per the stack decisions in `AGENTS.md` §2.
- `src/css/custom.css` implementing the design tokens in `AGENTS.md` §3 — this must be done before any content page exists, not retrofitted later.
- Custom favicon (key + lock mark), custom site title ("IAM & PAM Reference" or similar — not "IAM & PAM Masterclass," see the copy rules in §3, avoid superlative self-labeling in the actual title).
- Empty top-level nav structure matching Parts 2–9 below, each linking to a single stub landing page that will be filled in its own phase.
- Diagram rendering mechanism chosen and proven: get `@docusaurus/theme-mermaid` working on one throwaway Mermaid diagram, and get one of the three Draw.io rendering options from `AGENTS.md` §4 working on one throwaway `.drawio` diagram. Record which Draw.io option you used, and why, in `PROGRESS.md`.
- `PROGRESS.md` created.
**Checkpoint:** `npm run build` succeeds. Site loads locally with correct fonts/colors/nav and no default Docusaurus branding left anywhere (check the browser tab title and favicon specifically). Both a real Mermaid diagram and a real Draw.io diagram render correctly on a test page before Phase 1 starts — don't discover a rendering problem three phases in.

## Phase 1 — IAM Fundamentals, Authentication, Authorization
Maps to original Part 2, sections 1–3.
- What is IAM: definition, business value, scope.
- AAA (Authentication, Authorization, Accounting).
- Identity lifecycle: Joiner-Mover-Leaver (JML), with a Mermaid state diagram.
- Least privilege, Zero Trust — as concepts here; full architecture diagrams belong in Phase 3/7, don't duplicate.
- Authentication: password auth and its decline, MFA (factor types, implementation patterns), passwordless (FIDO2/WebAuthn, biometrics), SSO (mechanism, benefits, risks).
- Authorization: RBAC, ABAC, PBAC, static vs. dynamic — with a Draw.io diagram showing how a role, permission, and resource relate (this is a structural/relationship diagram, not a sequence, so it follows the Draw.io default in `AGENTS.md` §4).
**Checkpoint:** every subsection has real prose (not stub headers), at least one diagram for JML and one for RBAC vs ABAC, no unsourced stat claims per `AGENTS.md` §5.

## Phase 2 — Identity Protocols & IGA
Maps to original Part 2, sections 4–5.
- LDAP: directory structure, binds, common use cases and failure modes — with a Draw.io diagram of a sample directory tree (structural, so Draw.io per `AGENTS.md` §4).
- SAML 2.0: assertions, SP vs IdP, full Mermaid sequence diagram of the flow (a sequence diagram — Mermaid is the right call here).
- OAuth 2.0: authorization code, implicit (and why it's deprecated — verify current guidance), client credentials flows; scopes and tokens. Mermaid sequence diagram per flow.
- OIDC: ID tokens, UserInfo endpoint, relationship to OAuth. Draw.io diagram showing OIDC layered on OAuth — this is a structural/conceptual relationship, not a sequence, so it breaks from the other protocol diagrams and uses Draw.io.
- SCIM: provisioning model, schema basics, a realistic example payload. A simple Mermaid flow diagram of the provisioning request/response is enough here.
- IGA: access certification/recertification cycles, Segregation of Duties (SoD) with a concrete example, compliance frameworks (NIST, ISO 27001, GDPR, SOC 2 — one paragraph each on what they actually require re: identity, not a full compliance course), audit logging expectations.
- Close the phase with the **Complete IAM architecture** diagram from the core diagram set above (Draw.io) — users → IdP → applications → directories — tying every protocol in this phase together into one picture.
**Checkpoint:** each protocol has a working diagram in the correct format (Mermaid for the sequence flows, Draw.io for the LDAP tree and the OIDC/OAuth relationship) plus prose, and the phase-closing IAM architecture diagram is in place. Cross-link this section from Phase 1's authentication/authorization pages once both exist.

## Phase 3 — PAM Core
Maps to original Part 3.
- What is PAM, and precisely how it differs from IAM (this is a common interview question — make the distinction sharp and concrete, not just "PAM is a subset of IAM").
- Types of privileged accounts: local admin, domain admin, root, service accounts, application accounts.
- Core capabilities: credential vaulting, Privileged Session Management (PSM), Just-in-Time access, PEDM, AAPM — each gets a short "what breaks without this" framing, since that's what makes PAM concepts memorable and interview-ready.
- PAM best practices: classification, least privilege enforcement, monitoring/alerting, rotation, audit.
- **Complete PAM architecture** (core diagram set, Draw.io): admin → PSM → vault → target, plus HA/DR note and SIEM/ticketing integration points.
- **Zero-trust IAM architecture** (core diagram set, Draw.io): how JIT access and eliminating standing privilege fit a zero-trust model — this is the natural home for the zero-trust concept introduced in Phase 1, since PAM/JIT is where it becomes concrete.
- **JIT access workflow** (core diagram set, Draw.io): request → approval → time-boxed grant → automatic revocation, alongside the Just-in-Time Access capability write-up above.
**Checkpoint:** the IAM-vs-PAM distinction page is strong enough to answer the interview question directly and completely on its own. All three Draw.io diagrams for this phase render correctly and have their source files under `static/diagrams/`.

## Phase 4 — Vendor Landscape
Maps to original Part 4. **Verify every claim in this phase with a web search before writing it** — vendor product names, certification structures, and even company ownership change (for example, confirm current CyberArk/Palo Alto Networks corporate relationship, confirm current PAM-DEF/PAM-SEN exam names and eligibility requirements, before stating them as fact). Date-stamp each vendor page with an HTML comment noting when it was last verified.
- CyberArk: architecture and components, certification track (verify current names/eligibility — as of mid-2026 this required ~6 months of hands-on CyberArk experience before sitting the Defender exam, and exams moved to in-person Pearson VUE testing in late 2025; re-verify both before publishing), realistic implementation scenario.
- Delinea (Secret Server, Privilege Manager): architecture, deployment model.
- BeyondTrust (Password Safe, Privilege Management): architecture, use cases.
- Microsoft stack: on-prem AD (domains/forests/trusts/GPOs), Entra ID (hybrid identity, PIM), Conditional Access, MIM — include the **Hybrid identity architecture** diagram here (core diagram set, Draw.io): on-prem AD + Entra ID + cloud apps.
- Cloud IAM: AWS IAM + IAM Identity Center, Google Cloud IAM, Azure/Entra RBAC and managed identities — treat this as its own strong subsection, not an afterthought; it's the most accessible hands-on category for someone without enterprise PAM tooling access (see `SPEC.md` Phase 8).
- Governance tools: SailPoint IdentityIQ, Okta Identity Governance, Saviynt — shorter treatment, positioning/comparison rather than full deep dives.
**Checkpoint:** every certification name, cost, and prerequisite claim in this phase has been verified within the current session, not pulled from training-data memory.

## Phase 5 — Real-World Scenarios & Troubleshooting
Maps to original Part 7.
- Scenarios: onboarding (Joiner), role change (Mover), termination including emergency offboarding (Leaver), privileged access request/approval workflow, access certification campaign, MFA enrollment/recovery, new SaaS SSO integration.
- Troubleshooting guides — each with symptoms, root cause, step-by-step resolution, prevention: LDAP bind failures, certificate mismatches, PAM integration/session errors, AWS IAM policy misconfigurations, SAML assertion/attribute-mapping errors, MFA time-drift/lost-device recovery, SCIM provisioning failures.
- Incident response: compromised privileged account, insider-threat session review, ransomware emergency credential rotation.
**Checkpoint:** every troubleshooting guide has been sanity-checked for technical accuracy (real error message formats, real config parameter names) rather than plausible-sounding invention, per `AGENTS.md` §5.

## Phase 6 — Interview Preparation
Maps to original Part 6. **Build this in waves, not one pass** — full-treatment interview answers (concise answer + detailed explanation + why-it-matters + likely follow-ups) are expensive to write well, and a large bank of thin, generic answers is worse than a smaller bank of strong ones.
- **Wave 1:** 15 conceptual + 10 protocol questions, full treatment. Cover the highest-frequency real questions (IAM vs PAM, OAuth flow explanation, SAML vs OIDC, least privilege, JIT access, etc.).
- **Wave 2:** 15 scenario-based + 10 architecture questions, full treatment, cross-linking to the relevant Phase 3/5 pages instead of re-explaining PAM architecture from scratch.
- **Wave 3:** behavioral questions using STAR, with realistic example answers framed as templates the reader fills in with their own experience — do not invent a fake personal story and present it as if it happened to the reader.
- Expand each wave's count over time as the site matures; do not pad to hit "50 per level" with low-value repeats.
**Checkpoint (per wave):** every answer's "detailed explanation" is technically correct on its own, not just a rephrase of the concise answer.

## Phase 7 — Certifications & Career Progression
Maps to original Part 8. This phase is the highest-risk for fabricated numbers — apply `AGENTS.md` §5 strictly.
- For each certification (Security+, SC-300, Okta Certified Professional, SailPoint IdentityIQ Engineer, CyberArk Defender/Sentry, CISSP): what it covers, verified current cost, verified prerequisites, realistic difficulty note, which roles actually ask for it.
- Career ladder: IAM Analyst → Engineer → Senior → Architect → Director, and PAM Specialist → Engineer → Senior → Architect. For salary ranges, either cite a real source inline or label the figure clearly as a rough estimate with its basis stated — do not present a bare number as fact.
- Include an honest note that PAM specialist roles typically expect prior IAM/infra/security-operations experience rather than being a first job, and that the credential-eligibility rule above (CyberArk requiring hands-on experience first) is a structural reason for that, not just convention.
- Regional note: cover US/EU/remote generally, but give the Middle East/Gulf and Egypt market its own real subsection — this is the site owner's actual target market and generic US-centric advice undersells it.
**Checkpoint:** no salary or market-size figure in this phase is a bare unsourced number.

## Phase 8 — Hands-On Labs & Projects
Maps to original Part 9. Bias toward labs buildable without paid enterprise licenses, since that's the realistic starting point for most readers.
- Home lab setup: VirtualBox/VMware, Windows Server + AD, Keycloak (fully open-source IdP — the most accessible SSO lab).
- Note CyberArk/Delinea/BeyondTrust trial availability honestly (time-limited trials, not full production features) rather than implying a home lab equals real PAM production experience.
- Projects, each with objectives, step-by-step instructions, one architecture diagram (Draw.io, per the core diagram set), verification steps, common pitfalls:
  1. Basic IAM: AD + Keycloak SSO.
  2. Cloud IAM: AWS IAM Identity Center federation, or Entra ID + on-prem AD hybrid sync — pick based on which cloud the reader can get a free tier on.
  3. PAM fundamentals on a trial/Community Edition (vaulting, PSM, session recording) — framed explicitly as a learning exercise, not a claim of production PAM experience.
  4. Zero-trust pattern: JIT access + MFA enforcement, built on Keycloak or Entra ID conditional access.
  5. Lightweight IGA: access certification workflow and SoD check, even if hand-rolled rather than a full IGA product.
**Checkpoint:** each project has been actually thought through step-by-step (not just a bullet list of buzzwords) — a reader should be able to follow it and land on a working result.

## Phase 9 — Home Page, Glossary, Cheat Sheets, Polish
Maps to original Parts 1.2 and 10.
- Home page: what the site covers, the learning path with realistic time estimates, and a link into the career section — written per `AGENTS.md` §3 copy rules (no hero-metric template, no generic CTAs). Anchor it with the **site topic map** (core diagram set, Draw.io) — how every part of the site relates to and builds on every other part.
- Glossary: every acronym used elsewhere in the site, cross-linked.
- Cheat sheets: SAML/OAuth/LDAP syntax quick reference, common PowerShell IAM commands.
- External links: curated, real, checked-live links to official docs (Microsoft Learn, AWS docs, CyberArk docs, etc.) — no aggregator spam.
- Full site pass against the `AGENTS.md` §3 checklist page by page, and a full link/build check.
**Checkpoint:** this is the final checkpoint before calling the site v1-complete. Confirm `npm run build` is clean and do one full read-through for tone drift back toward generic AI copy patterns — it creeps in over a long build.

---

## Explicitly out of scope for v1
Algolia search setup, multi-language i18n, a CMS/headless backend, user auth/accounts on the site itself. These can be follow-up phases if wanted later — don't let them block v1.
