---
feature: features/command-views.feature
commit: 8ab83d6aa493d65a233c00951258136e7ae81851
run_id: run-20260904-061445-tm20
ran_at: 2026-09-04T06:14:45.850+09:00
accepted_at: 2026-09-04T06:15:06.197+09:00
environment: default
browser: none
scenarios:
  - name: A command word inside a single-quoted argument does not run
    line: 25
    scenario_record_id: scn-20260904-061445-liwb
  - name: The same rule fires when the command word is the one that runs
    line: 33
    scenario_record_id: scn-20260904-061446-slok
  - name: A quoted heredoc body is not part of the command
    line: 41
    scenario_record_id: scn-20260904-061446-sple
  - name: command_literal holds the body of a quoted heredoc
    line: 54
    scenario_record_id: scn-20260904-061447-2ndj
  - name: The same rule stays quiet when the word is only in the command
    line: 67
    scenario_record_id: scn-20260904-061447-ej11
  - name: command_expanded holds the text inside double quotes
    line: 75
    scenario_record_id: scn-20260904-061448-r652
  - name: Double quotes written inside single quotes are not quotes
    line: 83
    scenario_record_id: scn-20260904-061448-5ll6
  - name: command_expanded holds the body of a heredoc whose word is not quoted
    line: 91
    scenario_record_id: scn-20260904-061448-cxgo
  - name: An escaped double quote does not end the string it sits in
    line: 104
    scenario_record_id: scn-20260904-061449-hej3
  - name: command_raw holds the text the tool received
    line: 115
    scenario_record_id: scn-20260904-061449-two4
---

# What a bash rule matches: green at 8ab83d6

## Condition

- environment: default
- browser: not launched (no step in this run destructured page/context)

## The scenario as it ran

```gherkin
Feature: What a bash rule matches

  A bash rule says what Claude must not run. It is about what the shell does,
  so steerhook does not match the raw text of the command. It scans the
  command's quoting one time and splits the text into three views. Every
  character lands in exactly one of them.

    command           The code. Everything outside quotes, the quote marks
                      themselves, and a heredoc's operator and terminator.
                      A simple pattern reads this view.
    command_literal   The text the shell never reads as code: the contents of
                      single quotes, and the body of a heredoc whose word is
                      quoted.
    command_expanded  The text the shell still expands: the contents of double
                      quotes, and the body of a heredoc whose word is not
                      quoted.

  A fourth field, command_raw, holds the whole string the tool received. A
  rule about how a command is written, rather than about what it runs, reads
  that one.

  Segments of one view are joined with a newline, so a pattern that cannot
  cross a line cannot join two separate quoted strings.

  Scenario: A command word inside a single-quoted argument does not run
    Given the user rule "no-codex-exec" blocks bash commands that match "(^|[\s;&|(])codex\s+exec\b"
      """
      Send the task to the codex:codex-rescue subagent instead.
      """
    When Claude runs the bash command "claude -p 'run codex exec and report back' --model sonnet"
    Then the hook returns nothing

  Scenario: The same rule fires when the command word is the one that runs
    Given the user rule "no-codex-exec" blocks bash commands that match "(^|[\s;&|(])codex\s+exec\b"
      """
      Send the task to the codex:codex-rescue subagent instead.
      """
    When Claude runs the bash command "timeout 600 codex exec --help"
    Then the command is denied and Claude reads "Send the task to the codex:codex-rescue subagent instead."

  Scenario: A quoted heredoc body is not part of the command
    Given the user rule "no-sleep-loop" blocks bash commands that match "\b(until|while)\b[\s\S]*\bsleep\b"
      """
      Do not wait with a loop.
      """
    When Claude runs this bash command
      """
      cat > reap.mjs <<'EOF'
      while (queue.length) { await sleep(1); }
      EOF
      """
    Then the hook returns nothing

  Scenario: command_literal holds the body of a quoted heredoc
    Given the user rule "no-todo-in-file" warns bash commands whose command_literal matches "\bTODO\b"
      """
      This writes a TODO into a file.
      """
    When Claude runs this bash command
      """
      cat > notes.md <<'EOF'
      TODO: name the owner of this step.
      EOF
      """
    Then Claude reads the note "This writes a TODO into a file."

  Scenario: The same rule stays quiet when the word is only in the command
    Given the user rule "no-todo-in-file" warns bash commands whose command_literal matches "\bTODO\b"
      """
      This writes a TODO into a file.
      """
    When Claude runs the bash command "grep -r TODO src/"
    Then the hook returns nothing

  Scenario: command_expanded holds the text inside double quotes
    Given the user rule "backtick-in-double-quotes" warns bash commands whose command_expanded matches "`"
      """
      A backtick here is a command substitution.
      """
    When Claude runs the bash command "echo \"today is `date`\""
    Then Claude reads the note "A backtick here is a command substitution."

  Scenario: Double quotes written inside single quotes are not quotes
    Given the user rule "backtick-in-double-quotes" warns bash commands whose command_expanded matches "`"
      """
      A backtick here is a command substitution.
      """
    When Claude runs the bash command "ruby -i -pe 'gsub(/x/, \"`y`\")' README.md"
    Then the hook returns nothing

  Scenario: command_expanded holds the body of a heredoc whose word is not quoted
    Given the user rule "backtick-in-double-quotes" warns bash commands whose command_expanded matches "`"
      """
      A backtick here is a command substitution.
      """
    When Claude runs this bash command
      """
      cat > report.md <<EOF
      The version is `git describe`.
      EOF
      """
    Then Claude reads the note "A backtick here is a command substitution."

  Scenario: An escaped double quote does not end the string it sits in
    Given the user rule "backtick-in-double-quotes" warns bash commands whose command_expanded matches "`"
      """
      A backtick here is a command substitution.
      """
    When Claude runs this bash command
      """
      echo "a \" b" 'c `d` e'
      """
    Then the hook returns nothing

  Scenario: command_raw holds the text the tool received
    Given the user rule "no-quoted-mention" warns bash commands whose command_raw matches "codex\s+exec"
      """
      This command names codex exec, even inside quotes.
      """
    When Claude runs the bash command "grep 'codex exec' notes.md"
    Then Claude reads the note "This command names codex exec, even inside quotes."
```

## What the tool measured

Evidence fields are stripped from every record below: evidence. They stay under the state directory with the trace and the screenshots, and are not committed.

### A command word inside a single-quoted argument does not run (line 25)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-codex-exec" blocks bash commands that match "(^\|[\s;&\|(])codex\s+exec\b" | ok | 4 | true | 0 | 0 |
| Claude runs the bash command "claude -p 'run codex exec and report back' --model sonnet" | ok | 342 | false | 0 | 0 |
| the hook returns nothing | ok | 10 | false | 0 | 0 |

#### the user rule "no-codex-exec" blocks bash commands that match "(^|[\s;&|(])codex\s+exec\b"

```json
{
  "step_record_id": "step-20260904-061445-d39c",
  "step": "user-bash-rule",
  "kind": "run",
  "args": {
    "name": "no-codex-exec",
    "verb": "blocks",
    "pattern": "(^|[\\s;&|(])codex\\s+exec\\b",
    "message": "Send the task to the codex:codex-rescue subagent instead."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/no-codex-exec.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061445-liwb",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:45.854Z",
  "finished_at": "2026-09-03T21:14:45.858Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": true,
  "fixtures": [
    {
      "name": "sandbox",
      "scope": "scenario",
      "reused": false,
      "setup_ms": 1,
      "at": "2026-09-03T21:14:45.855Z"
    }
  ]
}
```

#### Claude runs the bash command "claude -p 'run codex exec and report back' --model sonnet"

```json
{
  "step_record_id": "step-20260904-061445-ytux",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "claude -p 'run codex exec and report back' --model sonnet"
  },
  "result": {
    "exit_code": 0,
    "output": {}
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061445-liwb",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:45.861Z",
  "finished_at": "2026-09-03T21:14:46.203Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "fixtures": [
    {
      "name": "sandbox",
      "scope": "scenario",
      "reused": true
    }
  ]
}
```

#### the hook returns nothing

```json
{
  "step_record_id": "step-20260904-061446-40b5",
  "step": "hook-returns-nothing",
  "kind": "run",
  "args": {
    "output": {}
  },
  "result": {
    "keys": []
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061445-liwb",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:46.205Z",
  "finished_at": "2026-09-03T21:14:46.215Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061445-ytux",
      "step": "run-bash"
    }
  ]
}
```

### The same rule fires when the command word is the one that runs (line 33)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-codex-exec" blocks bash commands that match "(^\|[\s;&\|(])codex\s+exec\b" | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "timeout 600 codex exec --help" | ok | 379 | false | 0 | 0 |
| the command is denied and Claude reads "Send the task to the codex:codex-rescue subagent instead." | ok | 3 | false | 0 | 0 |

#### the user rule "no-codex-exec" blocks bash commands that match "(^|[\s;&|(])codex\s+exec\b"

```json
{
  "step_record_id": "step-20260904-061446-87uu",
  "step": "user-bash-rule",
  "kind": "run",
  "args": {
    "name": "no-codex-exec",
    "verb": "blocks",
    "pattern": "(^|[\\s;&|(])codex\\s+exec\\b",
    "message": "Send the task to the codex:codex-rescue subagent instead."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/no-codex-exec.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061446-slok",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:46.231Z",
  "finished_at": "2026-09-03T21:14:46.233Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": true,
  "fixtures": [
    {
      "name": "sandbox",
      "scope": "scenario",
      "reused": false,
      "setup_ms": 1,
      "at": "2026-09-03T21:14:46.231Z"
    }
  ]
}
```

#### Claude runs the bash command "timeout 600 codex exec --help"

```json
{
  "step_record_id": "step-20260904-061446-r9p3",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "timeout 600 codex exec --help"
  },
  "result": {
    "exit_code": 0,
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "**[no-codex-exec]**\nSend the task to the codex:codex-rescue subagent instead."
      },
      "systemMessage": "**[no-codex-exec]**\nSend the task to the codex:codex-rescue subagent instead."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061446-slok",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:46.234Z",
  "finished_at": "2026-09-03T21:14:46.613Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "fixtures": [
    {
      "name": "sandbox",
      "scope": "scenario",
      "reused": true
    }
  ]
}
```

#### the command is denied and Claude reads "Send the task to the codex:codex-rescue subagent instead."

```json
{
  "step_record_id": "step-20260904-061446-p3wh",
  "step": "denied-with-reason",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "**[no-codex-exec]**\nSend the task to the codex:codex-rescue subagent instead."
      },
      "systemMessage": "**[no-codex-exec]**\nSend the task to the codex:codex-rescue subagent instead."
    },
    "text": "Send the task to the codex:codex-rescue subagent instead."
  },
  "result": {
    "decision": "deny",
    "reason": "**[no-codex-exec]**\nSend the task to the codex:codex-rescue subagent instead."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061446-slok",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:46.616Z",
  "finished_at": "2026-09-03T21:14:46.619Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061446-r9p3",
      "step": "run-bash"
    }
  ]
}
```

### A quoted heredoc body is not part of the command (line 41)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-sleep-loop" blocks bash commands that match "\b(until\|while)\b[\s\S]*\bsleep\b" | ok | 3 | true | 0 | 0 |
| Claude runs this bash command | ok | 717 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |

#### the user rule "no-sleep-loop" blocks bash commands that match "\b(until|while)\b[\s\S]*\bsleep\b"

```json
{
  "step_record_id": "step-20260904-061446-e8jn",
  "step": "user-bash-rule",
  "kind": "run",
  "args": {
    "name": "no-sleep-loop",
    "verb": "blocks",
    "pattern": "\\b(until|while)\\b[\\s\\S]*\\bsleep\\b",
    "message": "Do not wait with a loop."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/no-sleep-loop.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061446-sple",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:46.640Z",
  "finished_at": "2026-09-03T21:14:46.643Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": true,
  "fixtures": [
    {
      "name": "sandbox",
      "scope": "scenario",
      "reused": false,
      "setup_ms": 1,
      "at": "2026-09-03T21:14:46.641Z"
    }
  ]
}
```

#### Claude runs this bash command

```json
{
  "step_record_id": "step-20260904-061446-qjy6",
  "step": "run-bash-block",
  "kind": "run",
  "args": {
    "command": "cat > reap.mjs <<'EOF'\nwhile (queue.length) { await sleep(1); }\nEOF"
  },
  "result": {
    "exit_code": 0,
    "output": {}
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061446-sple",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:46.646Z",
  "finished_at": "2026-09-03T21:14:47.363Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "fixtures": [
    {
      "name": "sandbox",
      "scope": "scenario",
      "reused": true
    }
  ]
}
```

#### the hook returns nothing

```json
{
  "step_record_id": "step-20260904-061447-jp4v",
  "step": "hook-returns-nothing",
  "kind": "run",
  "args": {
    "output": {}
  },
  "result": {
    "keys": []
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061446-sple",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:47.366Z",
  "finished_at": "2026-09-03T21:14:47.367Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061446-qjy6",
      "step": "run-bash-block"
    }
  ]
}
```

### command_literal holds the body of a quoted heredoc (line 54)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-todo-in-file" warns bash commands whose command_literal matches "\bTODO\b" | ok | 3 | true | 0 | 0 |
| Claude runs this bash command | ok | 361 | false | 0 | 0 |
| Claude reads the note "This writes a TODO into a file." | ok | 1 | false | 0 | 0 |

#### the user rule "no-todo-in-file" warns bash commands whose command_literal matches "\bTODO\b"

```json
{
  "step_record_id": "step-20260904-061447-5tzj",
  "step": "user-bash-field-rule",
  "kind": "run",
  "args": {
    "name": "no-todo-in-file",
    "verb": "warns",
    "field": "command_literal",
    "pattern": "\\bTODO\\b",
    "message": "This writes a TODO into a file."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/no-todo-in-file.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061447-2ndj",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:47.384Z",
  "finished_at": "2026-09-03T21:14:47.387Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": true,
  "fixtures": [
    {
      "name": "sandbox",
      "scope": "scenario",
      "reused": false,
      "setup_ms": 1,
      "at": "2026-09-03T21:14:47.385Z"
    }
  ]
}
```

#### Claude runs this bash command

```json
{
  "step_record_id": "step-20260904-061447-uaq2",
  "step": "run-bash-block",
  "kind": "run",
  "args": {
    "command": "cat > notes.md <<'EOF'\nTODO: name the owner of this step.\nEOF"
  },
  "result": {
    "exit_code": 0,
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[no-todo-in-file]**\nThis writes a TODO into a file."
      },
      "systemMessage": "**[no-todo-in-file]**\nThis writes a TODO into a file."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061447-2ndj",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:47.388Z",
  "finished_at": "2026-09-03T21:14:47.749Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "fixtures": [
    {
      "name": "sandbox",
      "scope": "scenario",
      "reused": true
    }
  ]
}
```

#### Claude reads the note "This writes a TODO into a file."

```json
{
  "step_record_id": "step-20260904-061447-jeqf",
  "step": "claude-reads-note",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[no-todo-in-file]**\nThis writes a TODO into a file."
      },
      "systemMessage": "**[no-todo-in-file]**\nThis writes a TODO into a file."
    },
    "text": "This writes a TODO into a file."
  },
  "result": {
    "context": "**[no-todo-in-file]**\nThis writes a TODO into a file."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061447-2ndj",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:47.752Z",
  "finished_at": "2026-09-03T21:14:47.753Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061447-uaq2",
      "step": "run-bash-block"
    }
  ]
}
```

### The same rule stays quiet when the word is only in the command (line 67)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-todo-in-file" warns bash commands whose command_literal matches "\bTODO\b" | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "grep -r TODO src/" | ok | 363 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |

#### the user rule "no-todo-in-file" warns bash commands whose command_literal matches "\bTODO\b"

```json
{
  "step_record_id": "step-20260904-061447-kqbf",
  "step": "user-bash-field-rule",
  "kind": "run",
  "args": {
    "name": "no-todo-in-file",
    "verb": "warns",
    "field": "command_literal",
    "pattern": "\\bTODO\\b",
    "message": "This writes a TODO into a file."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/no-todo-in-file.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061447-ej11",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:47.771Z",
  "finished_at": "2026-09-03T21:14:47.773Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": true,
  "fixtures": [
    {
      "name": "sandbox",
      "scope": "scenario",
      "reused": false,
      "setup_ms": 1,
      "at": "2026-09-03T21:14:47.771Z"
    }
  ]
}
```

#### Claude runs the bash command "grep -r TODO src/"

```json
{
  "step_record_id": "step-20260904-061447-tmno",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "grep -r TODO src/"
  },
  "result": {
    "exit_code": 0,
    "output": {}
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061447-ej11",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:47.774Z",
  "finished_at": "2026-09-03T21:14:48.137Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "fixtures": [
    {
      "name": "sandbox",
      "scope": "scenario",
      "reused": true
    }
  ]
}
```

#### the hook returns nothing

```json
{
  "step_record_id": "step-20260904-061448-jsff",
  "step": "hook-returns-nothing",
  "kind": "run",
  "args": {
    "output": {}
  },
  "result": {
    "keys": []
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061447-ej11",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:48.139Z",
  "finished_at": "2026-09-03T21:14:48.140Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061447-tmno",
      "step": "run-bash"
    }
  ]
}
```

### command_expanded holds the text inside double quotes (line 75)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "backtick-in-double-quotes" warns bash commands whose command_expanded matches "`" | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "echo \"today is `date`\"" | ok | 354 | false | 0 | 0 |
| Claude reads the note "A backtick here is a command substitution." | ok | 1 | false | 0 | 0 |

#### the user rule "backtick-in-double-quotes" warns bash commands whose command_expanded matches "`"

```json
{
  "step_record_id": "step-20260904-061448-2kbn",
  "step": "user-bash-field-rule",
  "kind": "run",
  "args": {
    "name": "backtick-in-double-quotes",
    "verb": "warns",
    "field": "command_expanded",
    "pattern": "`",
    "message": "A backtick here is a command substitution."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/backtick-in-double-quotes.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061448-r652",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:48.160Z",
  "finished_at": "2026-09-03T21:14:48.162Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": true,
  "fixtures": [
    {
      "name": "sandbox",
      "scope": "scenario",
      "reused": false,
      "setup_ms": 1,
      "at": "2026-09-03T21:14:48.160Z"
    }
  ]
}
```

#### Claude runs the bash command "echo \"today is `date`\""

```json
{
  "step_record_id": "step-20260904-061448-3pz5",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "echo \"today is `date`\""
  },
  "result": {
    "exit_code": 0,
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[backtick-in-double-quotes]**\nA backtick here is a command substitution."
      },
      "systemMessage": "**[backtick-in-double-quotes]**\nA backtick here is a command substitution."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061448-r652",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:48.164Z",
  "finished_at": "2026-09-03T21:14:48.518Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "fixtures": [
    {
      "name": "sandbox",
      "scope": "scenario",
      "reused": true
    }
  ]
}
```

#### Claude reads the note "A backtick here is a command substitution."

```json
{
  "step_record_id": "step-20260904-061448-zdan",
  "step": "claude-reads-note",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[backtick-in-double-quotes]**\nA backtick here is a command substitution."
      },
      "systemMessage": "**[backtick-in-double-quotes]**\nA backtick here is a command substitution."
    },
    "text": "A backtick here is a command substitution."
  },
  "result": {
    "context": "**[backtick-in-double-quotes]**\nA backtick here is a command substitution."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061448-r652",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:48.519Z",
  "finished_at": "2026-09-03T21:14:48.520Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061448-3pz5",
      "step": "run-bash"
    }
  ]
}
```

### Double quotes written inside single quotes are not quotes (line 83)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "backtick-in-double-quotes" warns bash commands whose command_expanded matches "`" | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "ruby -i -pe 'gsub(/x/, \"`y`\")' README.md" | ok | 362 | false | 0 | 0 |
| the hook returns nothing | ok | 0 | false | 0 | 0 |

#### the user rule "backtick-in-double-quotes" warns bash commands whose command_expanded matches "`"

```json
{
  "step_record_id": "step-20260904-061448-ry0o",
  "step": "user-bash-field-rule",
  "kind": "run",
  "args": {
    "name": "backtick-in-double-quotes",
    "verb": "warns",
    "field": "command_expanded",
    "pattern": "`",
    "message": "A backtick here is a command substitution."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/backtick-in-double-quotes.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061448-5ll6",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:48.534Z",
  "finished_at": "2026-09-03T21:14:48.535Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": true,
  "fixtures": [
    {
      "name": "sandbox",
      "scope": "scenario",
      "reused": false,
      "setup_ms": 1,
      "at": "2026-09-03T21:14:48.534Z"
    }
  ]
}
```

#### Claude runs the bash command "ruby -i -pe 'gsub(/x/, \"`y`\")' README.md"

```json
{
  "step_record_id": "step-20260904-061448-yk3v",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "ruby -i -pe 'gsub(/x/, \"`y`\")' README.md"
  },
  "result": {
    "exit_code": 0,
    "output": {}
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061448-5ll6",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:48.537Z",
  "finished_at": "2026-09-03T21:14:48.899Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "fixtures": [
    {
      "name": "sandbox",
      "scope": "scenario",
      "reused": true
    }
  ]
}
```

#### the hook returns nothing

```json
{
  "step_record_id": "step-20260904-061448-yk5p",
  "step": "hook-returns-nothing",
  "kind": "run",
  "args": {
    "output": {}
  },
  "result": {
    "keys": []
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061448-5ll6",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:48.901Z",
  "finished_at": "2026-09-03T21:14:48.901Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061448-yk3v",
      "step": "run-bash"
    }
  ]
}
```

### command_expanded holds the body of a heredoc whose word is not quoted (line 91)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "backtick-in-double-quotes" warns bash commands whose command_expanded matches "`" | ok | 2 | true | 0 | 0 |
| Claude runs this bash command | ok | 332 | false | 0 | 0 |
| Claude reads the note "A backtick here is a command substitution." | ok | 1 | false | 0 | 0 |

#### the user rule "backtick-in-double-quotes" warns bash commands whose command_expanded matches "`"

```json
{
  "step_record_id": "step-20260904-061448-gd72",
  "step": "user-bash-field-rule",
  "kind": "run",
  "args": {
    "name": "backtick-in-double-quotes",
    "verb": "warns",
    "field": "command_expanded",
    "pattern": "`",
    "message": "A backtick here is a command substitution."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/backtick-in-double-quotes.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061448-cxgo",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:48.916Z",
  "finished_at": "2026-09-03T21:14:48.918Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": true,
  "fixtures": [
    {
      "name": "sandbox",
      "scope": "scenario",
      "reused": false,
      "setup_ms": 1,
      "at": "2026-09-03T21:14:48.917Z"
    }
  ]
}
```

#### Claude runs this bash command

```json
{
  "step_record_id": "step-20260904-061448-svhq",
  "step": "run-bash-block",
  "kind": "run",
  "args": {
    "command": "cat > report.md <<EOF\nThe version is `git describe`.\nEOF"
  },
  "result": {
    "exit_code": 0,
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[backtick-in-double-quotes]**\nA backtick here is a command substitution."
      },
      "systemMessage": "**[backtick-in-double-quotes]**\nA backtick here is a command substitution."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061448-cxgo",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:48.920Z",
  "finished_at": "2026-09-03T21:14:49.252Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "fixtures": [
    {
      "name": "sandbox",
      "scope": "scenario",
      "reused": true
    }
  ]
}
```

#### Claude reads the note "A backtick here is a command substitution."

```json
{
  "step_record_id": "step-20260904-061449-o1ss",
  "step": "claude-reads-note",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[backtick-in-double-quotes]**\nA backtick here is a command substitution."
      },
      "systemMessage": "**[backtick-in-double-quotes]**\nA backtick here is a command substitution."
    },
    "text": "A backtick here is a command substitution."
  },
  "result": {
    "context": "**[backtick-in-double-quotes]**\nA backtick here is a command substitution."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061448-cxgo",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:49.254Z",
  "finished_at": "2026-09-03T21:14:49.255Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061448-svhq",
      "step": "run-bash-block"
    }
  ]
}
```

### An escaped double quote does not end the string it sits in (line 104)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "backtick-in-double-quotes" warns bash commands whose command_expanded matches "`" | ok | 2 | true | 0 | 0 |
| Claude runs this bash command | ok | 348 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |

#### the user rule "backtick-in-double-quotes" warns bash commands whose command_expanded matches "`"

```json
{
  "step_record_id": "step-20260904-061449-hjnx",
  "step": "user-bash-field-rule",
  "kind": "run",
  "args": {
    "name": "backtick-in-double-quotes",
    "verb": "warns",
    "field": "command_expanded",
    "pattern": "`",
    "message": "A backtick here is a command substitution."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/backtick-in-double-quotes.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061449-hej3",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:49.267Z",
  "finished_at": "2026-09-03T21:14:49.269Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": true,
  "fixtures": [
    {
      "name": "sandbox",
      "scope": "scenario",
      "reused": false,
      "setup_ms": 1,
      "at": "2026-09-03T21:14:49.267Z"
    }
  ]
}
```

#### Claude runs this bash command

```json
{
  "step_record_id": "step-20260904-061449-m5jb",
  "step": "run-bash-block",
  "kind": "run",
  "args": {
    "command": "echo \"a \\\" b\" 'c `d` e'"
  },
  "result": {
    "exit_code": 0,
    "output": {}
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061449-hej3",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:49.270Z",
  "finished_at": "2026-09-03T21:14:49.618Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "fixtures": [
    {
      "name": "sandbox",
      "scope": "scenario",
      "reused": true
    }
  ]
}
```

#### the hook returns nothing

```json
{
  "step_record_id": "step-20260904-061449-siyi",
  "step": "hook-returns-nothing",
  "kind": "run",
  "args": {
    "output": {}
  },
  "result": {
    "keys": []
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061449-hej3",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:49.619Z",
  "finished_at": "2026-09-03T21:14:49.620Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061449-m5jb",
      "step": "run-bash-block"
    }
  ]
}
```

### command_raw holds the text the tool received (line 115)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-quoted-mention" warns bash commands whose command_raw matches "codex\s+exec" | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "grep 'codex exec' notes.md" | ok | 339 | false | 0 | 0 |
| Claude reads the note "This command names codex exec, even inside quotes." | ok | 1 | false | 0 | 0 |

#### the user rule "no-quoted-mention" warns bash commands whose command_raw matches "codex\s+exec"

```json
{
  "step_record_id": "step-20260904-061449-2k36",
  "step": "user-bash-field-rule",
  "kind": "run",
  "args": {
    "name": "no-quoted-mention",
    "verb": "warns",
    "field": "command_raw",
    "pattern": "codex\\s+exec",
    "message": "This command names codex exec, even inside quotes."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/no-quoted-mention.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061449-two4",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:49.632Z",
  "finished_at": "2026-09-03T21:14:49.634Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": true,
  "fixtures": [
    {
      "name": "sandbox",
      "scope": "scenario",
      "reused": false,
      "setup_ms": 1,
      "at": "2026-09-03T21:14:49.633Z"
    }
  ]
}
```

#### Claude runs the bash command "grep 'codex exec' notes.md"

```json
{
  "step_record_id": "step-20260904-061449-skcl",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "grep 'codex exec' notes.md"
  },
  "result": {
    "exit_code": 0,
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[no-quoted-mention]**\nThis command names codex exec, even inside quotes."
      },
      "systemMessage": "**[no-quoted-mention]**\nThis command names codex exec, even inside quotes."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061449-two4",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:49.635Z",
  "finished_at": "2026-09-03T21:14:49.974Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "fixtures": [
    {
      "name": "sandbox",
      "scope": "scenario",
      "reused": true
    }
  ]
}
```

#### Claude reads the note "This command names codex exec, even inside quotes."

```json
{
  "step_record_id": "step-20260904-061449-9ru5",
  "step": "claude-reads-note",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[no-quoted-mention]**\nThis command names codex exec, even inside quotes."
      },
      "systemMessage": "**[no-quoted-mention]**\nThis command names codex exec, even inside quotes."
    },
    "text": "This command names codex exec, even inside quotes."
  },
  "result": {
    "context": "**[no-quoted-mention]**\nThis command names codex exec, even inside quotes."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061449-two4",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:49.975Z",
  "finished_at": "2026-09-03T21:14:49.976Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061449-skcl",
      "step": "run-bash"
    }
  ]
}
```

## Declared vs observed

No step declared `mutates: false` and was measured making a write.
