# CLAUDE.md

This project's real instructions live in `AGENTS.md` and `SPEC.md`. Read both in full before doing anything else — do not treat this file as a summary you can act on instead of them.

`AGENTS.md` and `SPEC.md` are written to be harness-agnostic on purpose, so the same two files work whether this repo is being driven by Claude Code, OpenCode, or anything else. This file only holds the handful of notes specific to running as Claude Code.

## Claude Code-specific notes

- Use the todo/task list tool to track phase progress within a session — mirror it into `PROGRESS.md` at the end of the session so the state survives a context reset, per `AGENTS.md` §6.
- For a phase with several independent content files (e.g., a batch of vendor deep-dive pages, or a batch of interview questions), consider dispatching subagents/tasks in parallel — one per file — rather than writing them serially. Give each subagent the relevant slice of `SPEC.md`, the full `AGENTS.md` §3 design law, and §5 content-integrity rules, since those apply to every file regardless of which agent writes it.
- Use the web search tool (if enabled for this session) to verify certification names, prices, and prerequisites before writing about them, per `AGENTS.md` §5. If web search is not enabled in this session, mark the relevant sections as unverified rather than guessing, and say so in your end-of-phase summary.
- Run `npm run build` before reporting a phase complete. Fix broken links and build warnings before moving on — do not defer them to "polish later."
- If you're about to write more than roughly one phase's worth of content in a single turn, stop at the phase boundary instead. Long uninterrupted generation is exactly how the design law in `AGENTS.md` §3 quietly drifts back toward default patterns.
