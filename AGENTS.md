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

- Keep upstream files diffable: change the minimum, and put a short comment
  above each change that says why it differs from hookify.
- Keep the Apache 2.0 LICENSE and NOTICE. Apache 2.0 requires that modified
  files carry a notice that they changed: keep the line at the top of each
  modified Python file.
- Do not add Python dependencies. Upstream runs on the stdlib and Python 3.7+.
- Unit tests are `python3 -m unittest discover -s plugin/tests`.
- Acceptance scenarios are Gherkin under `features/`, run by nukadoko
  (`npm install`, then `npx nuka check` and `npx nuka run features`). They
  drive the hook scripts through `hooks.json`, the way Claude Code does, so
  they do not depend on the implementation language. Each feature has an
  acceptance record beside it; `npx nuka accept <feature>` writes a new one
  after a green run on a clean tree.
- Development loop: `claude --plugin-dir "$PWD/plugin"` loads the working tree
  for one session. Rules for a live test go in `~/.claude/steerhook/`.
