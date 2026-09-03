---
feature: features/personal-rules.feature
commit: 8ab83d6aa493d65a233c00951258136e7ae81851
run_id: run-20260904-061445-tm20
ran_at: 2026-09-04T06:14:50.190+09:00
accepted_at: 2026-09-04T06:15:08.441+09:00
environment: default
browser: none
scenarios:
  - name: codex exec is stopped even behind another command
    line: 15
    scenario_record_id: scn-20260904-061450-a9bd
  - name: A quoted mention of codex exec passes
    line: 31
    scenario_record_id: scn-20260904-061450-8d2l
  - name: codex exec inside a single-quoted prompt passes
    line: 47
    scenario_record_id: scn-20260904-061450-4tao
  - name: A polling loop with sleep is stopped, also across lines
    line: 63
    scenario_record_id: scn-20260904-061451-kj2b
  - name: A loop without sleep passes
    line: 84
    scenario_record_id: scn-20260904-061451-vk6u
  - name: A heredoc that writes a loop into a file passes
    line: 100
    scenario_record_id: scn-20260904-061451-cit4
  - name: Reading the rule's own file passes
    line: 121
    scenario_record_id: scn-20260904-061452-nfbm
  - name: herdr send-text with --enter is stopped
    line: 137
    scenario_record_id: scn-20260904-061452-nsxi
  - name: herdr send-text without --enter passes
    line: 153
    scenario_record_id: scn-20260904-061452-7k2c
  - name: A backtick inside double quotes gets a warning
    line: 169
    scenario_record_id: scn-20260904-061453-houn
  - name: An escaped backtick inside double quotes passes
    line: 189
    scenario_record_id: scn-20260904-061453-4dxb
---

# The author's own rules: green at 8ab83d6

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

  Two of the rules also pin which view of the command they read. The codex
  rule and the loop rule read the code, so a command word inside a quoted
  argument and a loop inside a heredoc body never reach them. The backtick
  rule reads the expanded text, so it sees what the shell will substitute and
  nothing else.

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

  Scenario: codex exec inside a single-quoted prompt passes
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
    When Claude runs the bash command "claude -p 'run codex exec --help and report' --model sonnet"
    Then the hook returns nothing

  Scenario: A polling loop with sleep is stopped, also across lines
    Given the user rule file "no-until-sleep-loop.md" contains
      """
      ---
      name: no-until-sleep-loop
      enabled: true
      event: bash
      pattern: \b(until|while)\b[^\n;]*(;|\n)\s*do\b[\s\S]*\bsleep\b
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
      pattern: \b(until|while)\b[^\n;]*(;|\n)\s*do\b[\s\S]*\bsleep\b
      action: block
      ---

      Do not write a loop that waits with sleep. A background task sends a notification when it completes.
      """
    When Claude runs the bash command "while read line; do echo $line; done < list.txt"
    Then the hook returns nothing

  Scenario: A heredoc that writes a loop into a file passes
    Given the user rule file "no-until-sleep-loop.md" contains
      """
      ---
      name: no-until-sleep-loop
      enabled: true
      event: bash
      pattern: \b(until|while)\b[^\n;]*(;|\n)\s*do\b[\s\S]*\bsleep\b
      action: block
      ---

      Do not write a loop that waits with sleep. A background task sends a notification when it completes.
      """
    When Claude runs this bash command
      """
      cat > reap.mjs <<'EOF'
      while (queue.length) { await sleep(1); }
      EOF
      """
    Then the hook returns nothing

  Scenario: Reading the rule's own file passes
    Given the user rule file "no-until-sleep-loop.md" contains
      """
      ---
      name: no-until-sleep-loop
      enabled: true
      event: bash
      pattern: \b(until|while)\b[^\n;]*(;|\n)\s*do\b[\s\S]*\bsleep\b
      action: block
      ---

      Do not write a loop that waits with sleep. A background task sends a notification when it completes.
      """
    When Claude runs the bash command "cat ~/.claude/steerhook/no-until-sleep-loop.md"
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
      action: warn
      conditions:
        - field: command_expanded
          operator: regex_match
          pattern: (?<!\\)`
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
      action: warn
      conditions:
        - field: command_expanded
          operator: regex_match
          pattern: (?<!\\)`
      ---

      A backtick inside double quotes is a command substitution. Write a long text to a file and pass it on stdin.
      """
    When Claude runs the bash command "git commit -m \"Add \`x\` flag\""
    Then the hook returns nothing
```

## What the tool measured

Evidence fields are stripped from every record below: evidence. They stay under the state directory with the trace and the screenshots, and are not committed.

### codex exec is stopped even behind another command (line 15)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "no-direct-codex-exec.md" contains | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "cd work && timeout 600 codex exec --help" | ok | 287 | false | 0 | 0 |
| the command is denied and Claude reads "Send the task to the codex:codex-rescue subagent." | ok | 0 | false | 0 | 0 |

#### the user rule file "no-direct-codex-exec.md" contains

```json
{
  "step_record_id": "step-20260904-061450-es17",
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
  "scenario_record_id": "scn-20260904-061450-a9bd",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:50.191Z",
  "finished_at": "2026-09-03T21:14:50.192Z",
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
      "setup_ms": 0,
      "at": "2026-09-03T21:14:50.191Z"
    }
  ]
}
```

#### Claude runs the bash command "cd work && timeout 600 codex exec --help"

```json
{
  "step_record_id": "step-20260904-061450-xr90",
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
  "scenario_record_id": "scn-20260904-061450-a9bd",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:50.193Z",
  "finished_at": "2026-09-03T21:14:50.480Z",
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
  "step_record_id": "step-20260904-061450-yzqj",
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
  "scenario_record_id": "scn-20260904-061450-a9bd",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:50.482Z",
  "finished_at": "2026-09-03T21:14:50.482Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061450-xr90",
      "step": "run-bash"
    }
  ]
}
```

### A quoted mention of codex exec passes (line 31)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "no-direct-codex-exec.md" contains | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "grep \"codex exec\" notes.md" | ok | 308 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |

#### the user rule file "no-direct-codex-exec.md" contains

```json
{
  "step_record_id": "step-20260904-061450-qplf",
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
  "scenario_record_id": "scn-20260904-061450-8d2l",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:50.493Z",
  "finished_at": "2026-09-03T21:14:50.494Z",
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
      "setup_ms": 0,
      "at": "2026-09-03T21:14:50.493Z"
    }
  ]
}
```

#### Claude runs the bash command "grep \"codex exec\" notes.md"

```json
{
  "step_record_id": "step-20260904-061450-orv0",
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
  "scenario_record_id": "scn-20260904-061450-8d2l",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:50.495Z",
  "finished_at": "2026-09-03T21:14:50.803Z",
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
  "step_record_id": "step-20260904-061450-cxzl",
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
  "scenario_record_id": "scn-20260904-061450-8d2l",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:50.804Z",
  "finished_at": "2026-09-03T21:14:50.805Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061450-orv0",
      "step": "run-bash"
    }
  ]
}
```

### codex exec inside a single-quoted prompt passes (line 47)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "no-direct-codex-exec.md" contains | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "claude -p 'run codex exec --help and report' --model sonnet" | ok | 308 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |

#### the user rule file "no-direct-codex-exec.md" contains

```json
{
  "step_record_id": "step-20260904-061450-8399",
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
  "scenario_record_id": "scn-20260904-061450-4tao",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:50.818Z",
  "finished_at": "2026-09-03T21:14:50.819Z",
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
      "at": "2026-09-03T21:14:50.818Z"
    }
  ]
}
```

#### Claude runs the bash command "claude -p 'run codex exec --help and report' --model sonnet"

```json
{
  "step_record_id": "step-20260904-061450-cwbu",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "claude -p 'run codex exec --help and report' --model sonnet"
  },
  "result": {
    "exit_code": 0,
    "output": {}
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061450-4tao",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:50.820Z",
  "finished_at": "2026-09-03T21:14:51.128Z",
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
  "step_record_id": "step-20260904-061451-g166",
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
  "scenario_record_id": "scn-20260904-061450-4tao",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:51.129Z",
  "finished_at": "2026-09-03T21:14:51.130Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061450-cwbu",
      "step": "run-bash"
    }
  ]
}
```

### A polling loop with sleep is stopped, also across lines (line 63)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "no-until-sleep-loop.md" contains | ok | 1 | true | 0 | 0 |
| Claude runs this bash command | ok | 314 | false | 0 | 0 |
| the command is denied and Claude reads "A background task sends a notification when it completes." | ok | 1 | false | 0 | 0 |

#### the user rule file "no-until-sleep-loop.md" contains

```json
{
  "step_record_id": "step-20260904-061451-r52r",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "no-until-sleep-loop.md",
    "content": "---\nname: no-until-sleep-loop\nenabled: true\nevent: bash\npattern: \\b(until|while)\\b[^\\n;]*(;|\\n)\\s*do\\b[\\s\\S]*\\bsleep\\b\naction: block\n---\n\nDo not write a loop that waits with sleep. A background task sends a notification when it completes."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/no-until-sleep-loop.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061451-kj2b",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:51.141Z",
  "finished_at": "2026-09-03T21:14:51.142Z",
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
      "at": "2026-09-03T21:14:51.141Z"
    }
  ]
}
```

#### Claude runs this bash command

```json
{
  "step_record_id": "step-20260904-061451-xosp",
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
  "scenario_record_id": "scn-20260904-061451-kj2b",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:51.143Z",
  "finished_at": "2026-09-03T21:14:51.457Z",
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
  "step_record_id": "step-20260904-061451-7tpn",
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
  "scenario_record_id": "scn-20260904-061451-kj2b",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:51.458Z",
  "finished_at": "2026-09-03T21:14:51.459Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061451-xosp",
      "step": "run-bash-block"
    }
  ]
}
```

### A loop without sleep passes (line 84)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "no-until-sleep-loop.md" contains | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "while read line; do echo $line; done < list.txt" | ok | 317 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |

#### the user rule file "no-until-sleep-loop.md" contains

```json
{
  "step_record_id": "step-20260904-061451-cfz2",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "no-until-sleep-loop.md",
    "content": "---\nname: no-until-sleep-loop\nenabled: true\nevent: bash\npattern: \\b(until|while)\\b[^\\n;]*(;|\\n)\\s*do\\b[\\s\\S]*\\bsleep\\b\naction: block\n---\n\nDo not write a loop that waits with sleep. A background task sends a notification when it completes."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/no-until-sleep-loop.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061451-vk6u",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:51.472Z",
  "finished_at": "2026-09-03T21:14:51.474Z",
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
      "at": "2026-09-03T21:14:51.472Z"
    }
  ]
}
```

#### Claude runs the bash command "while read line; do echo $line; done < list.txt"

```json
{
  "step_record_id": "step-20260904-061451-pfmj",
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
  "scenario_record_id": "scn-20260904-061451-vk6u",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:51.475Z",
  "finished_at": "2026-09-03T21:14:51.792Z",
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
  "step_record_id": "step-20260904-061451-o8jm",
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
  "scenario_record_id": "scn-20260904-061451-vk6u",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:51.793Z",
  "finished_at": "2026-09-03T21:14:51.794Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061451-pfmj",
      "step": "run-bash"
    }
  ]
}
```

### A heredoc that writes a loop into a file passes (line 100)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "no-until-sleep-loop.md" contains | ok | 1 | true | 0 | 0 |
| Claude runs this bash command | ok | 324 | false | 0 | 0 |
| the hook returns nothing | ok | 0 | false | 0 | 0 |

#### the user rule file "no-until-sleep-loop.md" contains

```json
{
  "step_record_id": "step-20260904-061451-ptx1",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "no-until-sleep-loop.md",
    "content": "---\nname: no-until-sleep-loop\nenabled: true\nevent: bash\npattern: \\b(until|while)\\b[^\\n;]*(;|\\n)\\s*do\\b[\\s\\S]*\\bsleep\\b\naction: block\n---\n\nDo not write a loop that waits with sleep. A background task sends a notification when it completes."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/no-until-sleep-loop.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061451-cit4",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:51.808Z",
  "finished_at": "2026-09-03T21:14:51.809Z",
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
      "at": "2026-09-03T21:14:51.808Z"
    }
  ]
}
```

#### Claude runs this bash command

```json
{
  "step_record_id": "step-20260904-061451-8bml",
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
  "scenario_record_id": "scn-20260904-061451-cit4",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:51.810Z",
  "finished_at": "2026-09-03T21:14:52.134Z",
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
  "step_record_id": "step-20260904-061452-mco7",
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
  "scenario_record_id": "scn-20260904-061451-cit4",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:52.135Z",
  "finished_at": "2026-09-03T21:14:52.135Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061451-8bml",
      "step": "run-bash-block"
    }
  ]
}
```

### Reading the rule's own file passes (line 121)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "no-until-sleep-loop.md" contains | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "cat ~/.claude/steerhook/no-until-sleep-loop.md" | ok | 326 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |

#### the user rule file "no-until-sleep-loop.md" contains

```json
{
  "step_record_id": "step-20260904-061452-py4h",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "no-until-sleep-loop.md",
    "content": "---\nname: no-until-sleep-loop\nenabled: true\nevent: bash\npattern: \\b(until|while)\\b[^\\n;]*(;|\\n)\\s*do\\b[\\s\\S]*\\bsleep\\b\naction: block\n---\n\nDo not write a loop that waits with sleep. A background task sends a notification when it completes."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/no-until-sleep-loop.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061452-nfbm",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:52.148Z",
  "finished_at": "2026-09-03T21:14:52.149Z",
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
      "at": "2026-09-03T21:14:52.148Z"
    }
  ]
}
```

#### Claude runs the bash command "cat ~/.claude/steerhook/no-until-sleep-loop.md"

```json
{
  "step_record_id": "step-20260904-061452-lwog",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "cat ~/.claude/steerhook/no-until-sleep-loop.md"
  },
  "result": {
    "exit_code": 0,
    "output": {}
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061452-nfbm",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:52.150Z",
  "finished_at": "2026-09-03T21:14:52.476Z",
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
  "step_record_id": "step-20260904-061452-tbay",
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
  "scenario_record_id": "scn-20260904-061452-nfbm",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:52.477Z",
  "finished_at": "2026-09-03T21:14:52.478Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061452-lwog",
      "step": "run-bash"
    }
  ]
}
```

### herdr send-text with --enter is stopped (line 137)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "herdr-send-text-enter.md" contains | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "herdr pane send-text w1:p1 \"hello\" --enter" | ok | 319 | false | 0 | 0 |
| the command is denied and Claude reads "Send the text first, then send the key in a second command." | ok | 1 | false | 0 | 0 |

#### the user rule file "herdr-send-text-enter.md" contains

```json
{
  "step_record_id": "step-20260904-061452-1n09",
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
  "scenario_record_id": "scn-20260904-061452-nsxi",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:52.492Z",
  "finished_at": "2026-09-03T21:14:52.493Z",
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
      "setup_ms": 0,
      "at": "2026-09-03T21:14:52.493Z"
    }
  ]
}
```

#### Claude runs the bash command "herdr pane send-text w1:p1 \"hello\" --enter"

```json
{
  "step_record_id": "step-20260904-061452-cmbx",
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
  "scenario_record_id": "scn-20260904-061452-nsxi",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:52.495Z",
  "finished_at": "2026-09-03T21:14:52.814Z",
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
  "step_record_id": "step-20260904-061452-gebm",
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
  "scenario_record_id": "scn-20260904-061452-nsxi",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:52.815Z",
  "finished_at": "2026-09-03T21:14:52.816Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061452-cmbx",
      "step": "run-bash"
    }
  ]
}
```

### herdr send-text without --enter passes (line 153)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "herdr-send-text-enter.md" contains | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "herdr pane send-text w1:p1 \"hello\"" | ok | 311 | false | 0 | 0 |
| the hook returns nothing | ok | 0 | false | 0 | 0 |

#### the user rule file "herdr-send-text-enter.md" contains

```json
{
  "step_record_id": "step-20260904-061452-j3zn",
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
  "scenario_record_id": "scn-20260904-061452-7k2c",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:52.827Z",
  "finished_at": "2026-09-03T21:14:52.828Z",
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
      "at": "2026-09-03T21:14:52.827Z"
    }
  ]
}
```

#### Claude runs the bash command "herdr pane send-text w1:p1 \"hello\""

```json
{
  "step_record_id": "step-20260904-061452-e7yc",
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
  "scenario_record_id": "scn-20260904-061452-7k2c",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:52.829Z",
  "finished_at": "2026-09-03T21:14:53.140Z",
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
  "step_record_id": "step-20260904-061453-hfqw",
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
  "scenario_record_id": "scn-20260904-061452-7k2c",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:53.142Z",
  "finished_at": "2026-09-03T21:14:53.142Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061452-e7yc",
      "step": "run-bash"
    }
  ]
}
```

### A backtick inside double quotes gets a warning (line 169)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "backtick-in-double-quotes.md" contains | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "echo \"now `date`\"" | ok | 330 | false | 0 | 0 |
| the command is allowed | ok | 1 | false | 0 | 0 |
| Claude reads the note "Write a long text to a file and pass it on stdin." | ok | 0 | false | 0 | 0 |

#### the user rule file "backtick-in-double-quotes.md" contains

```json
{
  "step_record_id": "step-20260904-061453-zmr6",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "backtick-in-double-quotes.md",
    "content": "---\nname: backtick-in-double-quotes\nenabled: true\nevent: bash\naction: warn\nconditions:\n  - field: command_expanded\n    operator: regex_match\n    pattern: (?<!\\\\)`\n---\n\nA backtick inside double quotes is a command substitution. Write a long text to a file and pass it on stdin."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/backtick-in-double-quotes.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061453-houn",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:53.155Z",
  "finished_at": "2026-09-03T21:14:53.157Z",
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
      "at": "2026-09-03T21:14:53.155Z"
    }
  ]
}
```

#### Claude runs the bash command "echo \"now `date`\""

```json
{
  "step_record_id": "step-20260904-061453-jmbf",
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
  "scenario_record_id": "scn-20260904-061453-houn",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:53.158Z",
  "finished_at": "2026-09-03T21:14:53.488Z",
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
  "step_record_id": "step-20260904-061453-xtlm",
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
  "scenario_record_id": "scn-20260904-061453-houn",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:53.489Z",
  "finished_at": "2026-09-03T21:14:53.490Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061453-jmbf",
      "step": "run-bash"
    }
  ]
}
```

#### Claude reads the note "Write a long text to a file and pass it on stdin."

```json
{
  "step_record_id": "step-20260904-061453-f7qc",
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
  "scenario_record_id": "scn-20260904-061453-houn",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:53.491Z",
  "finished_at": "2026-09-03T21:14:53.491Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061453-jmbf",
      "step": "run-bash"
    }
  ]
}
```

### An escaped backtick inside double quotes passes (line 189)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "backtick-in-double-quotes.md" contains | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "git commit -m \"Add \`x\` flag\"" | ok | 303 | false | 0 | 0 |
| the hook returns nothing | ok | 0 | false | 0 | 0 |

#### the user rule file "backtick-in-double-quotes.md" contains

```json
{
  "step_record_id": "step-20260904-061453-5wpa",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "backtick-in-double-quotes.md",
    "content": "---\nname: backtick-in-double-quotes\nenabled: true\nevent: bash\naction: warn\nconditions:\n  - field: command_expanded\n    operator: regex_match\n    pattern: (?<!\\\\)`\n---\n\nA backtick inside double quotes is a command substitution. Write a long text to a file and pass it on stdin."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/backtick-in-double-quotes.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061453-4dxb",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:53.503Z",
  "finished_at": "2026-09-03T21:14:53.504Z",
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
      "setup_ms": 0,
      "at": "2026-09-03T21:14:53.503Z"
    }
  ]
}
```

#### Claude runs the bash command "git commit -m \"Add \`x\` flag\""

```json
{
  "step_record_id": "step-20260904-061453-ka5k",
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
  "scenario_record_id": "scn-20260904-061453-4dxb",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:53.504Z",
  "finished_at": "2026-09-03T21:14:53.807Z",
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
  "step_record_id": "step-20260904-061453-wwpi",
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
  "scenario_record_id": "scn-20260904-061453-4dxb",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:53.809Z",
  "finished_at": "2026-09-03T21:14:53.809Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061453-ka5k",
      "step": "run-bash"
    }
  ]
}
```

## Declared vs observed

No step declared `mutates: false` and was measured making a write.
