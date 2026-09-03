# hookify (fork)

A fork of Anthropic's [hookify](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/hookify)
plugin for Claude Code. Write a rule in a markdown file, and the plugin blocks or
warns before a tool runs.

## What is different from upstream

- **The rule message reaches Claude.** Upstream sends the message only to the
  user. Claude sees "denied" and cannot learn the alternative the rule asks for.
  This fork sends the message as `permissionDecisionReason` (block) or
  `additionalContext` (warn). The user still sees it as `systemMessage`.
- **Rules can live in `~/.claude/hookify/*.md`.** Upstream reads rules only from
  the project's `.claude/` directory. Rules about your own tools apply in every
  project, so they need one place. The `/hookify` command and the
  writing-rules skill write there. Set `HOOKIFY_RULES_DIR` to use a different
  directory. A project rule with the same `name` replaces the user rule, and
  a disabled one switches the user rule off in that project.
- **Project rules resolve from the hook's `cwd`**, not from the process working
  directory. A plugin hook can run in the plugin's own directory, and then
  upstream finds no rule.
- **The PostToolUse hook is removed.** Rules read only the tool input, so the
  PostToolUse hook repeated the PreToolUse check and put the message in the
  transcript twice.
- **A quoted pattern loses one pair of quotes, not every quote.** Upstream
  stripped every `"` and `'` at both ends. A regex such as `[^"]*"` lost its
  closing quote.

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
pattern: (^|[\s;&|(])codex\s+exec\b
action: block
---

Do not run `codex exec` from Bash. Send the task to the `codex:codex-rescue`
subagent with `--wait`, so the completion arrives as an agent notification.
```

The rule format is upstream's. See `plugin/README.md`.

## Develop

```sh
python3 -m unittest discover -s plugin/tests
```

The plugin runs on the Python standard library, so there is nothing to
install.

## License

Apache License 2.0. See `LICENSE` and `NOTICE`.
