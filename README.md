# steerhook

A hook that steers. Write a rule that names a command pattern you do not want
Claude to run and the form you want instead. Before Claude runs a tool,
steerhook checks the call against your rules. A rule can block the call or let
it through with a warning. In both cases the rule's message reaches Claude, so
Claude learns the alternative at the moment it matters.

Rules are yours. They live in `~/.claude/steerhook/` and apply in every
project. A project can replace a rule or switch it off.

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
- **A project can override a rule.** A file in the project's
  `.claude/steerhook/` with the same `name` replaces the user rule. With
  `enabled: false` it switches the user rule off in that project.
- **Project rules resolve from the hook's `cwd`**, not from the process working
  directory. A plugin hook can run in the plugin's own directory, and then
  hookify finds no rule.
- **The PostToolUse hook is removed.** Rules read only the tool input, so the
  PostToolUse hook repeated the PreToolUse check and put the message in the
  transcript twice.
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
the rules that are loaded. The rule format is hookify's; see
`plugin/README.md`.

## Develop

The plugin runs on the Python standard library, so there is nothing to
install for the plugin itself.

```sh
python3 -m unittest discover -s plugin/tests   # unit tests
npm install                                    # nukadoko, for the scenarios
npx nuka check                                 # static check of features and steps
npx nuka run features                          # run every scenario
```

The scenarios under `features/` are the behavior contract. They run the hook
scripts through `hooks.json` with JSON on stdin, the way Claude Code runs
them. `STEERHOOK_PLUGIN_ROOT` points them at another implementation of the
same contract.

## License

Apache License 2.0. See `LICENSE` and `NOTICE`.
