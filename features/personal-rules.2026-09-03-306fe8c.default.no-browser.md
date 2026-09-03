---
feature: features/personal-rules.feature
commit: 306fe8c9e049895f4c1a4d65f81a8d5679c30a7a
run_id: run-20260903-215826-yk71
ran_at: 2026-09-03T21:58:26.998+09:00
accepted_at: 2026-09-03T21:58:41.587+09:00
environment: default
browser: none
scenarios:
  - name: codex exec is stopped even behind another command
    line: 9
    scenario_record_id: scn-20260903-215826-ybnt
  - name: A quoted mention of codex exec passes
    line: 25
    scenario_record_id: scn-20260903-215827-5oem
  - name: A polling loop with sleep is stopped, also across lines
    line: 41
    scenario_record_id: scn-20260903-215827-37c6
  - name: A loop without sleep passes
    line: 62
    scenario_record_id: scn-20260903-215827-9g2w
  - name: herdr send-text with --enter is stopped
    line: 78
    scenario_record_id: scn-20260903-215828-5y9a
  - name: herdr send-text without --enter passes
    line: 94
    scenario_record_id: scn-20260903-215828-0ayc
  - name: A backtick inside double quotes gets a warning
    line: 110
    scenario_record_id: scn-20260903-215828-vcv0
  - name: An escaped backtick inside double quotes passes
    line: 127
    scenario_record_id: scn-20260903-215829-2pjj
---

# The author's own rules: green at 306fe8c

## Condition

- environment: default
- browser: not launched (no step in this run destructured page/context)

## The scenario as it ran

```gherkin
Feature: The author's own rules

  These four rules live in the author's ~/.claude/steerhook/. They pin the
  regular-expression dialect the plugin has to support: word boundaries, a
  character class with a newline escape, a negative lookbehind, and a match
  across lines. Each rule gets one command it must catch and one it must let
  through.

  Scenario: codex exec is stopped even behind another command
    Given the user rule file "no-direct-codex-exec.md" contains
      """
      ---
      name: no-direct-codex-exec
      enabled: true
      event: bash
      pattern: (^|[\s;&|(])codex\s+exec\b
      action: block
      ---

      Do not run codex exec from Bash. Send the task to the codex:codex-rescue subagent.
      """
    When Claude runs the bash command "cd work && timeout 600 codex exec --help"
    Then the command is denied and Claude reads "Send the task to the codex:codex-rescue subagent."

  Scenario: A quoted mention of codex exec passes
    Given the user rule file "no-direct-codex-exec.md" contains
      """
      ---
      name: no-direct-codex-exec
      enabled: true
      event: bash
      pattern: (^|[\s;&|(])codex\s+exec\b
      action: block
      ---

      Do not run codex exec from Bash. Send the task to the codex:codex-rescue subagent.
      """
    When Claude runs the bash command "grep \"codex exec\" notes.md"
    Then the hook returns nothing

  Scenario: A polling loop with sleep is stopped, also across lines
    Given the user rule file "no-until-sleep-loop.md" contains
      """
      ---
      name: no-until-sleep-loop
      enabled: true
      event: bash
      pattern: \b(until|while)\b[\s\S]*\bsleep\b
      action: block
      ---

      Do not write a loop that waits with sleep. A background task sends a notification when it completes.
      """
    When Claude runs this bash command
      """
      until curl -s localhost:8080; do
        sleep 2
      done
      """
    Then the command is denied and Claude reads "A background task sends a notification when it completes."

  Scenario: A loop without sleep passes
    Given the user rule file "no-until-sleep-loop.md" contains
      """
      ---
      name: no-until-sleep-loop
      enabled: true
      event: bash
      pattern: \b(until|while)\b[\s\S]*\bsleep\b
      action: block
      ---

      Do not write a loop that waits with sleep. A background task sends a notification when it completes.
      """
    When Claude runs the bash command "while read line; do echo $line; done < list.txt"
    Then the hook returns nothing

  Scenario: herdr send-text with --enter is stopped
    Given the user rule file "herdr-send-text-enter.md" contains
      """
      ---
      name: herdr-send-text-enter
      enabled: true
      event: bash
      pattern: herdr\s+pane\s+send-text\b[^\n]*--enter
      action: block
      ---

      herdr pane send-text has no --enter flag. Send the text first, then send the key in a second command.
      """
    When Claude runs the bash command "herdr pane send-text w1:p1 \"hello\" --enter"
    Then the command is denied and Claude reads "Send the text first, then send the key in a second command."

  Scenario: herdr send-text without --enter passes
    Given the user rule file "herdr-send-text-enter.md" contains
      """
      ---
      name: herdr-send-text-enter
      enabled: true
      event: bash
      pattern: herdr\s+pane\s+send-text\b[^\n]*--enter
      action: block
      ---

      herdr pane send-text has no --enter flag. Send the text first, then send the key in a second command.
      """
    When Claude runs the bash command "herdr pane send-text w1:p1 \"hello\""
    Then the hook returns nothing

  Scenario: A backtick inside double quotes gets a warning
    Given the user rule file "backtick-in-double-quotes.md" contains
      """
      ---
      name: backtick-in-double-quotes
      enabled: true
      event: bash
      pattern: (?:"[^"\n]*(?<!\\)`[^"\n]*")
      action: warn
      ---

      A backtick inside double quotes is a command substitution. Write a long text to a file and pass it on stdin.
      """
    When Claude runs the bash command "echo \"now `date`\""
    Then the command is allowed
    And Claude reads the note "Write a long text to a file and pass it on stdin."

  Scenario: An escaped backtick inside double quotes passes
    Given the user rule file "backtick-in-double-quotes.md" contains
      """
      ---
      name: backtick-in-double-quotes
      enabled: true
      event: bash
      pattern: (?:"[^"\n]*(?<!\\)`[^"\n]*")
      action: warn
      ---

      A backtick inside double quotes is a command substitution. Write a long text to a file and pass it on stdin.
      """
    When Claude runs the bash command "git commit -m \"Add \`x\` flag\""
    Then the hook returns nothing
```

## What the tool measured

Evidence fields are stripped from every record below: evidence. They stay under the state directory with the trace and the screenshots, and are not committed.

### codex exec is stopped even behind another command (line 9)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "no-direct-codex-exec.md" contains | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "cd work && timeout 600 codex exec --help" | ok | 309 | false | 0 | 0 |
| the command is denied and Claude reads "Send the task to the codex:codex-rescue subagent." | ok | 1 | false | 0 | 0 |

#### the user rule file "no-direct-codex-exec.md" contains

```json
{
  "step_record_id": "step-20260903-215826-vbdo",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "no-direct-codex-exec.md",
    "content": "---\nname: no-direct-codex-exec\nenabled: true\nevent: bash\npattern: (^|[\\s;&|(])codex\\s+exec\\b\naction: block\n---\n\nDo not run codex exec from Bash. Send the task to the codex:codex-rescue subagent."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/no-direct-codex-exec.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215826-ybnt",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:26.999Z",
  "finished_at": "2026-09-03T12:58:27.001Z",
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
      "at": "2026-09-03T12:58:26.999Z"
    }
  ]
}
```

#### Claude runs the bash command "cd work && timeout 600 codex exec --help"

```json
{
  "step_record_id": "step-20260903-215827-d63w",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "cd work && timeout 600 codex exec --help"
  },
  "result": {
    "exit_code": 0,
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "**[no-direct-codex-exec]**\nDo not run codex exec from Bash. Send the task to the codex:codex-rescue subagent."
      },
      "systemMessage": "**[no-direct-codex-exec]**\nDo not run codex exec from Bash. Send the task to the codex:codex-rescue subagent."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215826-ybnt",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:27.002Z",
  "finished_at": "2026-09-03T12:58:27.311Z",
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

#### the command is denied and Claude reads "Send the task to the codex:codex-rescue subagent."

```json
{
  "step_record_id": "step-20260903-215827-a5ec",
  "step": "denied-with-reason",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "**[no-direct-codex-exec]**\nDo not run codex exec from Bash. Send the task to the codex:codex-rescue subagent."
      },
      "systemMessage": "**[no-direct-codex-exec]**\nDo not run codex exec from Bash. Send the task to the codex:codex-rescue subagent."
    },
    "text": "Send the task to the codex:codex-rescue subagent."
  },
  "result": {
    "decision": "deny",
    "reason": "**[no-direct-codex-exec]**\nDo not run codex exec from Bash. Send the task to the codex:codex-rescue subagent."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215826-ybnt",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:27.315Z",
  "finished_at": "2026-09-03T12:58:27.316Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215827-d63w",
      "step": "run-bash"
    }
  ]
}
```

### A quoted mention of codex exec passes (line 25)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "no-direct-codex-exec.md" contains | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "grep \"codex exec\" notes.md" | ok | 316 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |

#### the user rule file "no-direct-codex-exec.md" contains

```json
{
  "step_record_id": "step-20260903-215827-u3qr",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "no-direct-codex-exec.md",
    "content": "---\nname: no-direct-codex-exec\nenabled: true\nevent: bash\npattern: (^|[\\s;&|(])codex\\s+exec\\b\naction: block\n---\n\nDo not run codex exec from Bash. Send the task to the codex:codex-rescue subagent."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/no-direct-codex-exec.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215827-5oem",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:27.334Z",
  "finished_at": "2026-09-03T12:58:27.336Z",
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
      "at": "2026-09-03T12:58:27.334Z"
    }
  ]
}
```

#### Claude runs the bash command "grep \"codex exec\" notes.md"

```json
{
  "step_record_id": "step-20260903-215827-3lp7",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "grep \"codex exec\" notes.md"
  },
  "result": {
    "exit_code": 0,
    "output": {}
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215827-5oem",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:27.337Z",
  "finished_at": "2026-09-03T12:58:27.653Z",
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
  "step_record_id": "step-20260903-215827-0gnr",
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
  "scenario_record_id": "scn-20260903-215827-5oem",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:27.655Z",
  "finished_at": "2026-09-03T12:58:27.656Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215827-3lp7",
      "step": "run-bash"
    }
  ]
}
```

### A polling loop with sleep is stopped, also across lines (line 41)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "no-until-sleep-loop.md" contains | ok | 2 | true | 0 | 0 |
| Claude runs this bash command | ok | 297 | false | 0 | 0 |
| the command is denied and Claude reads "A background task sends a notification when it completes." | ok | 0 | false | 0 | 0 |

#### the user rule file "no-until-sleep-loop.md" contains

```json
{
  "step_record_id": "step-20260903-215827-a7bg",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "no-until-sleep-loop.md",
    "content": "---\nname: no-until-sleep-loop\nenabled: true\nevent: bash\npattern: \\b(until|while)\\b[\\s\\S]*\\bsleep\\b\naction: block\n---\n\nDo not write a loop that waits with sleep. A background task sends a notification when it completes."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/no-until-sleep-loop.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215827-37c6",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:27.672Z",
  "finished_at": "2026-09-03T12:58:27.674Z",
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
      "at": "2026-09-03T12:58:27.672Z"
    }
  ]
}
```

#### Claude runs this bash command

```json
{
  "step_record_id": "step-20260903-215827-rulm",
  "step": "run-bash-block",
  "kind": "run",
  "args": {
    "command": "until curl -s localhost:8080; do\n  sleep 2\ndone"
  },
  "result": {
    "exit_code": 0,
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "**[no-until-sleep-loop]**\nDo not write a loop that waits with sleep. A background task sends a notification when it completes."
      },
      "systemMessage": "**[no-until-sleep-loop]**\nDo not write a loop that waits with sleep. A background task sends a notification when it completes."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215827-37c6",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:27.675Z",
  "finished_at": "2026-09-03T12:58:27.972Z",
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

#### the command is denied and Claude reads "A background task sends a notification when it completes."

```json
{
  "step_record_id": "step-20260903-215827-m207",
  "step": "denied-with-reason",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "**[no-until-sleep-loop]**\nDo not write a loop that waits with sleep. A background task sends a notification when it completes."
      },
      "systemMessage": "**[no-until-sleep-loop]**\nDo not write a loop that waits with sleep. A background task sends a notification when it completes."
    },
    "text": "A background task sends a notification when it completes."
  },
  "result": {
    "decision": "deny",
    "reason": "**[no-until-sleep-loop]**\nDo not write a loop that waits with sleep. A background task sends a notification when it completes."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215827-37c6",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:27.974Z",
  "finished_at": "2026-09-03T12:58:27.974Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215827-rulm",
      "step": "run-bash-block"
    }
  ]
}
```

### A loop without sleep passes (line 62)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "no-until-sleep-loop.md" contains | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "while read line; do echo $line; done < list.txt" | ok | 295 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |

#### the user rule file "no-until-sleep-loop.md" contains

```json
{
  "step_record_id": "step-20260903-215827-5a2h",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "no-until-sleep-loop.md",
    "content": "---\nname: no-until-sleep-loop\nenabled: true\nevent: bash\npattern: \\b(until|while)\\b[\\s\\S]*\\bsleep\\b\naction: block\n---\n\nDo not write a loop that waits with sleep. A background task sends a notification when it completes."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/no-until-sleep-loop.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215827-9g2w",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:27.986Z",
  "finished_at": "2026-09-03T12:58:27.988Z",
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
      "at": "2026-09-03T12:58:27.986Z"
    }
  ]
}
```

#### Claude runs the bash command "while read line; do echo $line; done < list.txt"

```json
{
  "step_record_id": "step-20260903-215827-xp22",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "while read line; do echo $line; done < list.txt"
  },
  "result": {
    "exit_code": 0,
    "output": {}
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215827-9g2w",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:27.989Z",
  "finished_at": "2026-09-03T12:58:28.284Z",
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
  "step_record_id": "step-20260903-215828-s8x8",
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
  "scenario_record_id": "scn-20260903-215827-9g2w",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:28.285Z",
  "finished_at": "2026-09-03T12:58:28.286Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215827-xp22",
      "step": "run-bash"
    }
  ]
}
```

### herdr send-text with --enter is stopped (line 78)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "herdr-send-text-enter.md" contains | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "herdr pane send-text w1:p1 \"hello\" --enter" | ok | 288 | false | 0 | 0 |
| the command is denied and Claude reads "Send the text first, then send the key in a second command." | ok | 1 | false | 0 | 0 |

#### the user rule file "herdr-send-text-enter.md" contains

```json
{
  "step_record_id": "step-20260903-215828-e5yy",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "herdr-send-text-enter.md",
    "content": "---\nname: herdr-send-text-enter\nenabled: true\nevent: bash\npattern: herdr\\s+pane\\s+send-text\\b[^\\n]*--enter\naction: block\n---\n\nherdr pane send-text has no --enter flag. Send the text first, then send the key in a second command."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/herdr-send-text-enter.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215828-5y9a",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:28.296Z",
  "finished_at": "2026-09-03T12:58:28.298Z",
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
      "at": "2026-09-03T12:58:28.297Z"
    }
  ]
}
```

#### Claude runs the bash command "herdr pane send-text w1:p1 \"hello\" --enter"

```json
{
  "step_record_id": "step-20260903-215828-c03o",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "herdr pane send-text w1:p1 \"hello\" --enter"
  },
  "result": {
    "exit_code": 0,
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "**[herdr-send-text-enter]**\nherdr pane send-text has no --enter flag. Send the text first, then send the key in a second command."
      },
      "systemMessage": "**[herdr-send-text-enter]**\nherdr pane send-text has no --enter flag. Send the text first, then send the key in a second command."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215828-5y9a",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:28.299Z",
  "finished_at": "2026-09-03T12:58:28.587Z",
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

#### the command is denied and Claude reads "Send the text first, then send the key in a second command."

```json
{
  "step_record_id": "step-20260903-215828-4urr",
  "step": "denied-with-reason",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "**[herdr-send-text-enter]**\nherdr pane send-text has no --enter flag. Send the text first, then send the key in a second command."
      },
      "systemMessage": "**[herdr-send-text-enter]**\nherdr pane send-text has no --enter flag. Send the text first, then send the key in a second command."
    },
    "text": "Send the text first, then send the key in a second command."
  },
  "result": {
    "decision": "deny",
    "reason": "**[herdr-send-text-enter]**\nherdr pane send-text has no --enter flag. Send the text first, then send the key in a second command."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215828-5y9a",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:28.588Z",
  "finished_at": "2026-09-03T12:58:28.589Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215828-c03o",
      "step": "run-bash"
    }
  ]
}
```

### herdr send-text without --enter passes (line 94)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "herdr-send-text-enter.md" contains | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "herdr pane send-text w1:p1 \"hello\"" | ok | 266 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |

#### the user rule file "herdr-send-text-enter.md" contains

```json
{
  "step_record_id": "step-20260903-215828-phu3",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "herdr-send-text-enter.md",
    "content": "---\nname: herdr-send-text-enter\nenabled: true\nevent: bash\npattern: herdr\\s+pane\\s+send-text\\b[^\\n]*--enter\naction: block\n---\n\nherdr pane send-text has no --enter flag. Send the text first, then send the key in a second command."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/herdr-send-text-enter.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215828-0ayc",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:28.600Z",
  "finished_at": "2026-09-03T12:58:28.602Z",
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
      "at": "2026-09-03T12:58:28.601Z"
    }
  ]
}
```

#### Claude runs the bash command "herdr pane send-text w1:p1 \"hello\""

```json
{
  "step_record_id": "step-20260903-215828-hzzl",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "herdr pane send-text w1:p1 \"hello\""
  },
  "result": {
    "exit_code": 0,
    "output": {}
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215828-0ayc",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:28.604Z",
  "finished_at": "2026-09-03T12:58:28.870Z",
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
  "step_record_id": "step-20260903-215828-z91m",
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
  "scenario_record_id": "scn-20260903-215828-0ayc",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:28.871Z",
  "finished_at": "2026-09-03T12:58:28.872Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215828-hzzl",
      "step": "run-bash"
    }
  ]
}
```

### A backtick inside double quotes gets a warning (line 110)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "backtick-in-double-quotes.md" contains | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "echo \"now `date`\"" | ok | 312 | false | 0 | 0 |
| the command is allowed | ok | 0 | false | 0 | 0 |
| Claude reads the note "Write a long text to a file and pass it on stdin." | ok | 0 | false | 0 | 0 |

#### the user rule file "backtick-in-double-quotes.md" contains

```json
{
  "step_record_id": "step-20260903-215828-bsjn",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "backtick-in-double-quotes.md",
    "content": "---\nname: backtick-in-double-quotes\nenabled: true\nevent: bash\npattern: (?:\"[^\"\\n]*(?<!\\\\)`[^\"\\n]*\")\naction: warn\n---\n\nA backtick inside double quotes is a command substitution. Write a long text to a file and pass it on stdin."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/backtick-in-double-quotes.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215828-vcv0",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:28.881Z",
  "finished_at": "2026-09-03T12:58:28.883Z",
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
      "at": "2026-09-03T12:58:28.881Z"
    }
  ]
}
```

#### Claude runs the bash command "echo \"now `date`\""

```json
{
  "step_record_id": "step-20260903-215828-7s1p",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "echo \"now `date`\""
  },
  "result": {
    "exit_code": 0,
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[backtick-in-double-quotes]**\nA backtick inside double quotes is a command substitution. Write a long text to a file and pass it on stdin."
      },
      "systemMessage": "**[backtick-in-double-quotes]**\nA backtick inside double quotes is a command substitution. Write a long text to a file and pass it on stdin."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215828-vcv0",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:28.883Z",
  "finished_at": "2026-09-03T12:58:29.195Z",
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

#### the command is allowed

```json
{
  "step_record_id": "step-20260903-215829-neuy",
  "step": "allowed",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[backtick-in-double-quotes]**\nA backtick inside double quotes is a command substitution. Write a long text to a file and pass it on stdin."
      },
      "systemMessage": "**[backtick-in-double-quotes]**\nA backtick inside double quotes is a command substitution. Write a long text to a file and pass it on stdin."
    }
  },
  "result": {
    "permission_decision": null
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215828-vcv0",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:29.196Z",
  "finished_at": "2026-09-03T12:58:29.196Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215828-7s1p",
      "step": "run-bash"
    }
  ]
}
```

#### Claude reads the note "Write a long text to a file and pass it on stdin."

```json
{
  "step_record_id": "step-20260903-215829-xu8y",
  "step": "claude-reads-note",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[backtick-in-double-quotes]**\nA backtick inside double quotes is a command substitution. Write a long text to a file and pass it on stdin."
      },
      "systemMessage": "**[backtick-in-double-quotes]**\nA backtick inside double quotes is a command substitution. Write a long text to a file and pass it on stdin."
    },
    "text": "Write a long text to a file and pass it on stdin."
  },
  "result": {
    "context": "**[backtick-in-double-quotes]**\nA backtick inside double quotes is a command substitution. Write a long text to a file and pass it on stdin."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215828-vcv0",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:29.198Z",
  "finished_at": "2026-09-03T12:58:29.198Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215828-7s1p",
      "step": "run-bash"
    }
  ]
}
```

### An escaped backtick inside double quotes passes (line 127)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "backtick-in-double-quotes.md" contains | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "git commit -m \"Add \`x\` flag\"" | ok | 285 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |

#### the user rule file "backtick-in-double-quotes.md" contains

```json
{
  "step_record_id": "step-20260903-215829-ng9w",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "backtick-in-double-quotes.md",
    "content": "---\nname: backtick-in-double-quotes\nenabled: true\nevent: bash\npattern: (?:\"[^\"\\n]*(?<!\\\\)`[^\"\\n]*\")\naction: warn\n---\n\nA backtick inside double quotes is a command substitution. Write a long text to a file and pass it on stdin."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/backtick-in-double-quotes.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215829-2pjj",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:29.210Z",
  "finished_at": "2026-09-03T12:58:29.212Z",
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
      "at": "2026-09-03T12:58:29.210Z"
    }
  ]
}
```

#### Claude runs the bash command "git commit -m \"Add \`x\` flag\""

```json
{
  "step_record_id": "step-20260903-215829-fdmq",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "git commit -m \"Add \\`x\\` flag\""
  },
  "result": {
    "exit_code": 0,
    "output": {}
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215829-2pjj",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:29.213Z",
  "finished_at": "2026-09-03T12:58:29.498Z",
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
  "step_record_id": "step-20260903-215829-08c9",
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
  "scenario_record_id": "scn-20260903-215829-2pjj",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:29.499Z",
  "finished_at": "2026-09-03T12:58:29.500Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215829-fdmq",
      "step": "run-bash"
    }
  ]
}
```

## Declared vs observed

No step declared `mutates: false` and was measured making a write.
