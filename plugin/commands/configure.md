---
description: Switch steerhook rules on or off
allowed-tools: ["Glob", "Read", "Edit", "AskUserQuestion", "Skill"]
---

# steerhook:configure

Switch rules on and off by editing their `enabled` line.

## Steps

1. Find the rule files: Glob `*.md` in `<home>/.claude/steerhook` (expand
   `~`). With no file found, say so and point to `/steerhook:add`.
2. Read each file and take `name` and `enabled` from the frontmatter.
3. Ask with AskUserQuestion, multi-select, which rules to toggle. Label each
   option `<name> (on)` or `<name> (off)`; describe it with the first line
   of its message. At most four options per question; ask again for the
   rest.
4. For each chosen rule, use the Edit tool on that file: replace
   `enabled: true` with `enabled: false`, or the reverse. Touch nothing
   else in the file.
5. Print what changed: switched on, switched off, unchanged. Say that the
   change applies on the next tool call.

## Notes

- To remove a rule, delete its file.
