---
description: List every steerhook rule that is loaded, from the user directory
allowed-tools: ["Glob", "Read", "Skill"]
---

# steerhook:list

Show every rule steerhook reads.

## Steps

1. Find the user rules with the Glob tool: pattern `*.md`, path
   `<home>/.claude/steerhook` (expand `~`).
2. Read each file. Take `name`, `enabled`, `event`, `action`, and `pattern`
   (or the first condition's `pattern`) from the frontmatter, and the first
   line of the message.
3. Print one table:

```
| Name | Enabled | Event | Action | Pattern | File |
|------|---------|-------|--------|---------|------|
| no-force-push | yes | bash | block | git\s+push\b... | no-force-push.md |
```

4. For each rule, print its message's first line, so the user can see what
   Claude will read.
5. End with the totals (rules, enabled, disabled) and where to go next:
   `/steerhook:add` to write a rule, `/steerhook:configure` to switch one on
   or off, or edit the file. Changes take effect on the next tool call.

## When no rule exists

Say that no rule is loaded, and show the smallest rule file with its path,
`~/.claude/steerhook/<name>.md`:

```markdown
---
name: my-rule
enabled: true
event: bash
pattern: dangerous_command
action: block
---

Do X instead.
```

Point to `/steerhook:add` and `/steerhook:help`.
