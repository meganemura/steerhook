---
feature: features/pretooluse.feature
commit: b8dc95895385796a1b8ffea9790488e46efd433c
run_id: run-20260903-233621-tcvj
ran_at: 2026-09-03T23:36:21.901+09:00
accepted_at: 2026-09-03T23:36:32.875+09:00
environment: default
browser: none
scenarios:
  - name: A blocking user rule denies the call and Claude reads the message
    line: 16
    scenario_record_id: scn-20260903-233621-paev
  - name: A warning user rule lets the call through and Claude reads a note
    line: 25
    scenario_record_id: scn-20260903-233622-r9xx
  - name: A command that no rule matches passes through untouched
    line: 35
    scenario_record_id: scn-20260903-233622-qnmr
  - name: With no rule directory at all the hook still answers
    line: 43
    scenario_record_id: scn-20260903-233622-wc2f
  - name: The reason names the rule above its message
    line: 48
    scenario_record_id: scn-20260903-233623-x0zq
  - name: Two blocking rules that both match are combined in file-name order
    line: 60
    scenario_record_id: scn-20260903-233623-1v76
  - name: Matching ignores letter case
    line: 79
    scenario_record_id: scn-20260903-233623-ch0u
  - name: A project rule is never read
    line: 87
    scenario_record_id: scn-20260903-233624-wpy6
  - name: A user rule fires even when a project rule also matches
    line: 95
    scenario_record_id: scn-20260903-233624-5gif
  - name: A project rule with the same name does not replace the user rule
    line: 111
    scenario_record_id: scn-20260903-233624-ownq
  - name: A disabled project rule does not switch off the user rule
    line: 124
    scenario_record_id: scn-20260903-233625-8dw6
  - name: The rules directory can be moved with STEERHOOK_RULES_DIR
    line: 133
    scenario_record_id: scn-20260903-233625-rzt8
  - name: A bash rule does not look at file edits
    line: 142
    scenario_record_id: scn-20260903-233625-vgck
  - name: A file rule warns about an edit
    line: 150
    scenario_record_id: scn-20260903-233626-tyij
  - name: A command that spans lines is matched as one text
    line: 159
    scenario_record_id: scn-20260903-233626-o6wx
---

# Rules checked before a tool runs: green at b8dc958

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
| the user rule "no-foo" blocks bash commands that match "\bfoo\b" | ok | 3 | true | 0 | 0 |
| Claude runs the bash command "foo --help" | ok | 296 | false | 0 | 0 |
| the command is denied and Claude reads "Use bar instead of foo." | ok | 9 | false | 0 | 0 |
| the user sees "Use bar instead of foo." | ok | 1 | false | 0 | 0 |

#### the user rule "no-foo" blocks bash commands that match "\bfoo\b"

```json
{
  "step_record_id": "step-20260903-233621-qioa",
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
  "scenario_record_id": "scn-20260903-233621-paev",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:21.905Z",
  "finished_at": "2026-09-03T14:36:21.908Z",
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
      "at": "2026-09-03T14:36:21.906Z"
    }
  ]
}
```

#### Claude runs the bash command "foo --help"

```json
{
  "step_record_id": "step-20260903-233621-mnsl",
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
  "scenario_record_id": "scn-20260903-233621-paev",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:21.912Z",
  "finished_at": "2026-09-03T14:36:22.208Z",
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
  "step_record_id": "step-20260903-233622-npm5",
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
  "scenario_record_id": "scn-20260903-233621-paev",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:22.210Z",
  "finished_at": "2026-09-03T14:36:22.219Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-233621-mnsl",
      "step": "run-bash"
    }
  ]
}
```

#### the user sees "Use bar instead of foo."

```json
{
  "step_record_id": "step-20260903-233622-9y1h",
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
  "scenario_record_id": "scn-20260903-233621-paev",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:22.221Z",
  "finished_at": "2026-09-03T14:36:22.222Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-233621-mnsl",
      "step": "run-bash"
    }
  ]
}
```

### A warning user rule lets the call through and Claude reads a note (line 25)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "careful-foo" warns bash commands that match "\bfoo\b" | ok | 0 | true | 0 | 0 |
| Claude runs the bash command "foo --help" | ok | 288 | false | 0 | 0 |
| the command is allowed | ok | 1 | false | 0 | 0 |
| Claude reads the note "foo is slow. Prefer bar." | ok | 0 | false | 0 | 0 |
| the user sees "foo is slow. Prefer bar." | ok | 0 | false | 0 | 0 |

#### the user rule "careful-foo" warns bash commands that match "\bfoo\b"

```json
{
  "step_record_id": "step-20260903-233622-rm5d",
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
  "scenario_record_id": "scn-20260903-233622-r9xx",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:22.238Z",
  "finished_at": "2026-09-03T14:36:22.238Z",
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
      "at": "2026-09-03T14:36:22.238Z"
    }
  ]
}
```

#### Claude runs the bash command "foo --help"

```json
{
  "step_record_id": "step-20260903-233622-ebwu",
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
  "scenario_record_id": "scn-20260903-233622-r9xx",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:22.239Z",
  "finished_at": "2026-09-03T14:36:22.527Z",
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
  "step_record_id": "step-20260903-233622-dtye",
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
  "scenario_record_id": "scn-20260903-233622-r9xx",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:22.528Z",
  "finished_at": "2026-09-03T14:36:22.529Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-233622-ebwu",
      "step": "run-bash"
    }
  ]
}
```

#### Claude reads the note "foo is slow. Prefer bar."

```json
{
  "step_record_id": "step-20260903-233622-udp8",
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
  "scenario_record_id": "scn-20260903-233622-r9xx",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:22.531Z",
  "finished_at": "2026-09-03T14:36:22.531Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-233622-ebwu",
      "step": "run-bash"
    }
  ]
}
```

#### the user sees "foo is slow. Prefer bar."

```json
{
  "step_record_id": "step-20260903-233622-g66v",
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
  "scenario_record_id": "scn-20260903-233622-r9xx",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:22.532Z",
  "finished_at": "2026-09-03T14:36:22.532Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-233622-ebwu",
      "step": "run-bash"
    }
  ]
}
```

### A command that no rule matches passes through untouched (line 35)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-foo" blocks bash commands that match "\bfoo\b" | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "ls -la" | ok | 307 | false | 0 | 0 |
| the hook returns nothing | ok | 2 | false | 0 | 0 |

#### the user rule "no-foo" blocks bash commands that match "\bfoo\b"

```json
{
  "step_record_id": "step-20260903-233622-b2bt",
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
  "scenario_record_id": "scn-20260903-233622-qnmr",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:22.545Z",
  "finished_at": "2026-09-03T14:36:22.546Z",
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
      "at": "2026-09-03T14:36:22.545Z"
    }
  ]
}
```

#### Claude runs the bash command "ls -la"

```json
{
  "step_record_id": "step-20260903-233622-d2n5",
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
  "scenario_record_id": "scn-20260903-233622-qnmr",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:22.547Z",
  "finished_at": "2026-09-03T14:36:22.854Z",
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
  "step_record_id": "step-20260903-233622-ml4l",
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
  "scenario_record_id": "scn-20260903-233622-qnmr",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:22.855Z",
  "finished_at": "2026-09-03T14:36:22.857Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-233622-d2n5",
      "step": "run-bash"
    }
  ]
}
```

### With no rule directory at all the hook still answers (line 43)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| Claude runs the bash command "ls" | ok | 322 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |
| the hook exits with status 0 | ok | 1 | false | 0 | 0 |

#### Claude runs the bash command "ls"

```json
{
  "step_record_id": "step-20260903-233622-kur7",
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
  "scenario_record_id": "scn-20260903-233622-wc2f",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:22.870Z",
  "finished_at": "2026-09-03T14:36:23.192Z",
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
      "at": "2026-09-03T14:36:22.870Z"
    }
  ]
}
```

#### the hook returns nothing

```json
{
  "step_record_id": "step-20260903-233623-xo7c",
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
  "scenario_record_id": "scn-20260903-233622-wc2f",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:23.193Z",
  "finished_at": "2026-09-03T14:36:23.194Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-233622-kur7",
      "step": "run-bash"
    }
  ]
}
```

#### the hook exits with status 0

```json
{
  "step_record_id": "step-20260903-233623-m7zs",
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
  "scenario_record_id": "scn-20260903-233622-wc2f",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:23.196Z",
  "finished_at": "2026-09-03T14:36:23.197Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-233622-kur7",
      "step": "run-bash"
    }
  ]
}
```

### The reason names the rule above its message (line 48)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-foo" blocks bash commands that match "\bfoo\b" | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 298 | false | 0 | 0 |
| the denial reason is exactly | ok | 1 | false | 0 | 0 |

#### the user rule "no-foo" blocks bash commands that match "\bfoo\b"

```json
{
  "step_record_id": "step-20260903-233623-9fkj",
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
  "scenario_record_id": "scn-20260903-233623-x0zq",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:23.209Z",
  "finished_at": "2026-09-03T14:36:23.211Z",
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
      "at": "2026-09-03T14:36:23.210Z"
    }
  ]
}
```

#### Claude runs the bash command "foo"

```json
{
  "step_record_id": "step-20260903-233623-9mj4",
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
  "scenario_record_id": "scn-20260903-233623-x0zq",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:23.212Z",
  "finished_at": "2026-09-03T14:36:23.510Z",
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
  "step_record_id": "step-20260903-233623-0n3q",
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
  "scenario_record_id": "scn-20260903-233623-x0zq",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:23.512Z",
  "finished_at": "2026-09-03T14:36:23.513Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-233623-9mj4",
      "step": "run-bash"
    }
  ]
}
```

### Two blocking rules that both match are combined in file-name order (line 60)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "a-first" blocks bash commands that match "foo" | ok | 2 | true | 0 | 0 |
| the user rule "b-second" blocks bash commands that match "foo" | ok | 0 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 311 | false | 0 | 0 |
| the denial reason is exactly | ok | 1 | false | 0 | 0 |

#### the user rule "a-first" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260903-233623-h8zr",
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
  "scenario_record_id": "scn-20260903-233623-1v76",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:23.528Z",
  "finished_at": "2026-09-03T14:36:23.530Z",
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
      "at": "2026-09-03T14:36:23.529Z"
    }
  ]
}
```

#### the user rule "b-second" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260903-233623-ptcw",
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
  "scenario_record_id": "scn-20260903-233623-1v76",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:23.532Z",
  "finished_at": "2026-09-03T14:36:23.532Z",
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
  "step_record_id": "step-20260903-233623-drl0",
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
  "scenario_record_id": "scn-20260903-233623-1v76",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:23.533Z",
  "finished_at": "2026-09-03T14:36:23.844Z",
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
  "step_record_id": "step-20260903-233623-99tp",
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
  "scenario_record_id": "scn-20260903-233623-1v76",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:23.845Z",
  "finished_at": "2026-09-03T14:36:23.846Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-233623-drl0",
      "step": "run-bash"
    }
  ]
}
```

### Matching ignores letter case (line 79)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-foo" blocks bash commands that match "foo" | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "FOO --help" | ok | 287 | false | 0 | 0 |
| the command is denied and Claude reads "Use bar instead of foo." | ok | 1 | false | 0 | 0 |

#### the user rule "no-foo" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260903-233623-hftt",
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
  "scenario_record_id": "scn-20260903-233623-ch0u",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:23.863Z",
  "finished_at": "2026-09-03T14:36:23.865Z",
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
      "at": "2026-09-03T14:36:23.863Z"
    }
  ]
}
```

#### Claude runs the bash command "FOO --help"

```json
{
  "step_record_id": "step-20260903-233623-3qtp",
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
  "scenario_record_id": "scn-20260903-233623-ch0u",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:23.866Z",
  "finished_at": "2026-09-03T14:36:24.153Z",
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
  "step_record_id": "step-20260903-233624-ltfv",
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
  "scenario_record_id": "scn-20260903-233623-ch0u",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:24.154Z",
  "finished_at": "2026-09-03T14:36:24.155Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-233623-3qtp",
      "step": "run-bash"
    }
  ]
}
```

### A project rule is never read (line 87)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the project rule "project-only" blocks bash commands that match "\bfoo\b" | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 284 | false | 0 | 0 |
| the hook returns nothing | ok | 0 | false | 0 | 0 |

#### the project rule "project-only" blocks bash commands that match "\bfoo\b"

```json
{
  "step_record_id": "step-20260903-233624-k230",
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
  "scenario_record_id": "scn-20260903-233624-wpy6",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:24.167Z",
  "finished_at": "2026-09-03T14:36:24.169Z",
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
      "at": "2026-09-03T14:36:24.168Z"
    }
  ]
}
```

#### Claude runs the bash command "foo"

```json
{
  "step_record_id": "step-20260903-233624-bf1o",
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
  "scenario_record_id": "scn-20260903-233624-wpy6",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:24.170Z",
  "finished_at": "2026-09-03T14:36:24.454Z",
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
  "step_record_id": "step-20260903-233624-7itt",
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
  "scenario_record_id": "scn-20260903-233624-wpy6",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:24.455Z",
  "finished_at": "2026-09-03T14:36:24.455Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-233624-bf1o",
      "step": "run-bash"
    }
  ]
}
```

### A user rule fires even when a project rule also matches (line 95)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "from-user" blocks bash commands that match "foo" | ok | 1 | true | 0 | 0 |
| the project rule "from-project" blocks bash commands that match "foo" | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 305 | false | 0 | 0 |
| the denial reason is exactly | ok | 1 | false | 0 | 0 |

#### the user rule "from-user" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260903-233624-b6x2",
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
  "scenario_record_id": "scn-20260903-233624-5gif",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:24.466Z",
  "finished_at": "2026-09-03T14:36:24.467Z",
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
      "at": "2026-09-03T14:36:24.466Z"
    }
  ]
}
```

#### the project rule "from-project" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260903-233624-s8iz",
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
  "scenario_record_id": "scn-20260903-233624-5gif",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:24.468Z",
  "finished_at": "2026-09-03T14:36:24.469Z",
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
  "step_record_id": "step-20260903-233624-l38k",
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
  "scenario_record_id": "scn-20260903-233624-5gif",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:24.469Z",
  "finished_at": "2026-09-03T14:36:24.774Z",
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
  "step_record_id": "step-20260903-233624-sjwp",
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
  "scenario_record_id": "scn-20260903-233624-5gif",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:24.775Z",
  "finished_at": "2026-09-03T14:36:24.776Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-233624-l38k",
      "step": "run-bash"
    }
  ]
}
```

### A project rule with the same name does not replace the user rule (line 111)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "shared" warns bash commands that match "foo" | ok | 1 | true | 0 | 0 |
| the project rule "shared" blocks bash commands that match "foo" | ok | 0 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 298 | false | 0 | 0 |
| the command is allowed | ok | 1 | false | 0 | 0 |
| Claude reads the note "user version" | ok | 1 | false | 0 | 0 |

#### the user rule "shared" warns bash commands that match "foo"

```json
{
  "step_record_id": "step-20260903-233624-nofq",
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
  "scenario_record_id": "scn-20260903-233624-ownq",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:24.790Z",
  "finished_at": "2026-09-03T14:36:24.791Z",
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
      "at": "2026-09-03T14:36:24.790Z"
    }
  ]
}
```

#### the project rule "shared" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260903-233624-4n7o",
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
  "scenario_record_id": "scn-20260903-233624-ownq",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:24.793Z",
  "finished_at": "2026-09-03T14:36:24.793Z",
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
  "step_record_id": "step-20260903-233624-fbdl",
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
  "scenario_record_id": "scn-20260903-233624-ownq",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:24.794Z",
  "finished_at": "2026-09-03T14:36:25.092Z",
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
  "step_record_id": "step-20260903-233625-6vc6",
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
  "scenario_record_id": "scn-20260903-233624-ownq",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:25.093Z",
  "finished_at": "2026-09-03T14:36:25.094Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-233624-fbdl",
      "step": "run-bash"
    }
  ]
}
```

#### Claude reads the note "user version"

```json
{
  "step_record_id": "step-20260903-233625-moqm",
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
  "scenario_record_id": "scn-20260903-233624-ownq",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:25.095Z",
  "finished_at": "2026-09-03T14:36:25.096Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-233624-fbdl",
      "step": "run-bash"
    }
  ]
}
```

### A disabled project rule does not switch off the user rule (line 124)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "shared" blocks bash commands that match "foo" | ok | 2 | true | 0 | 0 |
| the project rule "shared" is disabled | ok | 0 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 282 | false | 0 | 0 |
| the command is denied and Claude reads "user version" | ok | 1 | false | 0 | 0 |

#### the user rule "shared" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260903-233625-2oj1",
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
  "scenario_record_id": "scn-20260903-233625-8dw6",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:25.110Z",
  "finished_at": "2026-09-03T14:36:25.112Z",
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
      "at": "2026-09-03T14:36:25.111Z"
    }
  ]
}
```

#### the project rule "shared" is disabled

```json
{
  "step_record_id": "step-20260903-233625-4zcs",
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
  "scenario_record_id": "scn-20260903-233625-8dw6",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:25.114Z",
  "finished_at": "2026-09-03T14:36:25.114Z",
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
  "step_record_id": "step-20260903-233625-zjme",
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
  "scenario_record_id": "scn-20260903-233625-8dw6",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:25.115Z",
  "finished_at": "2026-09-03T14:36:25.397Z",
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
  "step_record_id": "step-20260903-233625-q1em",
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
  "scenario_record_id": "scn-20260903-233625-8dw6",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:25.398Z",
  "finished_at": "2026-09-03T14:36:25.399Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-233625-zjme",
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
| Claude runs the bash command "foo" | ok | 332 | false | 0 | 0 |
| the command is denied and Claude reads "Use bar instead of foo." | ok | 1 | false | 0 | 0 |

#### the user rule "no-foo" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260903-233625-9yml",
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
  "scenario_record_id": "scn-20260903-233625-rzt8",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:25.416Z",
  "finished_at": "2026-09-03T14:36:25.418Z",
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
      "at": "2026-09-03T14:36:25.417Z"
    }
  ]
}
```

#### the user rules are moved to a directory named by STEERHOOK_RULES_DIR

```json
{
  "step_record_id": "step-20260903-233625-bqkc",
  "step": "rules-dir-override",
  "kind": "run",
  "args": {},
  "result": {
    "dir": "<sandbox>/rules-elsewhere"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-233625-rzt8",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:25.421Z",
  "finished_at": "2026-09-03T14:36:25.422Z",
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
  "step_record_id": "step-20260903-233625-7qsl",
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
  "scenario_record_id": "scn-20260903-233625-rzt8",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:25.424Z",
  "finished_at": "2026-09-03T14:36:25.756Z",
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
  "step_record_id": "step-20260903-233625-vyi0",
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
  "scenario_record_id": "scn-20260903-233625-rzt8",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:25.758Z",
  "finished_at": "2026-09-03T14:36:25.759Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-233625-7qsl",
      "step": "run-bash"
    }
  ]
}
```

### A bash rule does not look at file edits (line 142)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-foo" blocks bash commands that match "foo" | ok | 1 | true | 0 | 0 |
| Claude edits the file "notes.md" to add "foo" | ok | 316 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |

#### the user rule "no-foo" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260903-233625-3gzi",
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
  "scenario_record_id": "scn-20260903-233625-vgck",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:25.774Z",
  "finished_at": "2026-09-03T14:36:25.775Z",
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
      "at": "2026-09-03T14:36:25.774Z"
    }
  ]
}
```

#### Claude edits the file "notes.md" to add "foo"

```json
{
  "step_record_id": "step-20260903-233625-qrbm",
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
  "scenario_record_id": "scn-20260903-233625-vgck",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:25.777Z",
  "finished_at": "2026-09-03T14:36:26.093Z",
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
  "step_record_id": "step-20260903-233626-bemd",
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
  "scenario_record_id": "scn-20260903-233625-vgck",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:26.094Z",
  "finished_at": "2026-09-03T14:36:26.095Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-233625-qrbm",
      "step": "edit-file"
    }
  ]
}
```

### A file rule warns about an edit (line 150)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-console-log" warns file edits that match "console\.log\(" | ok | 2 | true | 0 | 0 |
| Claude edits the file "app.ts" to add "console.log(x)" | ok | 317 | false | 0 | 0 |
| the command is allowed | ok | 0 | false | 0 | 0 |
| Claude reads the note "Use the logger." | ok | 0 | false | 0 | 0 |

#### the user rule "no-console-log" warns file edits that match "console\.log\("

```json
{
  "step_record_id": "step-20260903-233626-9tad",
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
  "scenario_record_id": "scn-20260903-233626-tyij",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:26.120Z",
  "finished_at": "2026-09-03T14:36:26.122Z",
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
      "at": "2026-09-03T14:36:26.120Z"
    }
  ]
}
```

#### Claude edits the file "app.ts" to add "console.log(x)"

```json
{
  "step_record_id": "step-20260903-233626-djmz",
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
  "scenario_record_id": "scn-20260903-233626-tyij",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:26.131Z",
  "finished_at": "2026-09-03T14:36:26.448Z",
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
  "step_record_id": "step-20260903-233626-mcwf",
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
  "scenario_record_id": "scn-20260903-233626-tyij",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:26.449Z",
  "finished_at": "2026-09-03T14:36:26.449Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-233626-djmz",
      "step": "edit-file"
    }
  ]
}
```

#### Claude reads the note "Use the logger."

```json
{
  "step_record_id": "step-20260903-233626-cm1m",
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
  "scenario_record_id": "scn-20260903-233626-tyij",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:26.450Z",
  "finished_at": "2026-09-03T14:36:26.450Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-233626-djmz",
      "step": "edit-file"
    }
  ]
}
```

### A command that spans lines is matched as one text (line 159)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-sleep-loop" blocks bash commands that match "\b(until\|while)\b[\s\S]*\bsleep\b" | ok | 1 | true | 0 | 0 |
| Claude runs this bash command | ok | 288 | false | 0 | 0 |
| the command is denied and Claude reads "Do not wait with a loop." | ok | 1 | false | 0 | 0 |

#### the user rule "no-sleep-loop" blocks bash commands that match "\b(until|while)\b[\s\S]*\bsleep\b"

```json
{
  "step_record_id": "step-20260903-233626-ysa7",
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
  "scenario_record_id": "scn-20260903-233626-o6wx",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:26.463Z",
  "finished_at": "2026-09-03T14:36:26.464Z",
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
      "at": "2026-09-03T14:36:26.463Z"
    }
  ]
}
```

#### Claude runs this bash command

```json
{
  "step_record_id": "step-20260903-233626-b9l4",
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
  "scenario_record_id": "scn-20260903-233626-o6wx",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:26.465Z",
  "finished_at": "2026-09-03T14:36:26.753Z",
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
  "step_record_id": "step-20260903-233626-1xmt",
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
  "scenario_record_id": "scn-20260903-233626-o6wx",
  "run_id": "run-20260903-233621-tcvj",
  "started_at": "2026-09-03T14:36:26.754Z",
  "finished_at": "2026-09-03T14:36:26.755Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-233626-b9l4",
      "step": "run-bash-block"
    }
  ]
}
```

## Declared vs observed

No step declared `mutates: false` and was measured making a write.
