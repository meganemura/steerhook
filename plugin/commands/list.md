---
description: List every steerhook rule that is loaded, from the user directory and the project
allowed-tools: ["Glob", "Read", "Skill"]
---

# steerhook:list

Show every rule steerhook reads for this project.

## Steps

1. Find the user rules with the Glob tool: pattern `*.md`, path
   `<home>/.claude/steerhook` (expand `~`). Find the project rules the same
   way in `.claude/steerhook` under the current working directory.
2. Read each file. Take `name`, `enabled`, `event`, `action`, and `pattern`
   (or the first condition's `pattern`) from the frontmatter, and the first
   line of the message.
3. Print one table:

```
| Name | Scope | Enabled | Event | Action | Pattern | File |
|------|-------|---------|-------|--------|---------|------|
| no-force-push | user | yes | bash | block | git\s+push\b... | no-force-push.md |
| no-force-push | project | no | bash | block | ... | .claude/steerhook/no-force-push.md |
```

4. Under the table, say what the scopes mean when both appear: a project
   rule with the same name as a user rule replaces it in this project, and
   a project rule with `enabled: false` switches the user rule off here.
5. For each rule, print its message's first line, so the user can see what
   Claude will read.
6. End with the totals (rules, enabled, disabled) and where to go next:
   `/steerhook:add` to write a rule, `/steerhook:configure` to switch one on
   or off, or edit the file. Changes take effect on the next tool call.

## When no rule exists

Say that no rule is loaded from either directory, and show the smallest
rule file with its path, `~/.claude/steerhook/<name>.md`:

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
