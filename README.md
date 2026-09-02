# hookify (fork)

A fork of Anthropic's [hookify](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/hookify)
plugin for Claude Code. Write a rule in a markdown file, and the plugin blocks or
warns before a tool runs.

## What is different from upstream

- **The rule message reaches Claude.** Upstream sends the message only to the
  user. Claude sees "denied" and cannot learn the alternative the rule asks for.
  This fork sends the message as `permissionDecisionReason` (block) or
  `additionalContext` (warn).
- **Rules can live in `~/.claude/hookify/`.** Upstream reads rules only from
  the project's `.claude/` directory. Rules about your own tools apply in every
  project, so they need one place.
- **Project rules resolve from the hook's `cwd`**, not from the process working
  directory.

## Install

```sh
/plugin marketplace add meganemura/hookify
/plugin install hookify@hookify
```

For one session from a working tree:

```sh
claude --plugin-dir /path/to/hookify/plugin
```

## Write a rule

`~/.claude/hookify/no-direct-codex-exec.md`:

```markdown
---
name: no-direct-codex-exec
enabled: true
event: bash
pattern: (^|[;&|]\s*)codex\s+exec\b
action: block
---

Do not run `codex exec` from Bash. Send the task to the `codex:codex-rescue`
subagent with `--wait`, so the completion arrives as an agent notification.
```

The rule format is upstream's. See `plugin/README.md`.

## License

Apache License 2.0. See `LICENSE` and `NOTICE`.
