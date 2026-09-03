# steerhook

Rules that run before Claude Code runs a tool. A rule names a pattern you do
not want in a tool call and the form you want instead. When the pattern
matches, steerhook blocks the call or lets it through with a warning. In both
cases the rule's message reaches Claude, so Claude learns the alternative at
the moment it matters. You see the same message on screen.

Rules are yours. They live in `~/.claude/steerhook/` and apply in every
project. A project can replace a rule or switch it off.

steerhook is a fork of Anthropic's hookify plugin (Apache 2.0, see `NOTICE`).

## The first rule

Create `~/.claude/steerhook/no-force-push.md`:

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

Ask Claude to run `git push --force origin main`. The call is denied. Claude
reads the message as the reason and can act on it; you see the same message.
No restart is needed. A rule file takes effect on the next tool call.

`/steerhook:add <what to prevent>` writes a rule for you. `/steerhook:list`
shows every rule that is loaded.

## Rule files

One file per rule, in `~/.claude/steerhook/`. The file has two parts: a
frontmatter between two `---` lines, then the message.

| Field        | Required             | Values                                  | Notes                                                                                            |
| ------------ | -------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `name`       | yes                  | kebab-case                              | Heads the message as `**[name]**`. A project rule with the same name replaces this one.          |
| `enabled`    | no, default `true`   | `true`, `false`                         | `false` switches the rule off.                                                                   |
| `event`      | yes                  | `bash`, `file`, `stop`, `prompt`, `all` | Which hook input the rule sees. See "Events and fields".                                         |
| `action`     | no, default `warn`   | `block`, `warn`                         | `block` denies the call. `warn` lets it through and adds the message to Claude's context.         |
| `pattern`    | this or `conditions` | a regular expression                    | Matched against the command (`bash`) or the added text (`file`). Other events need `conditions`. |
| `conditions` | this or `pattern`    | a list, see below                       | Every condition must match.                                                                      |

The frontmatter is not YAML. steerhook reads it with a small parser of its
own, and these are its rules:

- Each line is `key: value`. Spaces around the key and the value are removed.
- A line that starts with `#` is a comment. A `#` after a value is part of
  the value: `action: block # why` reads as `block # why`, which is not
  `block`.
- A value that starts and ends with the same quote loses that one pair.
  Nothing else is unescaped. Write one backslash: `pattern: \s+` and
  `pattern: "\s+"` read the same. A pattern that itself starts and ends with
  a quote needs a wrapper: `(?:"[^"]*`[^"]*")`.
- `conditions:` starts a list. Each item starts with `-`. An item is either
  three indented lines or one line with commas:

```markdown
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.env$
  - field: content, operator: contains, pattern: KEY
```

- The message is everything after the second `---`, with leading and
  trailing blank lines removed. Markdown is fine.

## Events and fields

| `event`  | Fires on                     | Fields for `conditions`                                                      | A simple `pattern` reads                                                                                   |
| -------- | ---------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `bash`   | The Bash tool                | `command`                                                                    | `command`                                                                                                  |
| `file`   | Edit, Write, MultiEdit       | `file_path`, `new_text` (Edit), `old_text` (Edit), `content` (Edit or Write) | `new_text`, which only an Edit call carries. To cover Write too, use `conditions` with `field: content`. |
| `stop`   | Claude wants to end its turn | `transcript` (the session transcript file), `reason`                         | Nothing. A stop rule needs `conditions`.                                                                   |
| `prompt` | You submit a prompt          | `user_prompt`                                                                | Nothing. A prompt rule needs `conditions`.                                                                 |
| `all`    | Every event above            | Any field above                                                              | Nothing. Use `conditions`.                                                                                 |

MultiEdit joins the `new_string` of every edit with a space for `new_text`
and `content`.

Operators for a condition: `regex_match`, `contains`, `equals`,
`not_contains`, `starts_with`, `ends_with`. `regex_match` is the operator a
simple `pattern` uses.

## Patterns

A pattern is a JavaScript regular expression. Matching ignores letter case
and runs against the whole text, newlines included.

- `\b` marks a word boundary: `\bfoo\b` does not match `foobar`.
- `[\s\S]*` crosses lines; `.` does not. A polling loop written on three
  lines needs `[\s\S]*` between its parts.
- `(^|[\s;&|(])codex\s+exec\b` matches a command word but not a quoted
  mention such as `grep "codex exec" notes.md`.
- A pattern that does not compile is reported on stderr and never matches.

Test a pattern before you rely on it:

```sh
node -e "console.log(/git\s+push\b[^\n]*\s--force\b/i.test('git push --force origin main'))"
```

## What Claude and you see

| Event          | `action: block`                                                                       | `action: warn`                                                               |
| -------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `bash`, `file` | The call is denied. Claude reads the message as the denial reason. You see it too.    | The call runs. Claude reads the message as added context. You see it too.    |
| `stop`         | Claude does not stop and reads the message as the reason to continue. You see it too. | You see the message. Claude continues to stop.                               |
| `prompt`       | The prompt is rejected and erased. You see the message; Claude does not.              | The prompt goes through. Claude reads the message beside it. You see it too. |

The message Claude reads is the rule's name in bold brackets, a newline, then
the body:

```
**[no-force-push]**
Do not force-push. Use `git push --force-with-lease`, ...
```

When several rules match, their messages follow one another with a blank line
between them, user rules first, then project rules, each group in file-name
order. Today, when a `block` rule and a `warn` rule match the same call, only
the `block` messages are delivered.

## Project rules

A project can hold rules in `<project>/.claude/steerhook/<name>.md`, in the
same format. steerhook reads both directories. A project rule with the same
`name` as a user rule replaces it in that project. A project rule with
`enabled: false` switches the user rule of that name off in that project.

The project is the `cwd` that Claude Code passes to the hook, not the
directory the hook process runs in.

## Commands

- `/steerhook:add <what to prevent>` writes a rule from your words. Without
  an argument it reads the recent conversation for things you corrected and
  proposes rules.
- `/steerhook:list` shows every rule in both directories.
- `/steerhook:configure` switches rules on and off.
- `/steerhook:help` explains the plugin.

## Requirements

Node 22.18 or later. The hooks are TypeScript files that node runs directly,
so there is nothing to build or install. Verified with Node 26.7.0. An older
node exits with a syntax error, which Claude Code shows as a hook error.

Claude Code starts a hook with the PATH of the process that launched it. A
launch from a GUI can carry a PATH without node. The launcher
(`hooks/run.sh`) looks for node on the PATH, then in the usual install places
(mise, volta, fnm, Homebrew, `/usr/local/bin`, nvm). Set `STEERHOOK_NODE` to
the path of a node to skip the search; the `env` section of
`~/.claude/settings.json` is one place to set it. When no node is found, the
hook tells you so in the message shown on screen and lets the call through.

Set `STEERHOOK_RULES_DIR` to read the user rules from another directory.

## When a rule does not fire

1. `/steerhook:list` shows whether the file was read. A file without
   frontmatter is skipped with a warning on stderr.
2. The file is in `~/.claude/steerhook/` or `<project>/.claude/steerhook/`
   and ends with `.md`.
3. `enabled: true`, and no `#` comment sits after a value.
4. The `event` matches the tool: `bash` for Bash, `file` for Edit, Write,
   MultiEdit. `stop`, `prompt`, and `all` need `conditions`.
5. The pattern matches the text with the `node -e` line above. Remember the
   quote rule and that a Write call has `content`, not `new_text`.
6. The hook found node. If it did not, the message on screen says so.

## License

Apache License 2.0. See `LICENSE`. steerhook started from Anthropic's
hookify plugin; `NOTICE` records the origin.
