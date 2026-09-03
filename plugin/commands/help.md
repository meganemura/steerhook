---
description: Explain the steerhook plugin
allowed-tools: ["Read"]
---

# steerhook:help

Explain the plugin to the user with the facts below. Keep the answer to what
they asked; the full manual is `${CLAUDE_PLUGIN_ROOT}/README.md`.

## What it does

steerhook runs before Claude Code runs a tool. A rule names a pattern that
must not appear in a tool call and the form to use instead. When the pattern
matches, the rule blocks the call or lets it through with a warning. In both
cases Claude reads the rule's message at that moment, and the user sees it
on screen.

## Where rules live

- `~/.claude/steerhook/<name>.md`: the user's rules. They apply in every
  project.
- `<project>/.claude/steerhook/<name>.md`: a project's rules. A project rule
  with the same `name` as a user rule replaces it; with `enabled: false` it
  switches the user rule off in that project.

## A rule file

```markdown
---
name: no-force-push
enabled: true
event: bash
pattern: git\s+push\b[^\n]*\s(--force\b(?!-with-lease)|-f\b)
action: block
---

Do not force-push. Use `git push --force-with-lease`.
```

- `event`: `bash` (the Bash tool), `file` (Edit, Write, MultiEdit), `stop`,
  `prompt`, `all`. `stop`, `prompt`, and `all` need `conditions:` instead of
  `pattern`.
- `action`: `block` denies the call; `warn` lets it run and adds the message
  to Claude's context. Default `warn`.
- `pattern`: a JavaScript regular expression, matched without regard to
  letter case against the whole text. Write one backslash. A value that
  starts and ends with the same quote loses that pair.
- The message: what the rule caught and the alternative, in a few
  sentences.

## What Claude sees

| Action  | Bash and file tools                          | Stop                              | Prompt                                    |
| ------- | -------------------------------------------- | --------------------------------- | ----------------------------------------- |
| `block` | The call is denied; the message is the reason | Claude continues, with the reason | The prompt is rejected; the user sees why |
| `warn`  | The call runs; the message is added context  | The user sees the message         | Claude reads the message beside the prompt |

## Commands

- `/steerhook:add <what to prevent>` writes a rule. Without an argument it
  reads the conversation for things the user corrected.
- `/steerhook:list` shows every loaded rule.
- `/steerhook:configure` switches rules on and off.

## Requirements

Node 22.18 or later. The hooks run through `hooks/run.sh`, which finds node
on the PATH or in the usual install places, or takes `STEERHOOK_NODE`. When
no node is found, the message on screen says so and the call goes through.

## When a rule does not fire

1. `/steerhook:list` shows whether the file was read.
2. The file ends with `.md` and has `enabled: true` with no `#` after it.
3. The `event` matches the tool. `stop`, `prompt`, and `all` need
   `conditions`.
4. Test the pattern: `node -e "console.log(/<pattern>/i.test('<text>'))"`.
5. Rules take effect on the next tool call; no restart.
