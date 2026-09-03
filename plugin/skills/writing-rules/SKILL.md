---
name: writing-steerhook-rules
description: This skill should be used when the user asks to "create a steerhook rule", "write a hook rule", "configure steerhook", "add a steerhook rule", or needs guidance on steerhook rule syntax and patterns.
version: 0.1.0
---

# Writing steerhook Rules

## Overview

steerhook rules are markdown files with YAML frontmatter that define patterns to watch for and messages to show when those patterns match. Rules are stored in `~/.claude/steerhook/{rule-name}.md` files and apply in every project.

## Rule File Format

### Basic Structure

```markdown
---
name: rule-identifier
enabled: true
event: bash|file|stop|prompt|all
pattern: regex-pattern-here
---

Message to show Claude when this rule triggers.
Can include markdown formatting, warnings, suggestions, etc.
```

### Frontmatter Fields

**name** (required): Unique identifier for the rule
- Use kebab-case: `warn-dangerous-rm`, `block-console-log`
- Be descriptive and action-oriented
- Start with verb: warn, prevent, block, require, check

**enabled** (required): Boolean to activate/deactivate
- `true`: Rule is active
- `false`: Rule is disabled (won't trigger)
- Can toggle without deleting rule

**event** (required): Which hook event to trigger on
- `bash`: Bash tool commands
- `file`: Edit, Write, MultiEdit tools
- `stop`: When agent wants to stop
- `prompt`: When user submits a prompt
- `all`: All events

**action** (optional): What to do when rule matches
- `warn`: Show message but allow operation (default)
- `block`: Prevent operation (PreToolUse) or stop session (Stop events)
- If omitted, defaults to `warn`

**pattern** (simple format): Regex pattern to match
- Used for simple single-condition rules
- Matches against command (bash) or new_text (file)
- Python regex syntax

**Example:**
```yaml
event: bash
pattern: rm\s+-rf
```

### Advanced Format (Multiple Conditions)

For complex rules with multiple conditions:

```markdown
---
name: warn-env-file-edits
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.env$
  - field: new_text
    operator: contains
    pattern: API_KEY
---

You're adding an API key to a .env file. Ensure this file is in .gitignore!
```

**Condition fields:**
- `field`: Which field to check
  - For bash: `command`
  - For file: `file_path`, `new_text`, `old_text`, `content`
- `operator`: How to match
  - `regex_match`: Regex pattern matching
  - `contains`: Substring check
  - `equals`: Exact match
  - `not_contains`: Substring must NOT be present
  - `starts_with`: Prefix check
  - `ends_with`: Suffix check
- `pattern`: Pattern or string to match

**All conditions must match for rule to trigger.**

## Message Body

The markdown content after frontmatter is what Claude reads when the rule triggers: as the denial reason for `block`, as added context for `warn`. Write the alternative that the rule asks for.

**Good messages:**
- Explain what was detected
- Explain why it's problematic
- Suggest alternatives or best practices
- Use formatting for clarity (bold, lists, etc.)

**Example:**
```markdown
⚠️ **Console.log detected!**

You're adding console.log to production code.

**Why this matters:**
- Debug logs shouldn't ship to production
- Console.log can expose sensitive data
- Impacts browser performance

**Alternatives:**
- Use a proper logging library
- Remove before committing
- Use conditional debug builds
```

## Event Type Guide

### bash Events

Match Bash command patterns:

```markdown
---
event: bash
pattern: sudo\s+|rm\s+-rf|chmod\s+777
---

Dangerous command detected!
```

**Common patterns:**
- Dangerous commands: `rm\s+-rf`, `dd\s+if=`, `mkfs`
- Privilege escalation: `sudo\s+`, `su\s+`
- Permission issues: `chmod\s+777`, `chown\s+root`

### file Events

Match Edit/Write/MultiEdit operations:

```markdown
---
event: file
pattern: console\.log\(|eval\(|innerHTML\s*=
---

Potentially problematic code pattern detected!
```

**Match on different fields:**
```markdown
---
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.tsx?$
  - field: new_text
    operator: regex_match
    pattern: console\.log\(
---

Console.log in TypeScript file!
```

**Common patterns:**
- Debug code: `console\.log\(`, `debugger`, `print\(`
- Security risks: `eval\(`, `innerHTML\s*=`, `dangerouslySetInnerHTML`
- Sensitive files: `\.env$`, `credentials`, `\.pem$`
- Generated files: `node_modules/`, `dist/`, `build/`

### stop Events

Match when agent wants to stop (completion checks):

```markdown
---
event: stop
pattern: .*
---

Before stopping, verify:
- [ ] Tests were run
- [ ] Build succeeded
- [ ] Documentation updated
```

**Use for:**
- Reminders about required steps
- Completion checklists
- Process enforcement

### prompt Events

Match user prompt content (advanced):

```markdown
---
event: prompt
conditions:
  - field: user_prompt
    operator: contains
    pattern: deploy to production
---

Production deployment checklist:
- [ ] Tests passing?
- [ ] Reviewed by team?
- [ ] Monitoring ready?
```

## Pattern Writing Tips

### Regex Basics

**Literal characters:** Most characters match themselves
- `rm` matches "rm"
- `console.log` matches "console.log"

**Special characters need escaping:**
- `.` (any char) → `\.` (literal dot)
- `(` `)` → `\(` `\)` (literal parens)
- `[` `]` → `\[` `\]` (literal brackets)

**Common metacharacters:**
- `\s` - whitespace (space, tab, newline)
- `\d` - digit (0-9)
- `\w` - word character (a-z, A-Z, 0-9, _)
- `.` - any character
- `+` - one or more
- `*` - zero or more
- `?` - zero or one
- `|` - OR

**Examples:**
```
rm\s+-rf         Matches: rm -rf, rm  -rf
console\.log\(   Matches: console.log(
(eval|exec)\(    Matches: eval( or exec(
chmod\s+777      Matches: chmod 777, chmod  777
API_KEY\s*=      Matches: API_KEY=, API_KEY =
```

### Testing Patterns

Test regex patterns before using:

```bash
python3 -c "import re; print(re.search(r'your_pattern', 'test text'))"
```

Or use online regex testers (regex101.com with Python flavor).

### Common Pitfalls

**Too broad:**
```yaml
pattern: log    # Matches "log", "login", "dialog", "catalog"
```
Better: `console\.log\(|logger\.`

**Too specific:**
```yaml
pattern: rm -rf /tmp  # Only matches exact path
```
Better: `rm\s+-rf`

**Escaping issues:**
- YAML quoted strings: `"pattern"` requires double backslashes `\\s`
- YAML unquoted: `pattern: \s` works as-is
- **Recommendation**: Use unquoted patterns in YAML
- A value whose first and last characters are the same quote loses that pair. Wrap such a pattern in `(?:...)`

## File Organization

**Location:** `~/.claude/steerhook/`, the user's rule directory. A rule there applies in every project.
**Naming:** `~/.claude/steerhook/{descriptive-name}.md`
**Project rules:** A project can also hold `.claude/steerhook/{name}.md` files. The plugin reads both directories. A project rule with the same `name` replaces the user rule. A project rule with `enabled: false` switches the user rule off in that project.

**Good names:**
- `dangerous-rm.md`
- `console-log.md`
- `require-tests.md`
- `sensitive-files.md`

**Bad names:**
- `rule1.md` (not descriptive)
- `dangerous-rm.txt` (not `.md`, so the plugin does not read it)

## Workflow

### Creating a Rule

1. Identify unwanted behavior
2. Determine which tool is involved (Bash, Edit, etc.)
3. Choose event type (bash, file, stop, etc.)
4. Write regex pattern
5. Create `~/.claude/steerhook/{name}.md`
6. Test immediately - rules are read dynamically on next tool use

### Refining a Rule

1. Edit the rule file
2. Adjust pattern or message
3. Test immediately - changes take effect on next tool use

### Disabling a Rule

**Temporary:** Set `enabled: false` in frontmatter
**Permanent:** Delete the rule file

## Examples

See `${CLAUDE_PLUGIN_ROOT}/examples/` for complete examples:
- `dangerous-rm.md` - Block dangerous rm commands
- `console-log-warning.md` - Warn about console.log
- `sensitive-files-warning.md` - Warn about editing .env files

## Quick Reference

**Minimum viable rule:**
```markdown
---
name: my-rule
enabled: true
event: bash
pattern: dangerous_command
---

Warning message here
```

**Rule with conditions:**
```markdown
---
name: my-rule
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.ts$
  - field: new_text
    operator: contains
    pattern: any
---

Warning message
```

**Event types:**
- `bash` - Bash commands
- `file` - File edits
- `stop` - Completion checks
- `prompt` - User input
- `all` - All events

**Field options:**
- Bash: `command`
- File: `file_path`, `new_text`, `old_text`, `content`
- Prompt: `user_prompt`

**Operators:**
- `regex_match`, `contains`, `equals`, `not_contains`, `starts_with`, `ends_with`
