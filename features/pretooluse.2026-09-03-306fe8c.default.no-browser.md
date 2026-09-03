---
feature: features/pretooluse.feature
commit: 306fe8c9e049895f4c1a4d65f81a8d5679c30a7a
run_id: run-20260903-215826-yk71
ran_at: 2026-09-03T21:58:29.512+09:00
accepted_at: 2026-09-03T21:58:43.627+09:00
environment: default
browser: none
scenarios:
  - name: A blocking user rule denies the call and Claude reads the message
    line: 11
    scenario_record_id: scn-20260903-215829-eikz
  - name: A warning user rule lets the call through and Claude reads a note
    line: 20
    scenario_record_id: scn-20260903-215829-syv8
  - name: A command that no rule matches passes through untouched
    line: 30
    scenario_record_id: scn-20260903-215830-tujn
  - name: With no rule directory at all the hook still answers
    line: 38
    scenario_record_id: scn-20260903-215830-t8zo
  - name: The reason names the rule above its message
    line: 43
    scenario_record_id: scn-20260903-215830-okib
  - name: Two blocking rules that both match are combined in file-name order
    line: 55
    scenario_record_id: scn-20260903-215831-07gp
  - name: Matching ignores letter case
    line: 74
    scenario_record_id: scn-20260903-215831-r182
  - name: A project rule fires from the project the hook input names
    line: 82
    scenario_record_id: scn-20260903-215831-28wy
  - name: User rules come first, then project rules
    line: 90
    scenario_record_id: scn-20260903-215832-sg3x
  - name: A project rule with the same name replaces the user rule
    line: 109
    scenario_record_id: scn-20260903-215832-o1ch
  - name: A disabled project rule switches the user rule off in that project
    line: 125
    scenario_record_id: scn-20260903-215832-xidb
  - name: The rules directory can be moved with STEERHOOK_RULES_DIR
    line: 134
    scenario_record_id: scn-20260903-215833-eqtc
  - name: A bash rule does not look at file edits
    line: 143
    scenario_record_id: scn-20260903-215833-gxo1
  - name: A file rule warns about an edit
    line: 151
    scenario_record_id: scn-20260903-215833-3sjk
  - name: A command that spans lines is matched as one text
    line: 160
    scenario_record_id: scn-20260903-215833-pyov
---

# Rules checked before a tool runs: green at 306fe8c

## Condition

- environment: default
- browser: not launched (no step in this run destructured page/context)

## The scenario as it ran

```gherkin
Feature: Rules checked before a tool runs

  steerhook reads the user's rules from ~/.claude/steerhook/ and a project's
  rules from <project>/.claude/steerhook/. Before Claude runs a tool, the
  PreToolUse hook matches the call against them and answers with JSON.

  In every scenario the hook process runs in a directory that holds no rules.
  The project is named only by the cwd field of the hook input, the way Claude
  Code passes it, so a project rule that fires here proves that resolution.

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

  Scenario: A project rule fires from the project the hook input names
    Given the project rule "project-only" blocks bash commands that match "\bfoo\b"
      """
      Project rule fired.
      """
    When Claude runs the bash command "foo"
    Then the command is denied and Claude reads "Project rule fired."

  Scenario: User rules come first, then project rules
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

      **[from-project]**
      From the project.
      """

  Scenario: A project rule with the same name replaces the user rule
    Given the user rule "shared" warns bash commands that match "foo"
      """
      user version
      """
    And the project rule "shared" blocks bash commands that match "foo"
      """
      project version
      """
    When Claude runs the bash command "foo"
    Then the denial reason is exactly
      """
      **[shared]**
      project version
      """

  Scenario: A disabled project rule switches the user rule off in that project
    Given the user rule "shared" blocks bash commands that match "foo"
      """
      user version
      """
    And the project rule "shared" is disabled
    When Claude runs the bash command "foo"
    Then the hook returns nothing

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

### A blocking user rule denies the call and Claude reads the message (line 11)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-foo" blocks bash commands that match "\bfoo\b" | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "foo --help" | ok | 302 | false | 0 | 0 |
| the command is denied and Claude reads "Use bar instead of foo." | ok | 0 | false | 0 | 0 |
| the user sees "Use bar instead of foo." | ok | 0 | false | 0 | 0 |

#### the user rule "no-foo" blocks bash commands that match "\bfoo\b"

```json
{
  "step_record_id": "step-20260903-215829-36w3",
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
  "scenario_record_id": "scn-20260903-215829-eikz",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:29.513Z",
  "finished_at": "2026-09-03T12:58:29.514Z",
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
      "at": "2026-09-03T12:58:29.513Z"
    }
  ]
}
```

#### Claude runs the bash command "foo --help"

```json
{
  "step_record_id": "step-20260903-215829-gfbz",
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
  "scenario_record_id": "scn-20260903-215829-eikz",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:29.515Z",
  "finished_at": "2026-09-03T12:58:29.817Z",
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
  "step_record_id": "step-20260903-215829-vzq4",
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
  "scenario_record_id": "scn-20260903-215829-eikz",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:29.819Z",
  "finished_at": "2026-09-03T12:58:29.819Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215829-gfbz",
      "step": "run-bash"
    }
  ]
}
```

#### the user sees "Use bar instead of foo."

```json
{
  "step_record_id": "step-20260903-215829-691h",
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
  "scenario_record_id": "scn-20260903-215829-eikz",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:29.821Z",
  "finished_at": "2026-09-03T12:58:29.821Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215829-gfbz",
      "step": "run-bash"
    }
  ]
}
```

### A warning user rule lets the call through and Claude reads a note (line 20)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "careful-foo" warns bash commands that match "\bfoo\b" | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "foo --help" | ok | 312 | false | 0 | 0 |
| the command is allowed | ok | 1 | false | 0 | 0 |
| Claude reads the note "foo is slow. Prefer bar." | ok | 1 | false | 0 | 0 |
| the user sees "foo is slow. Prefer bar." | ok | 0 | false | 0 | 0 |

#### the user rule "careful-foo" warns bash commands that match "\bfoo\b"

```json
{
  "step_record_id": "step-20260903-215829-0ge3",
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
  "scenario_record_id": "scn-20260903-215829-syv8",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:29.834Z",
  "finished_at": "2026-09-03T12:58:29.835Z",
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
      "at": "2026-09-03T12:58:29.834Z"
    }
  ]
}
```

#### Claude runs the bash command "foo --help"

```json
{
  "step_record_id": "step-20260903-215829-joxt",
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
  "scenario_record_id": "scn-20260903-215829-syv8",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:29.837Z",
  "finished_at": "2026-09-03T12:58:30.149Z",
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
  "step_record_id": "step-20260903-215830-eku9",
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
  "scenario_record_id": "scn-20260903-215829-syv8",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:30.150Z",
  "finished_at": "2026-09-03T12:58:30.151Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215829-joxt",
      "step": "run-bash"
    }
  ]
}
```

#### Claude reads the note "foo is slow. Prefer bar."

```json
{
  "step_record_id": "step-20260903-215830-fysn",
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
  "scenario_record_id": "scn-20260903-215829-syv8",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:30.151Z",
  "finished_at": "2026-09-03T12:58:30.152Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215829-joxt",
      "step": "run-bash"
    }
  ]
}
```

#### the user sees "foo is slow. Prefer bar."

```json
{
  "step_record_id": "step-20260903-215830-wilp",
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
  "scenario_record_id": "scn-20260903-215829-syv8",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:30.153Z",
  "finished_at": "2026-09-03T12:58:30.153Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215829-joxt",
      "step": "run-bash"
    }
  ]
}
```

### A command that no rule matches passes through untouched (line 30)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-foo" blocks bash commands that match "\bfoo\b" | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "ls -la" | ok | 286 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |

#### the user rule "no-foo" blocks bash commands that match "\bfoo\b"

```json
{
  "step_record_id": "step-20260903-215830-tpb1",
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
  "scenario_record_id": "scn-20260903-215830-tujn",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:30.166Z",
  "finished_at": "2026-09-03T12:58:30.167Z",
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
      "at": "2026-09-03T12:58:30.166Z"
    }
  ]
}
```

#### Claude runs the bash command "ls -la"

```json
{
  "step_record_id": "step-20260903-215830-640y",
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
  "scenario_record_id": "scn-20260903-215830-tujn",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:30.168Z",
  "finished_at": "2026-09-03T12:58:30.454Z",
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
  "step_record_id": "step-20260903-215830-0vbd",
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
  "scenario_record_id": "scn-20260903-215830-tujn",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:30.456Z",
  "finished_at": "2026-09-03T12:58:30.457Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215830-640y",
      "step": "run-bash"
    }
  ]
}
```

### With no rule directory at all the hook still answers (line 38)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| Claude runs the bash command "ls" | ok | 318 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |
| the hook exits with status 0 | ok | 1 | false | 0 | 0 |

#### Claude runs the bash command "ls"

```json
{
  "step_record_id": "step-20260903-215830-1vak",
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
  "scenario_record_id": "scn-20260903-215830-t8zo",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:30.474Z",
  "finished_at": "2026-09-03T12:58:30.792Z",
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
      "at": "2026-09-03T12:58:30.474Z"
    }
  ]
}
```

#### the hook returns nothing

```json
{
  "step_record_id": "step-20260903-215830-nk57",
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
  "scenario_record_id": "scn-20260903-215830-t8zo",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:30.797Z",
  "finished_at": "2026-09-03T12:58:30.798Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215830-1vak",
      "step": "run-bash"
    }
  ]
}
```

#### the hook exits with status 0

```json
{
  "step_record_id": "step-20260903-215830-aarl",
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
  "scenario_record_id": "scn-20260903-215830-t8zo",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:30.804Z",
  "finished_at": "2026-09-03T12:58:30.805Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215830-1vak",
      "step": "run-bash"
    }
  ]
}
```

### The reason names the rule above its message (line 43)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-foo" blocks bash commands that match "\bfoo\b" | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 323 | false | 0 | 0 |
| the denial reason is exactly | ok | 2 | false | 0 | 0 |

#### the user rule "no-foo" blocks bash commands that match "\bfoo\b"

```json
{
  "step_record_id": "step-20260903-215830-dd52",
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
  "scenario_record_id": "scn-20260903-215830-okib",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:30.824Z",
  "finished_at": "2026-09-03T12:58:30.826Z",
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
      "at": "2026-09-03T12:58:30.825Z"
    }
  ]
}
```

#### Claude runs the bash command "foo"

```json
{
  "step_record_id": "step-20260903-215830-o49l",
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
  "scenario_record_id": "scn-20260903-215830-okib",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:30.827Z",
  "finished_at": "2026-09-03T12:58:31.150Z",
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
  "step_record_id": "step-20260903-215831-gu1u",
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
  "scenario_record_id": "scn-20260903-215830-okib",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:31.153Z",
  "finished_at": "2026-09-03T12:58:31.155Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215830-o49l",
      "step": "run-bash"
    }
  ]
}
```

### Two blocking rules that both match are combined in file-name order (line 55)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "a-first" blocks bash commands that match "foo" | ok | 2 | true | 0 | 0 |
| the user rule "b-second" blocks bash commands that match "foo" | ok | 0 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 297 | false | 0 | 0 |
| the denial reason is exactly | ok | 0 | false | 0 | 0 |

#### the user rule "a-first" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260903-215831-t8xg",
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
  "scenario_record_id": "scn-20260903-215831-07gp",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:31.167Z",
  "finished_at": "2026-09-03T12:58:31.169Z",
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
      "at": "2026-09-03T12:58:31.167Z"
    }
  ]
}
```

#### the user rule "b-second" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260903-215831-2kdn",
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
  "scenario_record_id": "scn-20260903-215831-07gp",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:31.170Z",
  "finished_at": "2026-09-03T12:58:31.170Z",
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
  "step_record_id": "step-20260903-215831-gl2o",
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
  "scenario_record_id": "scn-20260903-215831-07gp",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:31.171Z",
  "finished_at": "2026-09-03T12:58:31.468Z",
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
  "step_record_id": "step-20260903-215831-x17y",
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
  "scenario_record_id": "scn-20260903-215831-07gp",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:31.469Z",
  "finished_at": "2026-09-03T12:58:31.469Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215831-gl2o",
      "step": "run-bash"
    }
  ]
}
```

### Matching ignores letter case (line 74)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-foo" blocks bash commands that match "foo" | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "FOO --help" | ok | 288 | false | 0 | 0 |
| the command is denied and Claude reads "Use bar instead of foo." | ok | 0 | false | 0 | 0 |

#### the user rule "no-foo" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260903-215831-vtkm",
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
  "scenario_record_id": "scn-20260903-215831-r182",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:31.481Z",
  "finished_at": "2026-09-03T12:58:31.482Z",
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
      "at": "2026-09-03T12:58:31.481Z"
    }
  ]
}
```

#### Claude runs the bash command "FOO --help"

```json
{
  "step_record_id": "step-20260903-215831-3chk",
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
  "scenario_record_id": "scn-20260903-215831-r182",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:31.483Z",
  "finished_at": "2026-09-03T12:58:31.771Z",
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
  "step_record_id": "step-20260903-215831-vas1",
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
  "scenario_record_id": "scn-20260903-215831-r182",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:31.773Z",
  "finished_at": "2026-09-03T12:58:31.773Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215831-3chk",
      "step": "run-bash"
    }
  ]
}
```

### A project rule fires from the project the hook input names (line 82)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the project rule "project-only" blocks bash commands that match "\bfoo\b" | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 290 | false | 0 | 0 |
| the command is denied and Claude reads "Project rule fired." | ok | 0 | false | 0 | 0 |

#### the project rule "project-only" blocks bash commands that match "\bfoo\b"

```json
{
  "step_record_id": "step-20260903-215831-bgbc",
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
  "scenario_record_id": "scn-20260903-215831-28wy",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:31.785Z",
  "finished_at": "2026-09-03T12:58:31.787Z",
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
      "at": "2026-09-03T12:58:31.785Z"
    }
  ]
}
```

#### Claude runs the bash command "foo"

```json
{
  "step_record_id": "step-20260903-215831-q8j2",
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
        "permissionDecisionReason": "**[project-only]**\nProject rule fired."
      },
      "systemMessage": "**[project-only]**\nProject rule fired."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215831-28wy",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:31.788Z",
  "finished_at": "2026-09-03T12:58:32.078Z",
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

#### the command is denied and Claude reads "Project rule fired."

```json
{
  "step_record_id": "step-20260903-215832-xyek",
  "step": "denied-with-reason",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "**[project-only]**\nProject rule fired."
      },
      "systemMessage": "**[project-only]**\nProject rule fired."
    },
    "text": "Project rule fired."
  },
  "result": {
    "decision": "deny",
    "reason": "**[project-only]**\nProject rule fired."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215831-28wy",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:32.079Z",
  "finished_at": "2026-09-03T12:58:32.079Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215831-q8j2",
      "step": "run-bash"
    }
  ]
}
```

### User rules come first, then project rules (line 90)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "from-user" blocks bash commands that match "foo" | ok | 1 | true | 0 | 0 |
| the project rule "from-project" blocks bash commands that match "foo" | ok | 0 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 343 | false | 0 | 0 |
| the denial reason is exactly | ok | 0 | false | 0 | 0 |

#### the user rule "from-user" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260903-215832-v8hb",
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
  "scenario_record_id": "scn-20260903-215832-sg3x",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:32.089Z",
  "finished_at": "2026-09-03T12:58:32.090Z",
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
      "at": "2026-09-03T12:58:32.089Z"
    }
  ]
}
```

#### the project rule "from-project" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260903-215832-gwv2",
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
  "scenario_record_id": "scn-20260903-215832-sg3x",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:32.091Z",
  "finished_at": "2026-09-03T12:58:32.091Z",
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
  "step_record_id": "step-20260903-215832-3b48",
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
        "permissionDecisionReason": "**[from-user]**\nFrom the user.\n\n**[from-project]**\nFrom the project."
      },
      "systemMessage": "**[from-user]**\nFrom the user.\n\n**[from-project]**\nFrom the project."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215832-sg3x",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:32.092Z",
  "finished_at": "2026-09-03T12:58:32.435Z",
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
  "step_record_id": "step-20260903-215832-bu6x",
  "step": "reason-is-exactly",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "**[from-user]**\nFrom the user.\n\n**[from-project]**\nFrom the project."
      },
      "systemMessage": "**[from-user]**\nFrom the user.\n\n**[from-project]**\nFrom the project."
    },
    "expected": "**[from-user]**\nFrom the user.\n\n**[from-project]**\nFrom the project."
  },
  "result": {
    "reason": "**[from-user]**\nFrom the user.\n\n**[from-project]**\nFrom the project."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215832-sg3x",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:32.439Z",
  "finished_at": "2026-09-03T12:58:32.439Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215832-3b48",
      "step": "run-bash"
    }
  ]
}
```

### A project rule with the same name replaces the user rule (line 109)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "shared" warns bash commands that match "foo" | ok | 2 | true | 0 | 0 |
| the project rule "shared" blocks bash commands that match "foo" | ok | 2 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 302 | false | 0 | 0 |
| the denial reason is exactly | ok | 1 | false | 0 | 0 |

#### the user rule "shared" warns bash commands that match "foo"

```json
{
  "step_record_id": "step-20260903-215832-3ugu",
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
  "scenario_record_id": "scn-20260903-215832-o1ch",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:32.458Z",
  "finished_at": "2026-09-03T12:58:32.460Z",
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
      "at": "2026-09-03T12:58:32.458Z"
    }
  ]
}
```

#### the project rule "shared" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260903-215832-ifdh",
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
  "scenario_record_id": "scn-20260903-215832-o1ch",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:32.466Z",
  "finished_at": "2026-09-03T12:58:32.468Z",
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
  "step_record_id": "step-20260903-215832-ctke",
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
        "permissionDecisionReason": "**[shared]**\nproject version"
      },
      "systemMessage": "**[shared]**\nproject version"
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215832-o1ch",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:32.478Z",
  "finished_at": "2026-09-03T12:58:32.780Z",
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
  "step_record_id": "step-20260903-215832-fg6f",
  "step": "reason-is-exactly",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": "**[shared]**\nproject version"
      },
      "systemMessage": "**[shared]**\nproject version"
    },
    "expected": "**[shared]**\nproject version"
  },
  "result": {
    "reason": "**[shared]**\nproject version"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215832-o1ch",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:32.781Z",
  "finished_at": "2026-09-03T12:58:32.782Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215832-ctke",
      "step": "run-bash"
    }
  ]
}
```

### A disabled project rule switches the user rule off in that project (line 125)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "shared" blocks bash commands that match "foo" | ok | 1 | true | 0 | 0 |
| the project rule "shared" is disabled | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 275 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |

#### the user rule "shared" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260903-215832-drq4",
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
  "scenario_record_id": "scn-20260903-215832-xidb",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:32.794Z",
  "finished_at": "2026-09-03T12:58:32.795Z",
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
      "at": "2026-09-03T12:58:32.794Z"
    }
  ]
}
```

#### the project rule "shared" is disabled

```json
{
  "step_record_id": "step-20260903-215832-18gc",
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
  "scenario_record_id": "scn-20260903-215832-xidb",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:32.796Z",
  "finished_at": "2026-09-03T12:58:32.797Z",
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
  "step_record_id": "step-20260903-215832-1mpd",
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
  "scenario_record_id": "scn-20260903-215832-xidb",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:32.797Z",
  "finished_at": "2026-09-03T12:58:33.072Z",
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
  "step_record_id": "step-20260903-215833-4inl",
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
  "scenario_record_id": "scn-20260903-215832-xidb",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:33.073Z",
  "finished_at": "2026-09-03T12:58:33.074Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215832-1mpd",
      "step": "run-bash"
    }
  ]
}
```

### The rules directory can be moved with STEERHOOK_RULES_DIR (line 134)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-foo" blocks bash commands that match "foo" | ok | 2 | true | 0 | 0 |
| the user rules are moved to a directory named by STEERHOOK_RULES_DIR | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 263 | false | 0 | 0 |
| the command is denied and Claude reads "Use bar instead of foo." | ok | 0 | false | 0 | 0 |

#### the user rule "no-foo" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260903-215833-2dy0",
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
  "scenario_record_id": "scn-20260903-215833-eqtc",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:33.086Z",
  "finished_at": "2026-09-03T12:58:33.088Z",
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
      "at": "2026-09-03T12:58:33.086Z"
    }
  ]
}
```

#### the user rules are moved to a directory named by STEERHOOK_RULES_DIR

```json
{
  "step_record_id": "step-20260903-215833-vt4s",
  "step": "rules-dir-override",
  "kind": "run",
  "args": {},
  "result": {
    "dir": "<sandbox>/rules-elsewhere"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215833-eqtc",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:33.089Z",
  "finished_at": "2026-09-03T12:58:33.090Z",
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
  "step_record_id": "step-20260903-215833-6zjc",
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
  "scenario_record_id": "scn-20260903-215833-eqtc",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:33.091Z",
  "finished_at": "2026-09-03T12:58:33.354Z",
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
  "step_record_id": "step-20260903-215833-3pbo",
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
  "scenario_record_id": "scn-20260903-215833-eqtc",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:33.356Z",
  "finished_at": "2026-09-03T12:58:33.356Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215833-6zjc",
      "step": "run-bash"
    }
  ]
}
```

### A bash rule does not look at file edits (line 143)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-foo" blocks bash commands that match "foo" | ok | 2 | true | 0 | 0 |
| Claude edits the file "notes.md" to add "foo" | ok | 274 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |

#### the user rule "no-foo" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260903-215833-gfq0",
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
  "scenario_record_id": "scn-20260903-215833-gxo1",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:33.370Z",
  "finished_at": "2026-09-03T12:58:33.372Z",
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
      "at": "2026-09-03T12:58:33.371Z"
    }
  ]
}
```

#### Claude edits the file "notes.md" to add "foo"

```json
{
  "step_record_id": "step-20260903-215833-egi8",
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
  "scenario_record_id": "scn-20260903-215833-gxo1",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:33.374Z",
  "finished_at": "2026-09-03T12:58:33.648Z",
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
  "step_record_id": "step-20260903-215833-z2la",
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
  "scenario_record_id": "scn-20260903-215833-gxo1",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:33.649Z",
  "finished_at": "2026-09-03T12:58:33.650Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215833-egi8",
      "step": "edit-file"
    }
  ]
}
```

### A file rule warns about an edit (line 151)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-console-log" warns file edits that match "console\.log\(" | ok | 1 | true | 0 | 0 |
| Claude edits the file "app.ts" to add "console.log(x)" | ok | 263 | false | 0 | 0 |
| the command is allowed | ok | 1 | false | 0 | 0 |
| Claude reads the note "Use the logger." | ok | 0 | false | 0 | 0 |

#### the user rule "no-console-log" warns file edits that match "console\.log\("

```json
{
  "step_record_id": "step-20260903-215833-92ey",
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
  "scenario_record_id": "scn-20260903-215833-3sjk",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:33.661Z",
  "finished_at": "2026-09-03T12:58:33.662Z",
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
      "at": "2026-09-03T12:58:33.661Z"
    }
  ]
}
```

#### Claude edits the file "app.ts" to add "console.log(x)"

```json
{
  "step_record_id": "step-20260903-215833-m4nq",
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
  "scenario_record_id": "scn-20260903-215833-3sjk",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:33.663Z",
  "finished_at": "2026-09-03T12:58:33.926Z",
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
  "step_record_id": "step-20260903-215833-dvh9",
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
  "scenario_record_id": "scn-20260903-215833-3sjk",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:33.927Z",
  "finished_at": "2026-09-03T12:58:33.928Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215833-m4nq",
      "step": "edit-file"
    }
  ]
}
```

#### Claude reads the note "Use the logger."

```json
{
  "step_record_id": "step-20260903-215833-glwo",
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
  "scenario_record_id": "scn-20260903-215833-3sjk",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:33.929Z",
  "finished_at": "2026-09-03T12:58:33.929Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215833-m4nq",
      "step": "edit-file"
    }
  ]
}
```

### A command that spans lines is matched as one text (line 160)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-sleep-loop" blocks bash commands that match "\b(until\|while)\b[\s\S]*\bsleep\b" | ok | 1 | true | 0 | 0 |
| Claude runs this bash command | ok | 256 | false | 0 | 0 |
| the command is denied and Claude reads "Do not wait with a loop." | ok | 1 | false | 0 | 0 |

#### the user rule "no-sleep-loop" blocks bash commands that match "\b(until|while)\b[\s\S]*\bsleep\b"

```json
{
  "step_record_id": "step-20260903-215833-htst",
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
  "scenario_record_id": "scn-20260903-215833-pyov",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:33.939Z",
  "finished_at": "2026-09-03T12:58:33.940Z",
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
      "at": "2026-09-03T12:58:33.939Z"
    }
  ]
}
```

#### Claude runs this bash command

```json
{
  "step_record_id": "step-20260903-215833-y2ey",
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
  "scenario_record_id": "scn-20260903-215833-pyov",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:33.941Z",
  "finished_at": "2026-09-03T12:58:34.197Z",
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
  "step_record_id": "step-20260903-215834-sc78",
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
  "scenario_record_id": "scn-20260903-215833-pyov",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:34.198Z",
  "finished_at": "2026-09-03T12:58:34.199Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215833-y2ey",
      "step": "run-bash-block"
    }
  ]
}
```

## Declared vs observed

No step declared `mutates: false` and was measured making a write.
