# AGENTS.md — IAM & PAM Masterclass

This file is the persistent operating manual for any AI coding agent (Claude Code, OpenCode, Codex, Cursor, etc.) working in this repository. Read this file and `SPEC.md` in full before writing any code or content. Do not start generating pages until you have both loaded.

## 1. What this project is

A Docusaurus v3 reference site covering Identity and Access Management (IAM) and Privileged Access Management (PAM), built by a cybersecurity graduate as a public portfolio piece and personal learning system. The audience is two people at once: the author (learning the material by building it) and hiring managers/recruiters who land on the site and should walk away thinking "this person actually understands identity security," not "this person ran a prompt."

Because the second audience is evaluating credibility, sloppy AI-generated design or hallucinated facts are worse than no site at all. Correctness and craft outrank speed and volume.

## 2. Tech stack — decided, do not re-litigate

- Docusaurus v3 (classic preset), TypeScript config.
- Diagrams: two mechanisms, chosen per diagram per §4 — `@docusaurus/theme-mermaid` for simple sequence/linear diagrams (renders natively), and a Draw.io rendering path (see §4 for the ranked options) for comprehensive architecture/topology diagrams, which are the default for anything non-trivial.
- Search: `@easyops-cn/docusaurus-search-local` (offline, zero-config, no external account needed). Do not set up Algolia DocSearch — it requires an application/approval process outside this repo's control. If Ahmed later wants Algolia, that's a follow-up task, not part of this build.
- Dark/light mode: Docusaurus classic theme default, re-themed per the design law below (do not ship default Infima colors).
- Package manager: npm.

## 3. The Anti-AI-Slop Design & Copy Law

This site must not look or read like a default AI-generated site. This rule applies to every page you create for the life of the project, not just the first pass. Before shipping any page, check it against this list.

**Surfaces:** no gradient text/fills, no glassmorphism, no glow effects, no pure white/black surfaces, no uniform drop-shadow on every card, no uniform border-radius everywhere, no dot-grid/graph-paper hero backdrops, no decorative border-left accent stripes over 1px.
Instead: warm neutral surfaces (`#f8f6f2`, `#f5f3ef`, `#eae8e4`), matte cards with fine 1px borders (`#e0ddd8`), varied border-radius by component type (4px cards / 8px buttons / 2px inputs), low-contrast varied shadows.

**Layout:** no identical repeated card grids, no three-icon-heading-paragraph feature grid, no centered marketing hero with two buttons, no fake "trusted by" logo strips, no bento grids used as a default. Use asymmetrical layouts, sidebars, and structure that varies by what the page actually contains. Section headers describe content ("Core Authentication Protocols"), never marketing copy.

**Typography:** not Inter/system-default as primary. Use a serif or humanist display face for headings (e.g. EB Garamond, Merriweather, or Source Serif) paired with a clean sans body face (Source Sans 3, Open Sans). Use the full weight range (300/400/500/600/700), and a custom type scale (0.75 / 0.875 / 1 / 1.125 / 1.25 / 1.5 / 2 / 2.5rem) — not the Tailwind/Bootstrap defaults.

**Color:** no blue/purple as the default accent, no rainbow chart palettes, no single accent at full saturation everywhere. Base: warm neutrals (`#3d352a`, `#5a4f42`, `#7a6e5f`, `#b5aa9a`, `#d5cdc0`). Accent: pick one — deep red `#c0392b`, forest green `#2c7a4a`, or ochre `#b76e2e` — and build a 5–7 shade tonal ramp from it. Charts use a muted sequential or diverging ColorBrewer palette, matched to what the data actually is (see §5 on fabricated data).

**Motion:** only on real interactive elements (hover on things that are actually clickable). No scroll-triggered fade-ins on documentation pages. No hover scale-up. No skeleton loaders for instant content. No confetti.

**Icons:** one consistent set (Lucide or Feather), used only where they add meaning (a lock next to "Authentication," not next to every bullet). No emoji as icons, no sparkle/star for "AI" features, no decorative arrows on buttons that don't navigate anywhere.

**Copy:** professional, neutral, instructional. Periods, not exclamation points. No em dashes in UI copy. Never "deep dive," never "delve." Ban list: seamless, effortless, unlock, empower, elevate, streamline, revolutionize, cutting-edge, leverage, robust, supercharge, game-changing. No "it's important to note," no "not just X, but Y," no rhetorical-question headers ("Ready to get started?"), no generic CTAs — write the specific action ("View the OAuth 2.0 Authorization Code Flow," not "Learn More").

**Completeness:** every link resolves, every route has real content, custom favicon (key+lock mark, not a framework default), custom tab title per page, meaningful alt text, zero TODO comments or stub sections in anything you mark as done.

The test before marking any page complete: **would a screenshot of this page read as AI-generated to someone who has seen a lot of AI-built interfaces?** If yes, redo it.

## 4. Diagram policy

Diagram format is chosen by what the diagram needs to communicate, not by whichever is easier to generate:

- **Draw.io — primary, default for anything comprehensive.** Any diagram meant to show architecture, topology, how a set of components or topics relate to each other, or "where everything stands" in the bigger picture gets a full, professional Draw.io diagram. This includes: complete IAM architecture, complete PAM architecture, hybrid identity architecture (on-prem AD + Entra ID + cloud), zero-trust IAM architecture, JIT access workflow, every vendor's component architecture, every hands-on-lab project's architecture, and the site's own topic map (see below). Comprehensive, professional diagrams are a core deliverable of this project — don't downgrade one to Mermaid because Mermaid is faster to produce.
- **Mermaid — only for genuinely simple, linear diagrams.** A straightforward sequence diagram (OAuth/SAML/OIDC message flow), a simple linear state/lifecycle diagram (Joiner-Mover-Leaver), or a short flowchart with a handful of nodes and no crossing lines can stay Mermaid — it renders natively via `@docusaurus/theme-mermaid` and is easy to keep accurate. Test: does this diagram show a system's structure or relationships, or does it just show one thing happening after another in order? Structure → Draw.io. Sequence → Mermaid is fine.

### Making Draw.io actually render

Docusaurus does not render raw `.drawio` XML dropped in a markdown code fence — it will just show as an unreadable code block, which fails the completeness bar in §3. Get a real diagram on the page with one of these, tried in this order:

1. **`docusaurus-plugin-drawio`** (npm, MIT) — purpose-built for this: renders a `.drawio` file client-side via a `@theme/Drawio` component. Try it first, but verify it actually works against the Docusaurus version pinned in this repo before rolling it out everywhere — it's a small, infrequently-updated package and could have friction with a current Docusaurus 3.x/webpack setup. Prove it on one diagram before committing site-wide.
2. **A small custom `DrawioEmbed` component** (`src/components/DrawioEmbed.tsx`) built on draw.io's official embed-mode API (documented at drawio.com's embed-mode FAQ), or the `react-drawio` package that wraps it — an iframe-based viewer, set to view-only (no toolbar/editing chrome) so it reads as a finished diagram, not an open editor. Fall back to this if option 1 doesn't pan out.
3. **Static SVG export, checked in as an image.** If both of the above cause friction, export the `.drawio` file to SVG (draw.io desktop's CLI export, or manually via the free web app) and embed it as a plain image. Least interactive, but zero rendering-pipeline risk, and still fully satisfies "professional and comprehensive" — the requirement is diagram quality, not that it's clickable.

Pick one approach, verify it works on a real page early (Phase 0, or the very start of Phase 1), and record the choice and why in `PROGRESS.md` so it isn't re-decided every phase.

Whichever mechanism is used, every Draw.io diagram:
- Has its `.drawio` source file committed under `static/diagrams/`, so it stays editable in the free diagrams.net app.
- Has a visible "Download / edit this diagram" link next to the rendered version.
- Gets a caption and a short paragraph of prose underneath — a diagram alone is never a complete section.

### Layout discipline for hand-authored XML

An LLM authoring Draw.io XML places every node and edge waypoint by explicit x/y coordinates with no visual feedback loop — a much easier way to end up with overlapping boxes or ugly crossing lines than Mermaid's auto-layout. Mitigate this:
- Snap to a consistent grid (e.g., multiples of 40px) with generous, uniform spacing. Don't pack a diagram tightly.
- Prefer orthogonal edge routing over diagonal lines — it fails more gracefully when spacing is imperfect.
- Cap any single diagram at roughly 12–15 nodes. If a topic needs more, split it into two linked diagrams rather than cramming one.
- If the harness has any way to render the XML to an image and view it (a headless export step, a screenshot), do that and check for overlaps before marking the diagram done. If it doesn't, the grid/spacing/node-count discipline above is the substitute for a visual check — stay conservative rather than ambitious on layout complexity.

### The site's own topic map

Somewhere in Phase 9 (home page / learning path), build one comprehensive Draw.io diagram mapping the whole site: how IAM fundamentals, protocols, PAM, the vendor landscape, and the career track relate to and build on each other. This is the "where does everything stand" view of the project itself, not just of any one technical architecture — give it the same care as the technical diagrams.

## 5. Content integrity — this is the part most likely to go wrong

The single biggest risk to this project's credibility is confidently stated facts that are wrong. Follow these rules without exception:

- **Never fabricate statistics, salary figures, or claims about what a certification "typically" pays.** If you state a number (salary range, exam cost, exam pass score, headcount, market size), either (a) you have a real source for it and cite it inline as a footnote/link, or (b) you label it explicitly as an estimate with the basis stated ("rough estimate based on regional cost-of-living, not a survey figure"). Unsourced round numbers like "10,000+ professionals" or "99% of enterprises" are banned outright, per §3.
- **Certification names, prices, and eligibility requirements change.** Before writing any page about a specific certification (SC-300, CyberArk Defender/Sentry, AWS certifications, etc.), verify current name, cost, and prerequisites with a web search if the harness has one available. Note the verification date in an HTML comment at the top of the file (`<!-- verified 2026-08-17 -->`) so staleness is easy to spot later. Flag anything you could not verify rather than guessing.
- **Do not reproduce vendor documentation, articles, or third-party text verbatim**, even short passages. Paraphrase in your own words and link to the original source. This matters both legally and because copy-pasted vendor marketing is exactly the kind of thing that reads as low-effort.
- **No fake testimonials, no placeholder personas (Jane Doe, Acme Corp).** If you want an example organization, use a real, named company in a hypothetical scenario framed clearly as hypothetical ("Suppose Acme Bank, a mid-size regional bank, needs to..." is fine only if you invent the name and say so — do not attribute invented quotes to real companies or people).
- **Interview-question answers and troubleshooting guides must be technically correct**, not just plausible-sounding. If you are not confident in a technical detail (a specific error message, a specific API parameter), verify it or soften the claim rather than inventing specifics.

## 6. Session and workflow discipline

This project is too large to generate in one sitting or one context window. Treat it as a multi-session build, not a single generation task.

- Maintain `PROGRESS.md` at the repo root. After finishing any phase from `SPEC.md`, update it: what's done, what's next, any open questions or facts you couldn't verify.
- Work one phase at a time, in the order given in `SPEC.md`, unless the person running you says otherwise.
- At the end of each phase, run `npm run build` and confirm it succeeds with no broken links before considering the phase done — Docusaurus's build-time broken-link checker is your completeness check for §3.
- Stop and summarize at the checkpoints marked in `SPEC.md`. Do not silently continue into the next phase past a checkpoint — the person needs to review content accuracy and design direction before it compounds across dozens more pages.
- If a phase turns out to be bigger than expected (e.g., the interview-question bank), say so and propose splitting it further rather than producing thin, rushed content to hit an arbitrary count.

## 7. Repo conventions

```
/docs/                  # all content, organized by SPEC.md's part numbering
/src/css/custom.css     # design tokens from §3 — no default Infima colors left in place
/static/diagrams/       # exported diagram assets (svg/png, plus optional .drawio sources)
/static/img/favicon.*   # custom favicon — never the Docusaurus default
PROGRESS.md             # session-to-session status log (see §6)
SPEC.md                 # content specification and phase breakdown
```
