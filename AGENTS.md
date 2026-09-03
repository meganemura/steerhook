# AGENTS.md

Context for agents that work in this repository.

## What this is

steerhook, a Claude Code plugin. It started as a fork of Anthropic's `hookify`
plugin (Apache 2.0, see NOTICE). The plugin lives in `plugin/`. The repository
root is a plugin marketplace (`.claude-plugin/marketplace.json`).

## Why it exists

hookify can block a tool call, but the rule's message goes only to the user
(`systemMessage`). Claude sees "denied" and nothing else, so it cannot learn
the alternative the rule wants. steerhook puts the message where Claude reads
it (`permissionDecisionReason`, `additionalContext`) and keeps the rules in
`~/.claude/steerhook/`, so they apply in every project.

## Visibility

Public-possible. Commit messages, comments, and docs are in English.
Follow ASD-STE100 Simplified Technical English.

## Rules

- The plugin code is a TypeScript port of hookify's Python, file for file.
  Each ported file starts with a "Ported from" line; keep it. Keep the
  Apache 2.0 LICENSE and NOTICE.
- No build step and no runtime dependency. node (22.18 or later) runs the
  `.ts` files directly through `plugin/hooks/run.sh`, so write only syntax
  node can strip: no `enum`, no `namespace`, `import type` for types,
  and the `.ts` extension on relative imports.
- The scenarios under `features/` are the behavior contract. Change a
  behavior by changing its scenario first.
- Acceptance scenarios are Gherkin under `features/`, run by nukadoko
  (`npm install`, then `npx nuka check` and `npx nuka run features`). They
  drive the hook scripts through `hooks.json`, the way Claude Code does, so
  they do not depend on the implementation language. Each feature has an
  acceptance record beside it; `npx nuka accept <feature>` writes a new one
  after a green run on a clean tree.
- `test/` holds property tests run by `node --test` (`npm test`), written with
  hegel. They cover the command views, where a hand-written example list
  cannot reach the quoting cases. Acceptance scenarios stay the contract;
  these check one module against generated input.
- Development loop: `claude --plugin-dir "$PWD/plugin"` loads the working tree
  for one session. Rules for a live test go in `~/.claude/steerhook/`.
