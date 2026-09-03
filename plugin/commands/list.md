---
description: List all configured steerhook rules
allowed-tools: ["Glob", "Read", "Skill"]
---

# List steerhook Rules

**Load steerhook:writing-rules skill first** to understand rule format.

Show all configured steerhook rules in the project.

## Steps

1. Use Glob tool to find all steerhook rule files:
   ```
   pattern: "*.md"
   path: the home directory + "/.claude/steerhook"
   ```
   If the project also holds `.claude/steerhook/*.md` files, include them and mark them as project rules.

2. For each file found:
   - Use Read tool to read the file
   - Extract frontmatter fields: name, enabled, event, pattern
   - Extract message preview (first 100 chars)

3. Present results in a table:

```
## Configured steerhook Rules

| Name | Enabled | Event | Pattern | File |
|------|---------|-------|---------|------|
| warn-dangerous-rm | ✅ Yes | bash | rm\s+-rf | dangerous-rm.md |
| warn-console-log | ✅ Yes | file | console\.log\( | console-log.md |
| check-tests | ❌ No | stop | .* | require-tests.md |

**Total**: 3 rules (2 enabled, 1 disabled)
```

4. For each rule, show a brief preview:
```
### warn-dangerous-rm
**Event**: bash
**Pattern**: `rm\s+-rf`
**Message**: "⚠️ **Dangerous rm command detected!** This command could delete..."

**Status**: ✅ Active
**File**: ~/.claude/steerhook/dangerous-rm.md
```

5. Add helpful footer:
```
---

To modify a rule: Edit the rule file directly
To disable a rule: Set `enabled: false` in frontmatter
To enable a rule: Set `enabled: true` in frontmatter
To delete a rule: Remove the rule file
To create a rule: Use `/steerhook` command

**Remember**: Changes take effect immediately - no restart needed
```

## If No Rules Found

If no steerhook rules exist:

```
## No steerhook Rules Configured

You haven't created any steerhook rules yet.

To get started:
1. Use `/steerhook` to analyze conversation and create rules
2. Or manually create `~/.claude/steerhook/my-rule.md` files
3. See `/steerhook:help` for documentation

Example:
```
/steerhook Warn me when I use console.log
```

Check `${CLAUDE_PLUGIN_ROOT}/examples/` for example rule files.
```
