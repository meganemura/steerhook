# steerhook

A hook that steers. Write a rule that names a command pattern you do not want
Claude to run and the form you want instead. Before Claude runs a tool,
steerhook checks the call against your rules. A rule can block the call or let
it through with a warning. In both cases the rule's message reaches Claude, so
Claude learns the alternative at the moment it matters.

Rules are yours. They live in `~/.claude/steerhook/` and apply in every
project. A project's own rules are never read.

steerhook is a fork of Anthropic's
[hookify](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/hookify)
plugin for Claude Code (Apache 2.0, see `NOTICE`).

## What is different from hookify

- **The rule message reaches Claude.** hookify sends the message only to the
  user. Claude sees "denied" and cannot learn the alternative the rule asks for.
  steerhook sends the message as `permissionDecisionReason` (block) or
  `additionalContext` (warn). The user still sees it as `systemMessage`.
- **Rules live in `~/.claude/steerhook/*.md`.** hookify reads rules only from
  the project. Rules about your own tools apply in every project, so they need
  one place. The `/steerhook:add` command and the writing-rules skill write there.
  Set `STEERHOOK_RULES_DIR` to use a different directory.
- **A project's own rules are never read.** hookify lets a project override a
  user rule by name. steerhook does not: opening a project is not the same as
  trusting it, and a rule file there could replace or switch off a user's
  rule with no confirmation.
- **The PostToolUse hook is removed.** Rules read only the tool input, so the
  PostToolUse hook repeated the PreToolUse check and put the message in the
  transcript twice.
- **A bash rule matches what the shell runs.** hookify matches the raw
  command text, so `codex exec` inside a quoted argument and a `while` loop
  inside a heredoc body both fire the rule, although the shell runs neither.
  steerhook scans the quoting and matches the code. A rule can name the other
  views instead: `command_literal`, `command_expanded`, `command_raw`.
- **A quoted pattern loses one pair of quotes, not every quote.** hookify
  stripped every `"` and `'` at both ends. A regex such as `[^"]*"` lost its
  closing quote.

## Install

```sh
/plugin marketplace add meganemura/steerhook
/plugin install steerhook@steerhook
```

For one session from a working tree:

```sh
claude --plugin-dir /path/to/steerhook/plugin
```

## Write a rule

`~/.claude/steerhook/no-direct-codex-exec.md`:

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

`/steerhook:add <what to prevent>` writes a rule for you. `/steerhook:list` shows
the rules that are loaded. The manual, with every field, event, and what
Claude sees, is `plugin/README.md`.

## Requirements

Node 22.18 or later. The hooks are TypeScript files that node runs directly,
so there is nothing to build or install. Verified with Node 26.7.0. An older
node cannot read the files and exits with a syntax error, which Claude Code
shows as a hook error: that is the node version, not a rule.

Claude Code starts a hook with the PATH of the process that launched it. A
launch from a GUI can carry a PATH without node. The launcher looks in the
usual install places (mise, volta, fnm, nvm, Homebrew). To name the node
yourself, set `STEERHOOK_NODE` to its path, for example in the `env` section
of `~/.claude/settings.json`. When no node is found, the hook says so in the
message shown to the user and lets the call through.

## Develop

```sh
npm install              # nukadoko, for the scenarios
npx nuka check           # static check of features and steps
npx nuka run features    # run every scenario
```

The scenarios under `features/` are the behavior contract. They run the hook
scripts through `hooks.json` with JSON on stdin, the way Claude Code runs
them. `STEERHOOK_PLUGIN_ROOT` points them at another implementation of the
same contract.

## License

Apache License 2.0. See `LICENSE` and `NOTICE`.
