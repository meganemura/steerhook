---
description: Write a steerhook rule from the user's words, or from what the conversation shows they corrected
argument-hint: What to prevent, and what to do instead
allowed-tools: ["Read", "Write", "Glob", "AskUserQuestion", "Agent", "Task", "Skill"]
---

# steerhook:add

Write one or more rule files into `~/.claude/steerhook/`. A rule names a
pattern Claude must not run and the form to use instead; Claude reads the
message at the moment the rule fires.

**First, load the `steerhook:writing-rules` skill** with the Skill tool. It
holds the file format, the pattern rules, and how to write the message.

## 1. Find out what to prevent

**With `$ARGUMENTS`:** the user said what to prevent: `$ARGUMENTS`. Read the
last few exchanges for an example of it happening, so the pattern matches
the real command and the message names the real alternative.

**Without arguments:** run the `steerhook:conversation-analyzer` agent with
the Agent tool (`subagent_type: "steerhook:conversation-analyzer"`). It reads
the conversation for things the user corrected or asked not to do, and
returns one finding per behavior with a pattern and an alternative.

## 2. Confirm with the user

Use AskUserQuestion. Keep to at most four candidates per question.

1. Which findings become rules (multi-select). Label each with the move it
   stops, describe why it came up.
2. For each chosen rule: `block` (deny the call, Claude reads the message as
   the reason) or `warn` (let it run, Claude reads the message as context).
   Recommend `block` when the alternative is right every time.

Show the pattern and the message you intend to write. The user may change
either.

## 3. Write the files

Rule files go in the user's rule directory, `~/.claude/steerhook/`, never in
the project and never in the plugin directory. A rule there applies in every
project; steerhook does not read a project's own `.claude/steerhook/` at
all.

1. Expand `~` to the home directory and write each rule with the Write tool
   to `<home>/.claude/steerhook/<name>.md`. The Write tool creates the
   directory when it does not exist.
2. Name the file after the move it stops, in kebab-case: `no-force-push`,
   `warn-console-log`.
3. Use this shape:

```markdown
---
name: <name>
enabled: true
event: bash
pattern: <regular expression>
action: block
---

<What the rule caught, and the alternative Claude should use.>
```

For an Edit or Write rule use `event: file`. For a stop or prompt rule use
`conditions:`; the skill shows the form.

## 4. Confirm

List what was written, with each file's path, event, action, and pattern.
Tell the user the rules are active on the next tool call; no restart. Offer
`/steerhook:list` to see every rule and `/steerhook:configure` to switch one
off.

## If something goes wrong

- The Write tool refuses the path: use the absolute path,
  `/Users/<you>/.claude/steerhook/<name>.md` on macOS.
- The rule does not fire: `/steerhook:list` shows whether it was read.
  Check the `event`, test the pattern with
  `node -e "console.log(/<pattern>/i.test('<command>'))"`, and remember that a
  `#` after a value becomes part of the value.
- The rule fires too often: narrow the pattern (`\b`, a command-word
  prefix such as `(^|[\s;&|(])`, the syntax the mistake needs), or change
  `action: block` to `warn`. A bash pattern already runs against the code,
  so a quoted mention and a heredoc body are not the cause.
