---
name: writing-steerhook-rules
description: This skill should be used when the user asks to "create a steerhook rule", "write a hook rule", "block a command", "stop Claude from doing X", "add a steerhook rule", or needs guidance on steerhook rule files, patterns, and messages.
version: 0.2.0
---

# Writing steerhook rules

## What a rule is

A rule is one markdown file that names two things: a move Claude must not
make, as a pattern over a tool call, and the move to make instead, as a
message. When the pattern matches, steerhook denies the call (`block`) or
lets it through (`warn`), and in both cases Claude reads the message at that
moment. The message is the point of the rule. A denial without an
alternative teaches nothing.

## Where a rule lives

- User rules: `~/.claude/steerhook/<name>.md`. They apply in every project.
  This is where `/steerhook:add` writes, and where a rule about the user's
  own tools belongs. steerhook does not read a project's own
  `.claude/steerhook/`.

The file name is the rule name. Use kebab-case that states the move:
`no-force-push`, `no-sleep-loop`, `warn-console-log`.

## The file

```markdown
---
name: no-force-push
enabled: true
event: bash
pattern: git\s+push\b[^\n]*\s(--force\b(?!-with-lease)|-f\b)
action: block
---

Do not force-push. Use `git push --force-with-lease`, which refuses to
overwrite work that someone else pushed in the meantime.
```

| Field        | Values                                   | Notes                                                                         |
| ------------ | ---------------------------------------- | ----------------------------------------------------------------------------- |
| `name`       | kebab-case                               | Required. Heads the message as `**[name]**`.                                  |
| `enabled`    | `true`, `false`                          | Default `true`.                                                               |
| `event`      | `bash`, `file`, `stop`, `prompt`, `all`  | Required. See "Events".                                                       |
| `action`     | `block`, `warn`                          | Default `warn`.                                                               |
| `pattern`    | a regular expression                     | For `bash` and `file`. Other events need `conditions`.                        |
| `conditions` | a list of field, operator, pattern       | Every condition must match. See "Conditions".                                 |

The frontmatter is not YAML. Keep to these forms:

- One `key: value` per line. No comment after a value: `action: block # x`
  reads as `block # x` and the rule falls back to `warn`.
- Write one backslash, quoted or not. Quotes do one thing: a value that
  starts and ends with the same quote loses that one pair. A pattern that
  starts and ends with a quote needs a wrapper such as `(?:"[^"]*`[^"]*")`.
- The message is everything after the second `---`.

## Writing the message

Claude reads the message as the reason for a denial, or as context beside
an allowed call. Write it for that reader, at that moment:

1. Say what the rule caught, in one sentence, so Claude knows the match was
   not a mistake.
2. Give the alternative as something Claude can do next: a command, a tool,
   a form. One alternative, concrete.
3. Stop there. Three sentences is a good length.

Good:

```
Do not run `codex exec` from Bash. Send the task to the `codex:codex-rescue`
subagent with the Agent tool, and put `--wait` in the request. The agent's
completion notification is then the completion of the task.
```

Weak: `Dangerous command detected! Please be careful.` It names no
alternative, so Claude can only try a variation of the same command.

## What a bash rule matches

A bash rule is about what the shell does, so the pattern does not run over
the raw text. steerhook scans the command's quoting and splits it into three
views. Every character lands in exactly one of them.

| Field              | Holds                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| `command`          | The code: outside quotes, the quote marks, a heredoc's operator and terminator. A simple `pattern` reads this. |
| `command_literal`  | The contents of single quotes, and the body of `<<'EOF'`.                                      |
| `command_expanded` | The contents of double quotes, and the body of `<<EOF`. This is where the shell substitutes.   |
| `command_raw`      | The whole string, for a rule about how a command is written.                                   |

`pattern: (^|[\s;&|(])codex\s+exec\b` denies `timeout 600 codex exec --help`
and lets `claude -p 'run codex exec' --model sonnet` through, because the
second one's `codex exec` is an argument the shell never runs. A rule that
watches for substitution reads `command_expanded`:

```markdown
conditions:
  - field: command_expanded
    operator: regex_match
    pattern: (?<!\\)`
```

## Writing the pattern

A pattern is a JavaScript regular expression, matched without regard to
letter case against the whole text, newlines included.

- Match the command word, not the word anywhere: `(^|[\s;&|(])codex\s+exec\b`
  catches `cd x && codex exec` and `timeout 600 codex exec`.
- Cross lines with `[\s\S]*`, not `.*`. A loop written on three lines is
  one command text.
- Use `\b` so `foo` does not match `foobar`.
- Require the syntax the mistake needs, not only its words. A loop rule that
  asks for `do` after the keyword, `\b(until|while)\b[^\n;]*(;|\n)\s*do\b`,
  catches `while true; do` and lets the file name `no-until-sleep-loop.md`
  through.
- Prefer the narrow pattern that catches the real mistake over the wide one
  that catches every mention. A false positive on `block` costs a retry
  through another tool; a false positive on `warn` costs a note.

Test the pattern against the command that should match and one that should
not. Pass the code view, not the raw command: the quoted parts are already
gone by the time a bash pattern runs.

```sh
node -e "console.log(/(^|[\s;&|(])codex\s+exec\b/i.test('timeout 600 codex exec --help'))"
node -e "console.log(/(^|[\s;&|(])codex\s+exec\b/i.test('grep \"\" notes.md'))"
```

## block or warn

- `block` when the alternative is right every time the pattern matches.
  The call is denied; Claude reads the message and moves to the
  alternative.
- `warn` when it depends. The call runs; the message enters Claude's
  context. A shell quirk that is sometimes intended, such as a backtick
  inside double quotes, is a `warn`.

Today, when a `block` rule and a `warn` rule match the same call, only the
`block` messages are delivered.

## Events

| `event`  | Fires on                       | Fields                                                                         |
| -------- | ------------------------------ | ------------------------------------------------------------------------------ |
| `bash`   | The Bash tool                  | `command`, `command_literal`, `command_expanded`, `command_raw`                |
| `file`   | Edit, Write, MultiEdit         | `file_path`; `new_text` and `old_text` (Edit); `content` (Edit or Write)        |
| `stop`   | Claude wants to end its turn   | `transcript` (the transcript file's text), `reason`                            |
| `prompt` | The user submits a prompt      | `user_prompt`                                                                  |
| `all`    | Every event                    | Any of the above                                                               |

A simple `pattern` reads `command` for `bash` and `new_text` for `file`.
`new_text` is Edit's `new_string`; a Write call carries `content` instead,
so a file rule that must see Write uses `conditions` with `field: content`.
`stop`, `prompt`, and `all` rules always need `conditions`.

## Conditions

```markdown
---
name: require-tests
enabled: true
event: stop
action: block
conditions:
  - field: transcript
    operator: not_contains
    pattern: npx nuka run
---

Run the scenarios before you stop.
```

Operators: `regex_match`, `contains`, `equals`, `not_contains`,
`starts_with`, `ends_with`. Every condition must match. An item can also sit
on one line: `- field: content, operator: contains, pattern: KEY`.

## Checking a rule

1. `/steerhook:list` shows the rule with its event, action, and pattern. A
   file that is not listed was not read: it lacks frontmatter or the `.md`
   extension.
2. Ask Claude to run a command that should match. Rules take effect on the
   next tool call; no restart.
3. For a `block`, the denial Claude reports is the message. For a `warn`,
   Claude can quote the message when asked what context it received.

## Quick reference

Minimum rule:

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

Where each field lands: `name` in the message header; `event` and
`pattern` in the match; `action` in the decision; the body in what Claude
reads.
