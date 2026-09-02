# AGENTS.md

Context for agents that work in this repository.

## What this is

A fork of Anthropic's `hookify` plugin for Claude Code (Apache 2.0, see NOTICE).
The plugin lives in `plugin/`. The repository root is a plugin marketplace
(`.claude-plugin/marketplace.json`) so the fork installs like the original.

## Why the fork exists

Upstream hookify can block a tool call, but the rule's message goes only to the
user (`systemMessage`). Claude sees "denied" and nothing else, so it cannot
learn the alternative the rule wants. This fork puts the message where Claude
reads it (`permissionDecisionReason`, `additionalContext`) and lets rules live
in `~/.claude/hookify/` so they apply in every project.

## Visibility

Public-possible. Commit messages, comments, and docs are in English.
Follow ASD-STE100 Simplified Technical English.

## Rules

- Keep upstream files diffable: change the minimum, and put a short comment
  above each change that says why it differs from upstream.
- Keep the Apache 2.0 LICENSE and NOTICE. Apache 2.0 requires that modified
  files carry a notice that they changed: add one line at the top of each
  modified Python file.
- Do not add Python dependencies. Upstream runs on the stdlib and Python 3.7+.
- Tests are `python3 -m unittest discover -s plugin/tests`.
- Development loop: `claude --plugin-dir "$PWD/plugin"` loads the working tree
  for one session. Rules for a live test go in `~/.claude/hookify/`.
