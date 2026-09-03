---
feature: features/pretooluse.feature
commit: 8ab83d6aa493d65a233c00951258136e7ae81851
run_id: run-20260904-061445-tm20
ran_at: 2026-09-04T06:14:53.821+09:00
accepted_at: 2026-09-04T06:15:12.810+09:00
environment: default
browser: none
scenarios:
  - name: A blocking user rule denies the call and Claude reads the message
    line: 16
    scenario_record_id: scn-20260904-061453-1yhh
  - name: A warning user rule lets the call through and Claude reads a note
    line: 25
    scenario_record_id: scn-20260904-061454-0c9k
  - name: A command that no rule matches passes through untouched
    line: 35
    scenario_record_id: scn-20260904-061454-7kg0
  - name: With no rule directory at all the hook still answers
    line: 43
    scenario_record_id: scn-20260904-061454-a1kr
  - name: The reason names the rule above its message
    line: 48
    scenario_record_id: scn-20260904-061455-dsoo
  - name: Two blocking rules that both match are combined in file-name order
    line: 60
    scenario_record_id: scn-20260904-061455-2eia
  - name: Matching ignores letter case
    line: 79
    scenario_record_id: scn-20260904-061455-h8kv
  - name: A project rule is never read
    line: 87
    scenario_record_id: scn-20260904-061456-6q2m
  - name: A user rule fires even when a project rule also matches
    line: 95
    scenario_record_id: scn-20260904-061456-4p3p
  - name: A project rule with the same name does not replace the user rule
    line: 111
    scenario_record_id: scn-20260904-061457-g9vl
  - name: A disabled project rule does not switch off the user rule
    line: 124
    scenario_record_id: scn-20260904-061457-eamo
  - name: The rules directory can be moved with STEERHOOK_RULES_DIR
    line: 133
    scenario_record_id: scn-20260904-061457-hf8s
  - name: A bash rule does not look at file edits
    line: 142
    scenario_record_id: scn-20260904-061458-qsub
  - name: A file rule warns about an edit
    line: 150
    scenario_record_id: scn-20260904-061458-kbg3
  - name: A command that spans lines is matched as one text
    line: 159
    scenario_record_id: scn-20260904-061458-pmvs
---

# Rules checked before a tool runs: green at 8ab83d6

## Condition

- environment: default
- browser: not launched (no step in this run destructured page/context)

## The scenario as it ran

```gherkin
Feature: Rules checked before a tool runs

  steerhook reads only the user's rules, from ~/.claude/steerhook/ (or the
  directory STEERHOOK_RULES_DIR names). Before Claude runs a tool, the
  PreToolUse hook matches the call against them and answers with JSON.

  A project's own .claude/steerhook/ is never read. Opening a project is not
  the same as trusting it, and a rule file there could replace or switch off
  a user's rule by name with no confirmation. The scenarios below write a
  project rule file and show it has no effect.

  In every scenario the hook process runs in a directory that holds no rules.
  The project is named only by the cwd field of the hook input, the way
  Claude Code passes it.

  Scenario: A blocking user rule denies the call and Claude reads the message
    Given the user rule "no-foo" blocks bash commands that match "\bfoo\b"
      """
      Use bar instead of foo.
      """
    When Claude runs the bash command "foo --help"
    Then the command is denied and Claude reads "Use bar instead of foo."
    And the user sees "Use bar instead of foo."

  Scenario: A warning user rule lets the call through and Claude reads a note
    Given the user rule "careful-foo" warns bash commands that match "\bfoo\b"
      """
      foo is slow. Prefer bar.
      """
    When Claude runs the bash command "foo --help"
    Then the command is allowed
    And Claude reads the note "foo is slow. Prefer bar."
    And the user sees "foo is slow. Prefer bar."

  Scenario: A command that no rule matches passes through untouched
    Given the user rule "no-foo" blocks bash commands that match "\bfoo\b"
      """
      Use bar instead of foo.
      """
    When Claude runs the bash command "ls -la"
    Then the hook returns nothing

  Scenario: With no rule directory at all the hook still answers
    When Claude runs the bash command "ls"
    Then the hook returns nothing
    And the hook exits with status 0

  Scenario: The reason names the rule above its message
    Given the user rule "no-foo" blocks bash commands that match "\bfoo\b"
      """
      Use bar instead of foo.
      """
    When Claude runs the bash command "foo"
    Then the denial reason is exactly
      """
      **[no-foo]**
      Use bar instead of foo.
      """

  Scenario: Two blocking rules that both match are combined in file-name order
    Given the user rule "a-first" blocks bash commands that match "foo"
      """
      First message.
      """
    And the user rule "b-second" blocks bash commands that match "foo"
      """
      Second message.
      """
    When Claude runs the bash command "foo"
    Then the denial reason is exactly
      """
      **[a-first]**
      First message.

      **[b-second]**
      Second message.
      """

  Scenario: Matching ignores letter case
    Given the user rule "no-foo" blocks bash commands that match "foo"
      """
      Use bar instead of foo.
      """
    When Claude runs the bash command "FOO --help"
    Then the command is denied and Claude reads "Use bar instead of foo."

  Scenario: A project rule is never read
    Given the project rule "project-only" blocks bash commands that match "\bfoo\b"
      """
      Project rule fired.
      """
    When Claude runs the bash command "foo"
    Then the hook returns nothing

  Scenario: A user rule fires even when a project rule also matches
    Given the user rule "from-user" blocks bash commands that match "foo"
      """
      From the user.
      """
    And the project rule "from-project" blocks bash commands that match "foo"
      """
      From the project.
      """
    When Claude runs the bash command "foo"
    Then the denial reason is exactly
      """
      **[from-user]**
      From the user.
      """

  Scenario: A project rule with the same name does not replace the user rule
    Given the user rule "shared" warns bash commands that match "foo"
      """
      user version
      """
    And the project rule "shared" blocks bash commands that match "foo"
      """
      project version
      """
    When Claude runs the bash command "foo"
    Then the command is allowed
    And Claude reads the note "user version"

  Scenario: A disabled project rule does not switch off the user rule
    Given the user rule "shared" blocks bash commands that match "foo"
      """
      user version
      """
    And the project rule "shared" is disabled
    When Claude runs the bash command "foo"
    Then the command is denied and Claude reads "user version"

  Scenario: The rules directory can be moved with STEERHOOK_RULES_DIR
    Given the user rule "no-foo" blocks bash commands that match "foo"
      """
      Use bar instead of foo.
      """
    And the user rules are moved to a directory named by STEERHOOK_RULES_DIR
    When Claude runs the bash command "foo"
    Then the command is denied and Claude reads "Use bar instead of foo."

  Scenario: A bash rule does not look at file edits
    Given the user rule "no-foo" blocks bash commands that match "foo"
      """
      Use bar instead of foo.
      """
    When Claude edits the file "notes.md" to add "foo"
    Then the hook returns nothing

  Scenario: A file rule warns about an edit
    Given the user rule "no-console-log" warns file edits that match "console\.log\("
      """
      Use the logger.
      """
    When Claude edits the file "app.ts" to add "console.log(x)"
    Then the command is allowed
    And Claude reads the note "Use the logger."

  Scenario: A command that spans lines is matched as one text
    Given the user rule "no-sleep-loop" blocks bash commands that match "\b(until|while)\b[\s\S]*\bsleep\b"
      """
      Do not wait with a loop.
      """
    When Claude runs this bash command
      """
      while true; do
        sleep 5
      done
      """
    Then the command is denied and Claude reads "Do not wait with a loop."
```

## What the tool measured

Evidence fields are stripped from every record below: evidence. They stay under the state directory with the trace and the screenshots, and are not committed.

### A blocking user rule denies the call and Claude reads the message (line 16)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-foo" blocks bash commands that match "\bfoo\b" | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "foo --help" | ok | 322 | false | 0 | 0 |
| the command is denied and Claude reads "Use bar instead of foo." | ok | 0 | false | 0 | 0 |
| the user sees "Use bar instead of foo." | ok | 0 | false | 0 | 0 |

#### the user rule "no-foo" blocks bash commands that match "\bfoo\b"

```json
{
  "step_record_id": "step-20260904-061453-8txo",
  "step": "user-bash-rule",
  "kind": "run",
  "args": {
    "name": "no-foo",
    "verb": "blocks",
    "pattern": "\\bfoo\\b",
    "message": "Use bar instead of foo."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/no-foo.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061453-1yhh",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:53.822Z",
  "finished_at": "2026-09-03T21:14:53.824Z",
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
      "at": "2026-09-03T21:14:53.822Z"
    }
  ]
}
```

#### Claude runs the bash command "foo --help"

```json
{
  "step_record_id": "step-20260904-061453-y828",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "foo --help"
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
  "scenario_record_id": "scn-20260904-061453-1yhh",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:53.825Z",
  "finished_at": "2026-09-03T21:14:54.147Z",
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
  "step_record_id": "step-20260904-061454-hlnx",
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
  "scenario_record_id": "scn-20260904-061453-1yhh",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:54.150Z",
  "finished_at": "2026-09-03T21:14:54.150Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061453-y828",
      "step": "run-bash"
    }
  ]
}
```

#### the user sees "Use bar instead of foo."

```json
{
  "step_record_id": "step-20260904-061454-6bx0",
  "step": "user-sees",
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
    "system_message": "**[no-foo]**\nUse bar instead of foo."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061453-1yhh",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:54.152Z",
  "finished_at": "2026-09-03T21:14:54.152Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061453-y828",
      "step": "run-bash"
    }
  ]
}
```

### A warning user rule lets the call through and Claude reads a note (line 25)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "careful-foo" warns bash commands that match "\bfoo\b" | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "foo --help" | ok | 340 | false | 0 | 0 |
| the command is allowed | ok | 1 | false | 0 | 0 |
| Claude reads the note "foo is slow. Prefer bar." | ok | 1 | false | 0 | 0 |
| the user sees "foo is slow. Prefer bar." | ok | 1 | false | 0 | 0 |

#### the user rule "careful-foo" warns bash commands that match "\bfoo\b"

```json
{
  "step_record_id": "step-20260904-061454-wh0p",
  "step": "user-bash-rule",
  "kind": "run",
  "args": {
    "name": "careful-foo",
    "verb": "warns",
    "pattern": "\\bfoo\\b",
    "message": "foo is slow. Prefer bar."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/careful-foo.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061454-0c9k",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:54.168Z",
  "finished_at": "2026-09-03T21:14:54.169Z",
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
      "at": "2026-09-03T21:14:54.168Z"
    }
  ]
}
```

#### Claude runs the bash command "foo --help"

```json
{
  "step_record_id": "step-20260904-061454-cfpf",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "foo --help"
  },
  "result": {
    "exit_code": 0,
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[careful-foo]**\nfoo is slow. Prefer bar."
      },
      "systemMessage": "**[careful-foo]**\nfoo is slow. Prefer bar."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061454-0c9k",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:54.171Z",
  "finished_at": "2026-09-03T21:14:54.511Z",
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
  "step_record_id": "step-20260904-061454-xjlq",
  "step": "allowed",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[careful-foo]**\nfoo is slow. Prefer bar."
      },
      "systemMessage": "**[careful-foo]**\nfoo is slow. Prefer bar."
    }
  },
  "result": {
    "permission_decision": null
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061454-0c9k",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:54.513Z",
  "finished_at": "2026-09-03T21:14:54.514Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061454-cfpf",
      "step": "run-bash"
    }
  ]
}
```

#### Claude reads the note "foo is slow. Prefer bar."

```json
{
  "step_record_id": "step-20260904-061454-inct",
  "step": "claude-reads-note",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[careful-foo]**\nfoo is slow. Prefer bar."
      },
      "systemMessage": "**[careful-foo]**\nfoo is slow. Prefer bar."
    },
    "text": "foo is slow. Prefer bar."
  },
  "result": {
    "context": "**[careful-foo]**\nfoo is slow. Prefer bar."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061454-0c9k",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:54.515Z",
  "finished_at": "2026-09-03T21:14:54.516Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061454-cfpf",
      "step": "run-bash"
    }
  ]
}
```

#### the user sees "foo is slow. Prefer bar."

```json
{
  "step_record_id": "step-20260904-061454-5gwd",
  "step": "user-sees",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[careful-foo]**\nfoo is slow. Prefer bar."
      },
      "systemMessage": "**[careful-foo]**\nfoo is slow. Prefer bar."
    },
    "text": "foo is slow. Prefer bar."
  },
  "result": {
    "system_message": "**[careful-foo]**\nfoo is slow. Prefer bar."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061454-0c9k",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:54.517Z",
  "finished_at": "2026-09-03T21:14:54.518Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061454-cfpf",
      "step": "run-bash"
    }
  ]
}
```

### A command that no rule matches passes through untouched (line 35)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-foo" blocks bash commands that match "\bfoo\b" | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "ls -la" | ok | 346 | false | 0 | 0 |
| the hook returns nothing | ok | 0 | false | 0 | 0 |

#### the user rule "no-foo" blocks bash commands that match "\bfoo\b"

```json
{
  "step_record_id": "step-20260904-061454-9yxz",
  "step": "user-bash-rule",
  "kind": "run",
  "args": {
    "name": "no-foo",
    "verb": "blocks",
    "pattern": "\\bfoo\\b",
    "message": "Use bar instead of foo."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/no-foo.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061454-7kg0",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:54.536Z",
  "finished_at": "2026-09-03T21:14:54.538Z",
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
      "at": "2026-09-03T21:14:54.536Z"
    }
  ]
}
```

#### Claude runs the bash command "ls -la"

```json
{
  "step_record_id": "step-20260904-061454-skqk",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "ls -la"
  },
  "result": {
    "exit_code": 0,
    "output": {}
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061454-7kg0",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:54.539Z",
  "finished_at": "2026-09-03T21:14:54.885Z",
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
  "step_record_id": "step-20260904-061454-f4fb",
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
  "scenario_record_id": "scn-20260904-061454-7kg0",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:54.887Z",
  "finished_at": "2026-09-03T21:14:54.887Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061454-skqk",
      "step": "run-bash"
    }
  ]
}
```

### With no rule directory at all the hook still answers (line 43)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| Claude runs the bash command "ls" | ok | 343 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |
| the hook exits with status 0 | ok | 1 | false | 0 | 0 |

#### Claude runs the bash command "ls"

```json
{
  "step_record_id": "step-20260904-061454-ev4q",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "ls"
  },
  "result": {
    "exit_code": 0,
    "output": {}
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061454-a1kr",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:54.902Z",
  "finished_at": "2026-09-03T21:14:55.245Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "fixtures": [
    {
      "name": "sandbox",
      "scope": "scenario",
      "reused": false,
      "setup_ms": 1,
      "at": "2026-09-03T21:14:54.902Z"
    }
  ]
}
```

#### the hook returns nothing

```json
{
  "step_record_id": "step-20260904-061455-cc9d",
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
  "scenario_record_id": "scn-20260904-061454-a1kr",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:55.246Z",
  "finished_at": "2026-09-03T21:14:55.247Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061454-ev4q",
      "step": "run-bash"
    }
  ]
}
```

#### the hook exits with status 0

```json
{
  "step_record_id": "step-20260904-061455-x7n8",
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
  "scenario_record_id": "scn-20260904-061454-a1kr",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:55.247Z",
  "finished_at": "2026-09-03T21:14:55.248Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061454-ev4q",
      "step": "run-bash"
    }
  ]
}
```

### The reason names the rule above its message (line 48)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-foo" blocks bash commands that match "\bfoo\b" | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 343 | false | 0 | 0 |
| the denial reason is exactly | ok | 1 | false | 0 | 0 |

#### the user rule "no-foo" blocks bash commands that match "\bfoo\b"

```json
{
  "step_record_id": "step-20260904-061455-qk2e",
  "step": "user-bash-rule",
  "kind": "run",
  "args": {
    "name": "no-foo",
    "verb": "blocks",
    "pattern": "\\bfoo\\b",
    "message": "Use bar instead of foo."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/no-foo.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061455-dsoo",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:55.260Z",
  "finished_at": "2026-09-03T21:14:55.261Z",
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
      "at": "2026-09-03T21:14:55.260Z"
    }
  ]
}
```

#### Claude runs the bash command "foo"

```json
{
  "step_record_id": "step-20260904-061455-9bnr",
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
  "scenario_record_id": "scn-20260904-061455-dsoo",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:55.262Z",
  "finished_at": "2026-09-03T21:14:55.605Z",
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

#### the denial reason is exactly

```json
{
  "step_record_id": "step-20260904-061455-7h0g",
  "step": "reason-is-exactly",
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
    "expected": "**[no-foo]**\nUse bar instead of foo."
  },
  "result": {
    "reason": "**[no-foo]**\nUse bar instead of foo."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061455-dsoo",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:55.607Z",
  "finished_at": "2026-09-03T21:14:55.608Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061455-9bnr",
      "step": "run-bash"
    }
  ]
}
```

### Two blocking rules that both match are combined in file-name order (line 60)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "a-first" blocks bash commands that match "foo" | ok | 1 | true | 0 | 0 |
| the user rule "b-second" blocks bash commands that match "foo" | ok | 0 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 341 | false | 0 | 0 |
| the denial reason is exactly | ok | 1 | false | 0 | 0 |

#### the user rule "a-first" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260904-061455-jmkv",
  "step": "user-bash-rule",
  "kind": "run",
  "args": {
    "name": "a-first",
    "verb": "blocks",
    "pattern": "foo",
    "message": "First message."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/a-first.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061455-2eia",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:55.620Z",
  "finished_at": "2026-09-03T21:14:55.621Z",
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
      "at": "2026-09-03T21:14:55.620Z"
    }
  ]
}
```

#### the user rule "b-second" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260904-061455-2i7f",
  "step": "user-bash-rule",
  "kind": "run",
  "args": {
    "name": "b-second",
    "verb": "blocks",
    "pattern": "foo",
    "message": "Second message."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/b-second.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061455-2eia",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:55.622Z",
  "finished_at": "2026-09-03T21:14:55.622Z",
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
  "step_record_id": "step-20260904-061455-xy3d",
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
        "permissionDecisionReason": "**[a-first]**\nFirst message.\n\n**[b-second]**\nSecond message."
      },
      "systemMessage": "**[a-first]**\nFirst message.\n\n**[b-second]**\nSecond message."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061455-2eia",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:55.623Z",
  "finished_at": "2026-09-03T21:14:55.964Z",
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

#### the denial reason is exactly

```json
{
  "step_record_id": "step-20260904-061455-sbie",
  "step": "reason-is-exactly",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "**[a-first]**\nFirst message.\n\n**[b-second]**\nSecond message."
      },
      "systemMessage": "**[a-first]**\nFirst message.\n\n**[b-second]**\nSecond message."
    },
    "expected": "**[a-first]**\nFirst message.\n\n**[b-second]**\nSecond message."
  },
  "result": {
    "reason": "**[a-first]**\nFirst message.\n\n**[b-second]**\nSecond message."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061455-2eia",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:55.965Z",
  "finished_at": "2026-09-03T21:14:55.966Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061455-xy3d",
      "step": "run-bash"
    }
  ]
}
```

### Matching ignores letter case (line 79)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-foo" blocks bash commands that match "foo" | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "FOO --help" | ok | 334 | false | 0 | 0 |
| the command is denied and Claude reads "Use bar instead of foo." | ok | 0 | false | 0 | 0 |

#### the user rule "no-foo" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260904-061455-28rc",
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
  "scenario_record_id": "scn-20260904-061455-h8kv",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:55.978Z",
  "finished_at": "2026-09-03T21:14:55.979Z",
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
      "at": "2026-09-03T21:14:55.978Z"
    }
  ]
}
```

#### Claude runs the bash command "FOO --help"

```json
{
  "step_record_id": "step-20260904-061455-w6vm",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "FOO --help"
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
  "scenario_record_id": "scn-20260904-061455-h8kv",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:55.980Z",
  "finished_at": "2026-09-03T21:14:56.314Z",
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
  "step_record_id": "step-20260904-061456-m6fa",
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
  "scenario_record_id": "scn-20260904-061455-h8kv",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:56.316Z",
  "finished_at": "2026-09-03T21:14:56.316Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061455-w6vm",
      "step": "run-bash"
    }
  ]
}
```

### A project rule is never read (line 87)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the project rule "project-only" blocks bash commands that match "\bfoo\b" | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 321 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |

#### the project rule "project-only" blocks bash commands that match "\bfoo\b"

```json
{
  "step_record_id": "step-20260904-061456-jqag",
  "step": "project-bash-rule",
  "kind": "run",
  "args": {
    "name": "project-only",
    "verb": "blocks",
    "pattern": "\\bfoo\\b",
    "message": "Project rule fired."
  },
  "result": {
    "file": "<sandbox>/project/.claude/steerhook/project-only.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061456-6q2m",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:56.329Z",
  "finished_at": "2026-09-03T21:14:56.331Z",
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
      "at": "2026-09-03T21:14:56.330Z"
    }
  ]
}
```

#### Claude runs the bash command "foo"

```json
{
  "step_record_id": "step-20260904-061456-7tie",
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
  "scenario_record_id": "scn-20260904-061456-6q2m",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:56.332Z",
  "finished_at": "2026-09-03T21:14:56.653Z",
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
  "step_record_id": "step-20260904-061456-g2uq",
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
  "scenario_record_id": "scn-20260904-061456-6q2m",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:56.654Z",
  "finished_at": "2026-09-03T21:14:56.655Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061456-7tie",
      "step": "run-bash"
    }
  ]
}
```

### A user rule fires even when a project rule also matches (line 95)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "from-user" blocks bash commands that match "foo" | ok | 2 | true | 0 | 0 |
| the project rule "from-project" blocks bash commands that match "foo" | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 316 | false | 0 | 0 |
| the denial reason is exactly | ok | 1 | false | 0 | 0 |

#### the user rule "from-user" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260904-061456-brqf",
  "step": "user-bash-rule",
  "kind": "run",
  "args": {
    "name": "from-user",
    "verb": "blocks",
    "pattern": "foo",
    "message": "From the user."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/from-user.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061456-4p3p",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:56.666Z",
  "finished_at": "2026-09-03T21:14:56.668Z",
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
      "at": "2026-09-03T21:14:56.667Z"
    }
  ]
}
```

#### the project rule "from-project" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260904-061456-iakt",
  "step": "project-bash-rule",
  "kind": "run",
  "args": {
    "name": "from-project",
    "verb": "blocks",
    "pattern": "foo",
    "message": "From the project."
  },
  "result": {
    "file": "<sandbox>/project/.claude/steerhook/from-project.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061456-4p3p",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:56.669Z",
  "finished_at": "2026-09-03T21:14:56.670Z",
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
  "step_record_id": "step-20260904-061456-skg4",
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
        "permissionDecisionReason": "**[from-user]**\nFrom the user."
      },
      "systemMessage": "**[from-user]**\nFrom the user."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061456-4p3p",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:56.671Z",
  "finished_at": "2026-09-03T21:14:56.987Z",
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

#### the denial reason is exactly

```json
{
  "step_record_id": "step-20260904-061456-yxv4",
  "step": "reason-is-exactly",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "**[from-user]**\nFrom the user."
      },
      "systemMessage": "**[from-user]**\nFrom the user."
    },
    "expected": "**[from-user]**\nFrom the user."
  },
  "result": {
    "reason": "**[from-user]**\nFrom the user."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061456-4p3p",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:56.988Z",
  "finished_at": "2026-09-03T21:14:56.989Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061456-skg4",
      "step": "run-bash"
    }
  ]
}
```

### A project rule with the same name does not replace the user rule (line 111)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "shared" warns bash commands that match "foo" | ok | 2 | true | 0 | 0 |
| the project rule "shared" blocks bash commands that match "foo" | ok | 0 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 309 | false | 0 | 0 |
| the command is allowed | ok | 1 | false | 0 | 0 |
| Claude reads the note "user version" | ok | 0 | false | 0 | 0 |

#### the user rule "shared" warns bash commands that match "foo"

```json
{
  "step_record_id": "step-20260904-061457-y09t",
  "step": "user-bash-rule",
  "kind": "run",
  "args": {
    "name": "shared",
    "verb": "warns",
    "pattern": "foo",
    "message": "user version"
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/shared.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061457-g9vl",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:57.001Z",
  "finished_at": "2026-09-03T21:14:57.003Z",
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
      "at": "2026-09-03T21:14:57.001Z"
    }
  ]
}
```

#### the project rule "shared" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260904-061457-f0ez",
  "step": "project-bash-rule",
  "kind": "run",
  "args": {
    "name": "shared",
    "verb": "blocks",
    "pattern": "foo",
    "message": "project version"
  },
  "result": {
    "file": "<sandbox>/project/.claude/steerhook/shared.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061457-g9vl",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:57.004Z",
  "finished_at": "2026-09-03T21:14:57.004Z",
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
  "step_record_id": "step-20260904-061457-jmdr",
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
        "additionalContext": "**[shared]**\nuser version"
      },
      "systemMessage": "**[shared]**\nuser version"
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061457-g9vl",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:57.005Z",
  "finished_at": "2026-09-03T21:14:57.314Z",
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
  "step_record_id": "step-20260904-061457-uimw",
  "step": "allowed",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[shared]**\nuser version"
      },
      "systemMessage": "**[shared]**\nuser version"
    }
  },
  "result": {
    "permission_decision": null
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061457-g9vl",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:57.315Z",
  "finished_at": "2026-09-03T21:14:57.316Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061457-jmdr",
      "step": "run-bash"
    }
  ]
}
```

#### Claude reads the note "user version"

```json
{
  "step_record_id": "step-20260904-061457-g96u",
  "step": "claude-reads-note",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[shared]**\nuser version"
      },
      "systemMessage": "**[shared]**\nuser version"
    },
    "text": "user version"
  },
  "result": {
    "context": "**[shared]**\nuser version"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061457-g9vl",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:57.317Z",
  "finished_at": "2026-09-03T21:14:57.317Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061457-jmdr",
      "step": "run-bash"
    }
  ]
}
```

### A disabled project rule does not switch off the user rule (line 124)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "shared" blocks bash commands that match "foo" | ok | 1 | true | 0 | 0 |
| the project rule "shared" is disabled | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 321 | false | 0 | 0 |
| the command is denied and Claude reads "user version" | ok | 1 | false | 0 | 0 |

#### the user rule "shared" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260904-061457-p8lm",
  "step": "user-bash-rule",
  "kind": "run",
  "args": {
    "name": "shared",
    "verb": "blocks",
    "pattern": "foo",
    "message": "user version"
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/shared.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061457-eamo",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:57.330Z",
  "finished_at": "2026-09-03T21:14:57.331Z",
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
      "at": "2026-09-03T21:14:57.330Z"
    }
  ]
}
```

#### the project rule "shared" is disabled

```json
{
  "step_record_id": "step-20260904-061457-4o49",
  "step": "project-rule-disabled",
  "kind": "run",
  "args": {
    "name": "shared"
  },
  "result": {
    "file": "<sandbox>/project/.claude/steerhook/shared.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061457-eamo",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:57.332Z",
  "finished_at": "2026-09-03T21:14:57.333Z",
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
  "step_record_id": "step-20260904-061457-fde2",
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
        "permissionDecisionReason": "**[shared]**\nuser version"
      },
      "systemMessage": "**[shared]**\nuser version"
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061457-eamo",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:57.333Z",
  "finished_at": "2026-09-03T21:14:57.654Z",
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

#### the command is denied and Claude reads "user version"

```json
{
  "step_record_id": "step-20260904-061457-68cs",
  "step": "denied-with-reason",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "**[shared]**\nuser version"
      },
      "systemMessage": "**[shared]**\nuser version"
    },
    "text": "user version"
  },
  "result": {
    "decision": "deny",
    "reason": "**[shared]**\nuser version"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061457-eamo",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:57.655Z",
  "finished_at": "2026-09-03T21:14:57.656Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061457-fde2",
      "step": "run-bash"
    }
  ]
}
```

### The rules directory can be moved with STEERHOOK_RULES_DIR (line 133)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-foo" blocks bash commands that match "foo" | ok | 2 | true | 0 | 0 |
| the user rules are moved to a directory named by STEERHOOK_RULES_DIR | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 344 | false | 0 | 0 |
| the command is denied and Claude reads "Use bar instead of foo." | ok | 1 | false | 0 | 0 |

#### the user rule "no-foo" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260904-061457-qpte",
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
  "scenario_record_id": "scn-20260904-061457-hf8s",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:57.670Z",
  "finished_at": "2026-09-03T21:14:57.672Z",
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
      "at": "2026-09-03T21:14:57.671Z"
    }
  ]
}
```

#### the user rules are moved to a directory named by STEERHOOK_RULES_DIR

```json
{
  "step_record_id": "step-20260904-061457-fn4l",
  "step": "rules-dir-override",
  "kind": "run",
  "args": {},
  "result": {
    "dir": "<sandbox>/rules-elsewhere"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061457-hf8s",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:57.674Z",
  "finished_at": "2026-09-03T21:14:57.675Z",
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
  "step_record_id": "step-20260904-061457-wvam",
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
  "scenario_record_id": "scn-20260904-061457-hf8s",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:57.676Z",
  "finished_at": "2026-09-03T21:14:58.020Z",
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
  "step_record_id": "step-20260904-061458-s5kb",
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
  "scenario_record_id": "scn-20260904-061457-hf8s",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:58.022Z",
  "finished_at": "2026-09-03T21:14:58.023Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061457-wvam",
      "step": "run-bash"
    }
  ]
}
```

### A bash rule does not look at file edits (line 142)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-foo" blocks bash commands that match "foo" | ok | 2 | true | 0 | 0 |
| Claude edits the file "notes.md" to add "foo" | ok | 319 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |

#### the user rule "no-foo" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260904-061458-d2pi",
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
  "scenario_record_id": "scn-20260904-061458-qsub",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:58.036Z",
  "finished_at": "2026-09-03T21:14:58.038Z",
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
      "at": "2026-09-03T21:14:58.036Z"
    }
  ]
}
```

#### Claude edits the file "notes.md" to add "foo"

```json
{
  "step_record_id": "step-20260904-061458-w33g",
  "step": "edit-file",
  "kind": "run",
  "args": {
    "path": "notes.md",
    "text": "foo"
  },
  "result": {
    "exit_code": 0,
    "output": {}
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061458-qsub",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:58.040Z",
  "finished_at": "2026-09-03T21:14:58.359Z",
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
  "step_record_id": "step-20260904-061458-1heb",
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
  "scenario_record_id": "scn-20260904-061458-qsub",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:58.360Z",
  "finished_at": "2026-09-03T21:14:58.361Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061458-w33g",
      "step": "edit-file"
    }
  ]
}
```

### A file rule warns about an edit (line 150)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-console-log" warns file edits that match "console\.log\(" | ok | 2 | true | 0 | 0 |
| Claude edits the file "app.ts" to add "console.log(x)" | ok | 339 | false | 0 | 0 |
| the command is allowed | ok | 0 | false | 0 | 0 |
| Claude reads the note "Use the logger." | ok | 1 | false | 0 | 0 |

#### the user rule "no-console-log" warns file edits that match "console\.log\("

```json
{
  "step_record_id": "step-20260904-061458-vsym",
  "step": "user-file-rule",
  "kind": "run",
  "args": {
    "name": "no-console-log",
    "verb": "warns",
    "pattern": "console\\.log\\(",
    "message": "Use the logger."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/no-console-log.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061458-kbg3",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:58.373Z",
  "finished_at": "2026-09-03T21:14:58.375Z",
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
      "at": "2026-09-03T21:14:58.373Z"
    }
  ]
}
```

#### Claude edits the file "app.ts" to add "console.log(x)"

```json
{
  "step_record_id": "step-20260904-061458-nwqi",
  "step": "edit-file",
  "kind": "run",
  "args": {
    "path": "app.ts",
    "text": "console.log(x)"
  },
  "result": {
    "exit_code": 0,
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[no-console-log]**\nUse the logger."
      },
      "systemMessage": "**[no-console-log]**\nUse the logger."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061458-kbg3",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:58.376Z",
  "finished_at": "2026-09-03T21:14:58.715Z",
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
  "step_record_id": "step-20260904-061458-5744",
  "step": "allowed",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[no-console-log]**\nUse the logger."
      },
      "systemMessage": "**[no-console-log]**\nUse the logger."
    }
  },
  "result": {
    "permission_decision": null
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061458-kbg3",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:58.717Z",
  "finished_at": "2026-09-03T21:14:58.717Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061458-nwqi",
      "step": "edit-file"
    }
  ]
}
```

#### Claude reads the note "Use the logger."

```json
{
  "step_record_id": "step-20260904-061458-frpp",
  "step": "claude-reads-note",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "**[no-console-log]**\nUse the logger."
      },
      "systemMessage": "**[no-console-log]**\nUse the logger."
    },
    "text": "Use the logger."
  },
  "result": {
    "context": "**[no-console-log]**\nUse the logger."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061458-kbg3",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:58.718Z",
  "finished_at": "2026-09-03T21:14:58.719Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061458-nwqi",
      "step": "edit-file"
    }
  ]
}
```

### A command that spans lines is matched as one text (line 159)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-sleep-loop" blocks bash commands that match "\b(until\|while)\b[\s\S]*\bsleep\b" | ok | 1 | true | 0 | 0 |
| Claude runs this bash command | ok | 308 | false | 0 | 0 |
| the command is denied and Claude reads "Do not wait with a loop." | ok | 1 | false | 0 | 0 |

#### the user rule "no-sleep-loop" blocks bash commands that match "\b(until|while)\b[\s\S]*\bsleep\b"

```json
{
  "step_record_id": "step-20260904-061458-td7z",
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
  "scenario_record_id": "scn-20260904-061458-pmvs",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:58.730Z",
  "finished_at": "2026-09-03T21:14:58.731Z",
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
      "at": "2026-09-03T21:14:58.730Z"
    }
  ]
}
```

#### Claude runs this bash command

```json
{
  "step_record_id": "step-20260904-061458-m1dd",
  "step": "run-bash-block",
  "kind": "run",
  "args": {
    "command": "while true; do\n  sleep 5\ndone"
  },
  "result": {
    "exit_code": 0,
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "**[no-sleep-loop]**\nDo not wait with a loop."
      },
      "systemMessage": "**[no-sleep-loop]**\nDo not wait with a loop."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061458-pmvs",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:58.732Z",
  "finished_at": "2026-09-03T21:14:59.040Z",
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

#### the command is denied and Claude reads "Do not wait with a loop."

```json
{
  "step_record_id": "step-20260904-061459-z18t",
  "step": "denied-with-reason",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "**[no-sleep-loop]**\nDo not wait with a loop."
      },
      "systemMessage": "**[no-sleep-loop]**\nDo not wait with a loop."
    },
    "text": "Do not wait with a loop."
  },
  "result": {
    "decision": "deny",
    "reason": "**[no-sleep-loop]**\nDo not wait with a loop."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061458-pmvs",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:59.041Z",
  "finished_at": "2026-09-03T21:14:59.042Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061458-m1dd",
      "step": "run-bash-block"
    }
  ]
}
```

## Declared vs observed

No step declared `mutates: false` and was measured making a write.
