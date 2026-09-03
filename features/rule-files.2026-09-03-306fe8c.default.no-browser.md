---
feature: features/rule-files.feature
commit: 306fe8c9e049895f4c1a4d65f81a8d5679c30a7a
run_id: run-20260903-215826-yk71
ran_at: 2026-09-03T21:58:34.213+09:00
accepted_at: 2026-09-03T21:58:47.399+09:00
environment: default
browser: none
scenarios:
  - name: A pattern in matching quotes loses that one pair
    line: 7
    scenario_record_id: scn-20260903-215834-c3q3
  - name: A pattern wrapped in a group keeps the quotes inside it
    line: 23
    scenario_record_id: scn-20260903-215834-e8ny
  - name: The same pattern stays quiet for a backtick outside double quotes
    line: 39
    scenario_record_id: scn-20260903-215834-1xv5
  - name: A rule with enabled false never fires
    line: 55
    scenario_record_id: scn-20260903-215835-ayid
  - name: A file without frontmatter is skipped and the hook still answers
    line: 71
    scenario_record_id: scn-20260903-215835-v9xb
  - name: A rule with conditions fires when every condition matches
    line: 84
    scenario_record_id: scn-20260903-215835-4ky7
  - name: A rule with conditions stays quiet when one condition fails
    line: 106
    scenario_record_id: scn-20260903-215835-fvqc
  - name: A rule for all events fires on a bash command through a condition
    line: 128
    scenario_record_id: scn-20260903-215836-t1dw
  - name: A condition can be written on one line with commas
    line: 147
    scenario_record_id: scn-20260903-215836-m7de
---

# Reading rule files: green at 306fe8c

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
    Given the user rule file "backtick.md" contains
      """
      ---
      name: backtick-in-double-quotes
      enabled: true
      event: bash
      pattern: (?:"[^"\n]*`[^"\n]*")
      action: warn
      ---

      A backtick inside double quotes is a command substitution.
      """
    When Claude runs the bash command "echo \"today is `date`\""
    Then Claude reads the note "A backtick inside double quotes is a command substitution."

  Scenario: The same pattern stays quiet for a backtick outside double quotes
    Given the user rule file "backtick.md" contains
      """
      ---
      name: backtick-in-double-quotes
      enabled: true
      event: bash
      pattern: (?:"[^"\n]*`[^"\n]*")
      action: warn
      ---

      A backtick inside double quotes is a command substitution.
      """
    When Claude runs the bash command "echo 'no `dq` here'"
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
| the user rule file "quoted.md" contains | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 263 | false | 0 | 0 |
| the command is denied and Claude reads "Quoted pattern matched." | ok | 1 | false | 0 | 0 |

#### the user rule file "quoted.md" contains

```json
{
  "step_record_id": "step-20260903-215834-cnb5",
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
  "scenario_record_id": "scn-20260903-215834-c3q3",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:34.213Z",
  "finished_at": "2026-09-03T12:58:34.214Z",
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
      "at": "2026-09-03T12:58:34.213Z"
    }
  ]
}
```

#### Claude runs the bash command "foo"

```json
{
  "step_record_id": "step-20260903-215834-t4ze",
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
  "scenario_record_id": "scn-20260903-215834-c3q3",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:34.215Z",
  "finished_at": "2026-09-03T12:58:34.478Z",
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
  "step_record_id": "step-20260903-215834-z6nx",
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
  "scenario_record_id": "scn-20260903-215834-c3q3",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:34.479Z",
  "finished_at": "2026-09-03T12:58:34.480Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215834-t4ze",
      "step": "run-bash"
    }
  ]
}
```

### A pattern wrapped in a group keeps the quotes inside it (line 23)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "backtick.md" contains | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "echo \"today is `date`\"" | ok | 269 | false | 0 | 0 |
| Claude reads the note "A backtick inside double quotes is a command substitution." | ok | 1 | false | 0 | 0 |

#### the user rule file "backtick.md" contains

```json
{
  "step_record_id": "step-20260903-215834-n0s7",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "backtick.md",
    "content": "---\nname: backtick-in-double-quotes\nenabled: true\nevent: bash\npattern: (?:\"[^\"\\n]*`[^\"\\n]*\")\naction: warn\n---\n\nA backtick inside double quotes is a command substitution."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/backtick.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215834-e8ny",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:34.491Z",
  "finished_at": "2026-09-03T12:58:34.492Z",
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
      "at": "2026-09-03T12:58:34.491Z"
    }
  ]
}
```

#### Claude runs the bash command "echo \"today is `date`\""

```json
{
  "step_record_id": "step-20260903-215834-6yam",
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
        "additionalContext": "**[backtick-in-double-quotes]**\nA backtick inside double quotes is a command substitution."
      },
      "systemMessage": "**[backtick-in-double-quotes]**\nA backtick inside double quotes is a command substitution."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215834-e8ny",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:34.493Z",
  "finished_at": "2026-09-03T12:58:34.762Z",
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

#### Claude reads the note "A backtick inside double quotes is a command substitution."

```json
{
  "step_record_id": "step-20260903-215834-jfxu",
  "step": "claude-reads-note",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[backtick-in-double-quotes]**\nA backtick inside double quotes is a command substitution."
      },
      "systemMessage": "**[backtick-in-double-quotes]**\nA backtick inside double quotes is a command substitution."
    },
    "text": "A backtick inside double quotes is a command substitution."
  },
  "result": {
    "context": "**[backtick-in-double-quotes]**\nA backtick inside double quotes is a command substitution."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215834-e8ny",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:34.763Z",
  "finished_at": "2026-09-03T12:58:34.764Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215834-6yam",
      "step": "run-bash"
    }
  ]
}
```

### The same pattern stays quiet for a backtick outside double quotes (line 39)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "backtick.md" contains | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "echo 'no `dq` here'" | ok | 264 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |

#### the user rule file "backtick.md" contains

```json
{
  "step_record_id": "step-20260903-215834-q6ov",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "backtick.md",
    "content": "---\nname: backtick-in-double-quotes\nenabled: true\nevent: bash\npattern: (?:\"[^\"\\n]*`[^\"\\n]*\")\naction: warn\n---\n\nA backtick inside double quotes is a command substitution."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/backtick.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215834-1xv5",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:34.773Z",
  "finished_at": "2026-09-03T12:58:34.774Z",
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
      "at": "2026-09-03T12:58:34.773Z"
    }
  ]
}
```

#### Claude runs the bash command "echo 'no `dq` here'"

```json
{
  "step_record_id": "step-20260903-215834-u6ag",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "echo 'no `dq` here'"
  },
  "result": {
    "exit_code": 0,
    "output": {}
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215834-1xv5",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:34.775Z",
  "finished_at": "2026-09-03T12:58:35.039Z",
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
  "step_record_id": "step-20260903-215835-u7o5",
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
  "scenario_record_id": "scn-20260903-215834-1xv5",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:35.040Z",
  "finished_at": "2026-09-03T12:58:35.041Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215834-u6ag",
      "step": "run-bash"
    }
  ]
}
```

### A rule with enabled false never fires (line 55)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "off.md" contains | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 264 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |

#### the user rule file "off.md" contains

```json
{
  "step_record_id": "step-20260903-215835-9guj",
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
  "scenario_record_id": "scn-20260903-215835-ayid",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:35.053Z",
  "finished_at": "2026-09-03T12:58:35.054Z",
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
      "at": "2026-09-03T12:58:35.053Z"
    }
  ]
}
```

#### Claude runs the bash command "foo"

```json
{
  "step_record_id": "step-20260903-215835-bn0g",
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
  "scenario_record_id": "scn-20260903-215835-ayid",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:35.055Z",
  "finished_at": "2026-09-03T12:58:35.319Z",
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
  "step_record_id": "step-20260903-215835-f9pw",
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
  "scenario_record_id": "scn-20260903-215835-ayid",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:35.319Z",
  "finished_at": "2026-09-03T12:58:35.320Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215835-bn0g",
      "step": "run-bash"
    }
  ]
}
```

### A file without frontmatter is skipped and the hook still answers (line 71)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "notes.md" contains | ok | 2 | true | 0 | 0 |
| the user rule "no-foo" blocks bash commands that match "foo" | ok | 0 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 278 | false | 0 | 0 |
| the command is denied and Claude reads "Use bar instead of foo." | ok | 1 | false | 0 | 0 |
| the hook exits with status 0 | ok | 0 | false | 0 | 0 |

#### the user rule file "notes.md" contains

```json
{
  "step_record_id": "step-20260903-215835-ndpv",
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
  "scenario_record_id": "scn-20260903-215835-v9xb",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:35.329Z",
  "finished_at": "2026-09-03T12:58:35.331Z",
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
      "at": "2026-09-03T12:58:35.330Z"
    }
  ]
}
```

#### the user rule "no-foo" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260903-215835-tsrr",
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
  "scenario_record_id": "scn-20260903-215835-v9xb",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:35.332Z",
  "finished_at": "2026-09-03T12:58:35.332Z",
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
  "step_record_id": "step-20260903-215835-mzdb",
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
  "scenario_record_id": "scn-20260903-215835-v9xb",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:35.333Z",
  "finished_at": "2026-09-03T12:58:35.611Z",
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
  "step_record_id": "step-20260903-215835-xtlo",
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
  "scenario_record_id": "scn-20260903-215835-v9xb",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:35.612Z",
  "finished_at": "2026-09-03T12:58:35.613Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215835-mzdb",
      "step": "run-bash"
    }
  ]
}
```

#### the hook exits with status 0

```json
{
  "step_record_id": "step-20260903-215835-94aa",
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
  "scenario_record_id": "scn-20260903-215835-v9xb",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:35.614Z",
  "finished_at": "2026-09-03T12:58:35.614Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215835-mzdb",
      "step": "run-bash"
    }
  ]
}
```

### A rule with conditions fires when every condition matches (line 84)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "env-edit.md" contains | ok | 1 | true | 0 | 0 |
| Claude edits the file ".env" to add "API_KEY=1" | ok | 264 | false | 0 | 0 |
| Claude reads the note "Keep secrets out of .env edits." | ok | 1 | false | 0 | 0 |

#### the user rule file "env-edit.md" contains

```json
{
  "step_record_id": "step-20260903-215835-l24j",
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
  "scenario_record_id": "scn-20260903-215835-4ky7",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:35.625Z",
  "finished_at": "2026-09-03T12:58:35.626Z",
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
      "at": "2026-09-03T12:58:35.625Z"
    }
  ]
}
```

#### Claude edits the file ".env" to add "API_KEY=1"

```json
{
  "step_record_id": "step-20260903-215835-hg4t",
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
  "scenario_record_id": "scn-20260903-215835-4ky7",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:35.627Z",
  "finished_at": "2026-09-03T12:58:35.891Z",
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
  "step_record_id": "step-20260903-215835-sexv",
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
  "scenario_record_id": "scn-20260903-215835-4ky7",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:35.892Z",
  "finished_at": "2026-09-03T12:58:35.893Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215835-hg4t",
      "step": "edit-file"
    }
  ]
}
```

### A rule with conditions stays quiet when one condition fails (line 106)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "env-edit.md" contains | ok | 1 | true | 0 | 0 |
| Claude edits the file "README.md" to add "API_KEY=1" | ok | 264 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |

#### the user rule file "env-edit.md" contains

```json
{
  "step_record_id": "step-20260903-215835-s8ev",
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
  "scenario_record_id": "scn-20260903-215835-fvqc",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:35.904Z",
  "finished_at": "2026-09-03T12:58:35.905Z",
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
      "at": "2026-09-03T12:58:35.904Z"
    }
  ]
}
```

#### Claude edits the file "README.md" to add "API_KEY=1"

```json
{
  "step_record_id": "step-20260903-215835-9nxz",
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
  "scenario_record_id": "scn-20260903-215835-fvqc",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:35.905Z",
  "finished_at": "2026-09-03T12:58:36.169Z",
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
  "step_record_id": "step-20260903-215836-7z8s",
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
  "scenario_record_id": "scn-20260903-215835-fvqc",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:36.170Z",
  "finished_at": "2026-09-03T12:58:36.171Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215835-9nxz",
      "step": "edit-file"
    }
  ]
}
```

### A rule for all events fires on a bash command through a condition (line 128)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "everywhere.md" contains | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "sudo ls" | ok | 275 | false | 0 | 0 |
| Claude reads the note "Think before sudo." | ok | 0 | false | 0 | 0 |

#### the user rule file "everywhere.md" contains

```json
{
  "step_record_id": "step-20260903-215836-nbvj",
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
  "scenario_record_id": "scn-20260903-215836-t1dw",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:36.182Z",
  "finished_at": "2026-09-03T12:58:36.184Z",
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
      "at": "2026-09-03T12:58:36.182Z"
    }
  ]
}
```

#### Claude runs the bash command "sudo ls"

```json
{
  "step_record_id": "step-20260903-215836-425j",
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
  "scenario_record_id": "scn-20260903-215836-t1dw",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:36.185Z",
  "finished_at": "2026-09-03T12:58:36.460Z",
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
  "step_record_id": "step-20260903-215836-k2h7",
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
  "scenario_record_id": "scn-20260903-215836-t1dw",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:36.461Z",
  "finished_at": "2026-09-03T12:58:36.461Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215836-425j",
      "step": "run-bash"
    }
  ]
}
```

### A condition can be written on one line with commas (line 147)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "inline.md" contains | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "sudo ls" | ok | 266 | false | 0 | 0 |
| Claude reads the note "Think before sudo." | ok | 1 | false | 0 | 0 |

#### the user rule file "inline.md" contains

```json
{
  "step_record_id": "step-20260903-215836-z1r7",
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
  "scenario_record_id": "scn-20260903-215836-m7de",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:36.475Z",
  "finished_at": "2026-09-03T12:58:36.476Z",
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
      "at": "2026-09-03T12:58:36.475Z"
    }
  ]
}
```

#### Claude runs the bash command "sudo ls"

```json
{
  "step_record_id": "step-20260903-215836-bopv",
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
  "scenario_record_id": "scn-20260903-215836-m7de",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:36.477Z",
  "finished_at": "2026-09-03T12:58:36.743Z",
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
  "step_record_id": "step-20260903-215836-42ui",
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
  "scenario_record_id": "scn-20260903-215836-m7de",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:36.744Z",
  "finished_at": "2026-09-03T12:58:36.745Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215836-bopv",
      "step": "run-bash"
    }
  ]
}
```

## Declared vs observed

No step declared `mutates: false` and was measured making a write.
