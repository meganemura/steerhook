---
feature: features/rule-files.feature
commit: 8ab83d6aa493d65a233c00951258136e7ae81851
run_id: run-20260904-061445-tm20
ran_at: 2026-09-04T06:14:59.061+09:00
accepted_at: 2026-09-04T06:15:10.612+09:00
environment: default
browser: none
scenarios:
  - name: A pattern in matching quotes loses that one pair
    line: 7
    scenario_record_id: scn-20260904-061459-rt6u
  - name: A pattern wrapped in a group keeps the quotes inside it
    line: 23
    scenario_record_id: scn-20260904-061459-3gr9
  - name: The same pattern stays quiet when the argument is in single quotes
    line: 39
    scenario_record_id: scn-20260904-061459-3ljy
  - name: A rule with enabled false never fires
    line: 55
    scenario_record_id: scn-20260904-061500-0gwd
  - name: A file without frontmatter is skipped and the hook still answers
    line: 71
    scenario_record_id: scn-20260904-061500-yilz
  - name: A rule with conditions fires when every condition matches
    line: 84
    scenario_record_id: scn-20260904-061500-vpgo
  - name: A rule with conditions stays quiet when one condition fails
    line: 106
    scenario_record_id: scn-20260904-061501-t3wl
  - name: A rule for all events fires on a bash command through a condition
    line: 128
    scenario_record_id: scn-20260904-061501-j595
  - name: A condition can be written on one line with commas
    line: 147
    scenario_record_id: scn-20260904-061501-20ol
---

# Reading rule files: green at 8ab83d6

## Condition

- environment: default
- browser: not launched (no step in this run destructured page/context)

## The scenario as it ran

```gherkin
Feature: Reading rule files

  A rule is one markdown file: frontmatter between two --- lines, then the
  message. steerhook parses the frontmatter itself, without a YAML library, so
  these scenarios pin what that parser accepts.

  Scenario: A pattern in matching quotes loses that one pair
    Given the user rule file "quoted.md" contains
      """
      ---
      name: quoted
      enabled: true
      event: bash
      pattern: "\bfoo\b"
      action: block
      ---

      Quoted pattern matched.
      """
    When Claude runs the bash command "foo"
    Then the command is denied and Claude reads "Quoted pattern matched."

  Scenario: A pattern wrapped in a group keeps the quotes inside it
    Given the user rule file "double-quoted.md" contains
      """
      ---
      name: double-quoted-argument
      enabled: true
      event: bash
      pattern: (?:"[^"\n]*")
      action: warn
      ---

      This command carries a double-quoted argument.
      """
    When Claude runs the bash command "echo \"today is Monday\""
    Then Claude reads the note "This command carries a double-quoted argument."

  Scenario: The same pattern stays quiet when the argument is in single quotes
    Given the user rule file "double-quoted.md" contains
      """
      ---
      name: double-quoted-argument
      enabled: true
      event: bash
      pattern: (?:"[^"\n]*")
      action: warn
      ---

      This command carries a double-quoted argument.
      """
    When Claude runs the bash command "echo 'today is Monday'"
    Then the hook returns nothing

  Scenario: A rule with enabled false never fires
    Given the user rule file "off.md" contains
      """
      ---
      name: off
      enabled: false
      event: bash
      pattern: foo
      action: block
      ---

      Never.
      """
    When Claude runs the bash command "foo"
    Then the hook returns nothing

  Scenario: A file without frontmatter is skipped and the hook still answers
    Given the user rule file "notes.md" contains
      """
      Just some notes. No frontmatter.
      """
    And the user rule "no-foo" blocks bash commands that match "foo"
      """
      Use bar instead of foo.
      """
    When Claude runs the bash command "foo"
    Then the command is denied and Claude reads "Use bar instead of foo."
    And the hook exits with status 0

  Scenario: A rule with conditions fires when every condition matches
    Given the user rule file "env-edit.md" contains
      """
      ---
      name: env-edit
      enabled: true
      event: file
      action: warn
      conditions:
        - field: file_path
          operator: regex_match
          pattern: \.env$
        - field: new_text
          operator: contains
          pattern: KEY
      ---

      Keep secrets out of .env edits.
      """
    When Claude edits the file ".env" to add "API_KEY=1"
    Then Claude reads the note "Keep secrets out of .env edits."

  Scenario: A rule with conditions stays quiet when one condition fails
    Given the user rule file "env-edit.md" contains
      """
      ---
      name: env-edit
      enabled: true
      event: file
      action: warn
      conditions:
        - field: file_path
          operator: regex_match
          pattern: \.env$
        - field: new_text
          operator: contains
          pattern: KEY
      ---

      Keep secrets out of .env edits.
      """
    When Claude edits the file "README.md" to add "API_KEY=1"
    Then the hook returns nothing

  Scenario: A rule for all events fires on a bash command through a condition
    Given the user rule file "everywhere.md" contains
      """
      ---
      name: everywhere
      enabled: true
      event: all
      action: warn
      conditions:
        - field: command
          operator: contains
          pattern: sudo
      ---

      Think before sudo.
      """
    When Claude runs the bash command "sudo ls"
    Then Claude reads the note "Think before sudo."

  Scenario: A condition can be written on one line with commas
    Given the user rule file "inline.md" contains
      """
      ---
      name: inline
      enabled: true
      event: bash
      action: warn
      conditions:
        - field: command, operator: contains, pattern: sudo
      ---

      Think before sudo.
      """
    When Claude runs the bash command "sudo ls"
    Then Claude reads the note "Think before sudo."
```

## What the tool measured

Evidence fields are stripped from every record below: evidence. They stay under the state directory with the trace and the screenshots, and are not committed.

### A pattern in matching quotes loses that one pair (line 7)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "quoted.md" contains | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 338 | false | 0 | 0 |
| the command is denied and Claude reads "Quoted pattern matched." | ok | 1 | false | 0 | 0 |

#### the user rule file "quoted.md" contains

```json
{
  "step_record_id": "step-20260904-061459-2s5t",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "quoted.md",
    "content": "---\nname: quoted\nenabled: true\nevent: bash\npattern: \"\\bfoo\\b\"\naction: block\n---\n\nQuoted pattern matched."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/quoted.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061459-rt6u",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:59.061Z",
  "finished_at": "2026-09-03T21:14:59.063Z",
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
      "at": "2026-09-03T21:14:59.062Z"
    }
  ]
}
```

#### Claude runs the bash command "foo"

```json
{
  "step_record_id": "step-20260904-061459-2lvy",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "foo"
  },
  "result": {
    "exit_code": 0,
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "**[quoted]**\nQuoted pattern matched."
      },
      "systemMessage": "**[quoted]**\nQuoted pattern matched."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061459-rt6u",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:59.064Z",
  "finished_at": "2026-09-03T21:14:59.402Z",
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

#### the command is denied and Claude reads "Quoted pattern matched."

```json
{
  "step_record_id": "step-20260904-061459-yb07",
  "step": "denied-with-reason",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "**[quoted]**\nQuoted pattern matched."
      },
      "systemMessage": "**[quoted]**\nQuoted pattern matched."
    },
    "text": "Quoted pattern matched."
  },
  "result": {
    "decision": "deny",
    "reason": "**[quoted]**\nQuoted pattern matched."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061459-rt6u",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:59.403Z",
  "finished_at": "2026-09-03T21:14:59.404Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061459-2lvy",
      "step": "run-bash"
    }
  ]
}
```

### A pattern wrapped in a group keeps the quotes inside it (line 23)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "double-quoted.md" contains | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "echo \"today is Monday\"" | ok | 321 | false | 0 | 0 |
| Claude reads the note "This command carries a double-quoted argument." | ok | 0 | false | 0 | 0 |

#### the user rule file "double-quoted.md" contains

```json
{
  "step_record_id": "step-20260904-061459-xqlt",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "double-quoted.md",
    "content": "---\nname: double-quoted-argument\nenabled: true\nevent: bash\npattern: (?:\"[^\"\\n]*\")\naction: warn\n---\n\nThis command carries a double-quoted argument."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/double-quoted.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061459-3gr9",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:59.418Z",
  "finished_at": "2026-09-03T21:14:59.420Z",
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
      "at": "2026-09-03T21:14:59.418Z"
    }
  ]
}
```

#### Claude runs the bash command "echo \"today is Monday\""

```json
{
  "step_record_id": "step-20260904-061459-27k2",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "echo \"today is Monday\""
  },
  "result": {
    "exit_code": 0,
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[double-quoted-argument]**\nThis command carries a double-quoted argument."
      },
      "systemMessage": "**[double-quoted-argument]**\nThis command carries a double-quoted argument."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061459-3gr9",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:59.421Z",
  "finished_at": "2026-09-03T21:14:59.742Z",
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

#### Claude reads the note "This command carries a double-quoted argument."

```json
{
  "step_record_id": "step-20260904-061459-tkwb",
  "step": "claude-reads-note",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[double-quoted-argument]**\nThis command carries a double-quoted argument."
      },
      "systemMessage": "**[double-quoted-argument]**\nThis command carries a double-quoted argument."
    },
    "text": "This command carries a double-quoted argument."
  },
  "result": {
    "context": "**[double-quoted-argument]**\nThis command carries a double-quoted argument."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061459-3gr9",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:59.743Z",
  "finished_at": "2026-09-03T21:14:59.743Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061459-27k2",
      "step": "run-bash"
    }
  ]
}
```

### The same pattern stays quiet when the argument is in single quotes (line 39)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "double-quoted.md" contains | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "echo 'today is Monday'" | ok | 331 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |

#### the user rule file "double-quoted.md" contains

```json
{
  "step_record_id": "step-20260904-061459-mwch",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "double-quoted.md",
    "content": "---\nname: double-quoted-argument\nenabled: true\nevent: bash\npattern: (?:\"[^\"\\n]*\")\naction: warn\n---\n\nThis command carries a double-quoted argument."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/double-quoted.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061459-3ljy",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:59.754Z",
  "finished_at": "2026-09-03T21:14:59.755Z",
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
      "at": "2026-09-03T21:14:59.754Z"
    }
  ]
}
```

#### Claude runs the bash command "echo 'today is Monday'"

```json
{
  "step_record_id": "step-20260904-061459-hgpc",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "echo 'today is Monday'"
  },
  "result": {
    "exit_code": 0,
    "output": {}
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061459-3ljy",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:59.756Z",
  "finished_at": "2026-09-03T21:15:00.087Z",
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
  "step_record_id": "step-20260904-061500-6bq3",
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
  "scenario_record_id": "scn-20260904-061459-3ljy",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:00.088Z",
  "finished_at": "2026-09-03T21:15:00.089Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061459-hgpc",
      "step": "run-bash"
    }
  ]
}
```

### A rule with enabled false never fires (line 55)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "off.md" contains | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 324 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |

#### the user rule file "off.md" contains

```json
{
  "step_record_id": "step-20260904-061500-lulg",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "off.md",
    "content": "---\nname: off\nenabled: false\nevent: bash\npattern: foo\naction: block\n---\n\nNever."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/off.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061500-0gwd",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:00.101Z",
  "finished_at": "2026-09-03T21:15:00.102Z",
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
      "at": "2026-09-03T21:15:00.101Z"
    }
  ]
}
```

#### Claude runs the bash command "foo"

```json
{
  "step_record_id": "step-20260904-061500-s2gh",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "foo"
  },
  "result": {
    "exit_code": 0,
    "output": {}
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061500-0gwd",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:00.103Z",
  "finished_at": "2026-09-03T21:15:00.427Z",
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
  "step_record_id": "step-20260904-061500-2wrm",
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
  "scenario_record_id": "scn-20260904-061500-0gwd",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:00.429Z",
  "finished_at": "2026-09-03T21:15:00.430Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061500-s2gh",
      "step": "run-bash"
    }
  ]
}
```

### A file without frontmatter is skipped and the hook still answers (line 71)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "notes.md" contains | ok | 1 | true | 0 | 0 |
| the user rule "no-foo" blocks bash commands that match "foo" | ok | 0 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 340 | false | 0 | 0 |
| the command is denied and Claude reads "Use bar instead of foo." | ok | 1 | false | 0 | 0 |
| the hook exits with status 0 | ok | 1 | false | 0 | 0 |

#### the user rule file "notes.md" contains

```json
{
  "step_record_id": "step-20260904-061500-svb4",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "notes.md",
    "content": "Just some notes. No frontmatter."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/notes.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061500-yilz",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:00.444Z",
  "finished_at": "2026-09-03T21:15:00.445Z",
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
      "at": "2026-09-03T21:15:00.444Z"
    }
  ]
}
```

#### the user rule "no-foo" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260904-061500-njwa",
  "step": "user-bash-rule",
  "kind": "run",
  "args": {
    "name": "no-foo",
    "verb": "blocks",
    "pattern": "foo",
    "message": "Use bar instead of foo."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/no-foo.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061500-yilz",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:00.447Z",
  "finished_at": "2026-09-03T21:15:00.447Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": true,
  "fixtures": [
    {
      "name": "sandbox",
      "scope": "scenario",
      "reused": true
    }
  ]
}
```

#### Claude runs the bash command "foo"

```json
{
  "step_record_id": "step-20260904-061500-lucy",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "foo"
  },
  "result": {
    "exit_code": 0,
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "**[no-foo]**\nUse bar instead of foo."
      },
      "systemMessage": "**[no-foo]**\nUse bar instead of foo."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061500-yilz",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:00.448Z",
  "finished_at": "2026-09-03T21:15:00.788Z",
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

#### the command is denied and Claude reads "Use bar instead of foo."

```json
{
  "step_record_id": "step-20260904-061500-cnes",
  "step": "denied-with-reason",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "**[no-foo]**\nUse bar instead of foo."
      },
      "systemMessage": "**[no-foo]**\nUse bar instead of foo."
    },
    "text": "Use bar instead of foo."
  },
  "result": {
    "decision": "deny",
    "reason": "**[no-foo]**\nUse bar instead of foo."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061500-yilz",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:00.789Z",
  "finished_at": "2026-09-03T21:15:00.790Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061500-lucy",
      "step": "run-bash"
    }
  ]
}
```

#### the hook exits with status 0

```json
{
  "step_record_id": "step-20260904-061500-l0jh",
  "step": "hook-exits-with-status",
  "kind": "run",
  "args": {
    "exit_code": 0,
    "code": 0
  },
  "result": {
    "exit_code": 0
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061500-yilz",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:00.791Z",
  "finished_at": "2026-09-03T21:15:00.792Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061500-lucy",
      "step": "run-bash"
    }
  ]
}
```

### A rule with conditions fires when every condition matches (line 84)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "env-edit.md" contains | ok | 2 | true | 0 | 0 |
| Claude edits the file ".env" to add "API_KEY=1" | ok | 345 | false | 0 | 0 |
| Claude reads the note "Keep secrets out of .env edits." | ok | 1 | false | 0 | 0 |

#### the user rule file "env-edit.md" contains

```json
{
  "step_record_id": "step-20260904-061500-b6yb",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "env-edit.md",
    "content": "---\nname: env-edit\nenabled: true\nevent: file\naction: warn\nconditions:\n  - field: file_path\n    operator: regex_match\n    pattern: \\.env$\n  - field: new_text\n    operator: contains\n    pattern: KEY\n---\n\nKeep secrets out of .env edits."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/env-edit.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061500-vpgo",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:00.807Z",
  "finished_at": "2026-09-03T21:15:00.809Z",
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
      "at": "2026-09-03T21:15:00.807Z"
    }
  ]
}
```

#### Claude edits the file ".env" to add "API_KEY=1"

```json
{
  "step_record_id": "step-20260904-061500-bgfh",
  "step": "edit-file",
  "kind": "run",
  "args": {
    "path": ".env",
    "text": "API_KEY=1"
  },
  "result": {
    "exit_code": 0,
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[env-edit]**\nKeep secrets out of .env edits."
      },
      "systemMessage": "**[env-edit]**\nKeep secrets out of .env edits."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061500-vpgo",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:00.810Z",
  "finished_at": "2026-09-03T21:15:01.155Z",
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

#### Claude reads the note "Keep secrets out of .env edits."

```json
{
  "step_record_id": "step-20260904-061501-lv0l",
  "step": "claude-reads-note",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[env-edit]**\nKeep secrets out of .env edits."
      },
      "systemMessage": "**[env-edit]**\nKeep secrets out of .env edits."
    },
    "text": "Keep secrets out of .env edits."
  },
  "result": {
    "context": "**[env-edit]**\nKeep secrets out of .env edits."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061500-vpgo",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:01.156Z",
  "finished_at": "2026-09-03T21:15:01.157Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061500-bgfh",
      "step": "edit-file"
    }
  ]
}
```

### A rule with conditions stays quiet when one condition fails (line 106)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "env-edit.md" contains | ok | 1 | true | 0 | 0 |
| Claude edits the file "README.md" to add "API_KEY=1" | ok | 366 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |

#### the user rule file "env-edit.md" contains

```json
{
  "step_record_id": "step-20260904-061501-qacc",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "env-edit.md",
    "content": "---\nname: env-edit\nenabled: true\nevent: file\naction: warn\nconditions:\n  - field: file_path\n    operator: regex_match\n    pattern: \\.env$\n  - field: new_text\n    operator: contains\n    pattern: KEY\n---\n\nKeep secrets out of .env edits."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/env-edit.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061501-t3wl",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:01.170Z",
  "finished_at": "2026-09-03T21:15:01.171Z",
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
      "at": "2026-09-03T21:15:01.170Z"
    }
  ]
}
```

#### Claude edits the file "README.md" to add "API_KEY=1"

```json
{
  "step_record_id": "step-20260904-061501-nqo4",
  "step": "edit-file",
  "kind": "run",
  "args": {
    "path": "README.md",
    "text": "API_KEY=1"
  },
  "result": {
    "exit_code": 0,
    "output": {}
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061501-t3wl",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:01.173Z",
  "finished_at": "2026-09-03T21:15:01.539Z",
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
  "step_record_id": "step-20260904-061501-2nfq",
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
  "scenario_record_id": "scn-20260904-061501-t3wl",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:01.541Z",
  "finished_at": "2026-09-03T21:15:01.542Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061501-nqo4",
      "step": "edit-file"
    }
  ]
}
```

### A rule for all events fires on a bash command through a condition (line 128)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "everywhere.md" contains | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "sudo ls" | ok | 369 | false | 0 | 0 |
| Claude reads the note "Think before sudo." | ok | 1 | false | 0 | 0 |

#### the user rule file "everywhere.md" contains

```json
{
  "step_record_id": "step-20260904-061501-1cg8",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "everywhere.md",
    "content": "---\nname: everywhere\nenabled: true\nevent: all\naction: warn\nconditions:\n  - field: command\n    operator: contains\n    pattern: sudo\n---\n\nThink before sudo."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/everywhere.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061501-j595",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:01.556Z",
  "finished_at": "2026-09-03T21:15:01.557Z",
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
      "at": "2026-09-03T21:15:01.556Z"
    }
  ]
}
```

#### Claude runs the bash command "sudo ls"

```json
{
  "step_record_id": "step-20260904-061501-ypzx",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "sudo ls"
  },
  "result": {
    "exit_code": 0,
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[everywhere]**\nThink before sudo."
      },
      "systemMessage": "**[everywhere]**\nThink before sudo."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061501-j595",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:01.558Z",
  "finished_at": "2026-09-03T21:15:01.927Z",
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

#### Claude reads the note "Think before sudo."

```json
{
  "step_record_id": "step-20260904-061501-yod7",
  "step": "claude-reads-note",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[everywhere]**\nThink before sudo."
      },
      "systemMessage": "**[everywhere]**\nThink before sudo."
    },
    "text": "Think before sudo."
  },
  "result": {
    "context": "**[everywhere]**\nThink before sudo."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061501-j595",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:01.929Z",
  "finished_at": "2026-09-03T21:15:01.930Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061501-ypzx",
      "step": "run-bash"
    }
  ]
}
```

### A condition can be written on one line with commas (line 147)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "inline.md" contains | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "sudo ls" | ok | 358 | false | 0 | 0 |
| Claude reads the note "Think before sudo." | ok | 1 | false | 0 | 0 |

#### the user rule file "inline.md" contains

```json
{
  "step_record_id": "step-20260904-061501-zi0m",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "inline.md",
    "content": "---\nname: inline\nenabled: true\nevent: bash\naction: warn\nconditions:\n  - field: command, operator: contains, pattern: sudo\n---\n\nThink before sudo."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/inline.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061501-20ol",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:01.945Z",
  "finished_at": "2026-09-03T21:15:01.947Z",
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
      "at": "2026-09-03T21:15:01.946Z"
    }
  ]
}
```

#### Claude runs the bash command "sudo ls"

```json
{
  "step_record_id": "step-20260904-061501-mhgw",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "sudo ls"
  },
  "result": {
    "exit_code": 0,
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[inline]**\nThink before sudo."
      },
      "systemMessage": "**[inline]**\nThink before sudo."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061501-20ol",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:01.949Z",
  "finished_at": "2026-09-03T21:15:02.307Z",
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

#### Claude reads the note "Think before sudo."

```json
{
  "step_record_id": "step-20260904-061502-8z5d",
  "step": "claude-reads-note",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[inline]**\nThink before sudo."
      },
      "systemMessage": "**[inline]**\nThink before sudo."
    },
    "text": "Think before sudo."
  },
  "result": {
    "context": "**[inline]**\nThink before sudo."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061501-20ol",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:02.309Z",
  "finished_at": "2026-09-03T21:15:02.310Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061501-mhgw",
      "step": "run-bash"
    }
  ]
}
```

## Declared vs observed

No step declared `mutates: false` and was measured making a write.
