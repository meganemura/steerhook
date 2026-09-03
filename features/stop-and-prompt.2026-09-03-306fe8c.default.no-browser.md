---
feature: features/stop-and-prompt.feature
commit: 306fe8c9e049895f4c1a4d65f81a8d5679c30a7a
run_id: run-20260903-215826-yk71
ran_at: 2026-09-03T21:58:36.755+09:00
accepted_at: 2026-09-03T21:58:49.412+09:00
environment: default
browser: none
scenarios:
  - name: A stop rule refuses to stop and tells Claude why
    line: 7
    scenario_record_id: scn-20260903-215836-nllu
  - name: The stop rule lets Claude stop once the transcript shows the tests
    line: 29
    scenario_record_id: scn-20260903-215837-u3x4
  - name: A prompt rule adds context beside the prompt
    line: 51
    scenario_record_id: scn-20260903-215837-s8a3
  - name: A blocking prompt rule rejects the prompt and tells the user
    line: 70
    scenario_record_id: scn-20260903-215837-ihzk
---

# Rules for stopping and for prompts: green at 306fe8c

## Condition

- environment: default
- browser: not launched (no step in this run destructured page/context)

## The scenario as it ran

```gherkin
Feature: Rules for stopping and for prompts

  A stop rule runs when Claude wants to end its turn and can read the session
  transcript. A prompt rule runs when the user submits a prompt. Both use the
  conditions form: the simple pattern field is for bash and file rules.

  Scenario: A stop rule refuses to stop and tells Claude why
    Given the user rule file "require-tests.md" contains
      """
      ---
      name: require-tests
      enabled: true
      event: stop
      action: block
      conditions:
        - field: transcript
          operator: not_contains
          pattern: python3 -m unittest
      ---

      Run the tests before you stop.
      """
    When Claude tries to stop with this transcript
      """
      {"type":"assistant","text":"I edited the file."}
      """
    Then the stop is refused and Claude reads "Run the tests before you stop."

  Scenario: The stop rule lets Claude stop once the transcript shows the tests
    Given the user rule file "require-tests.md" contains
      """
      ---
      name: require-tests
      enabled: true
      event: stop
      action: block
      conditions:
        - field: transcript
          operator: not_contains
          pattern: python3 -m unittest
      ---

      Run the tests before you stop.
      """
    When Claude tries to stop with this transcript
      """
      {"type":"assistant","text":"Ran python3 -m unittest: OK"}
      """
    Then the hook returns nothing

  Scenario: A prompt rule adds context beside the prompt
    Given the user rule file "deploy-checklist.md" contains
      """
      ---
      name: deploy-checklist
      enabled: true
      event: prompt
      action: warn
      conditions:
        - field: user_prompt
          operator: contains
          pattern: deploy to production
      ---

      Check the monitoring dashboard first.
      """
    When the user submits the prompt "please deploy to production now"
    Then Claude reads the note "Check the monitoring dashboard first."

  Scenario: A blocking prompt rule rejects the prompt and tells the user
    Given the user rule file "no-deploy.md" contains
      """
      ---
      name: no-deploy
      enabled: true
      event: prompt
      action: block
      conditions:
        - field: user_prompt
          operator: contains
          pattern: deploy to production
      ---

      Not from this session.
      """
    When the user submits the prompt "please deploy to production now"
    Then the prompt is rejected and the user sees "Not from this session."
```

## What the tool measured

Evidence fields are stripped from every record below: evidence. They stay under the state directory with the trace and the screenshots, and are not committed.

### A stop rule refuses to stop and tells Claude why (line 7)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "require-tests.md" contains | ok | 1 | true | 0 | 0 |
| Claude tries to stop with this transcript | ok | 281 | false | 0 | 0 |
| the stop is refused and Claude reads "Run the tests before you stop." | ok | 1 | false | 0 | 0 |

#### the user rule file "require-tests.md" contains

```json
{
  "step_record_id": "step-20260903-215836-rf20",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "require-tests.md",
    "content": "---\nname: require-tests\nenabled: true\nevent: stop\naction: block\nconditions:\n  - field: transcript\n    operator: not_contains\n    pattern: python3 -m unittest\n---\n\nRun the tests before you stop."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/require-tests.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215836-nllu",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:36.756Z",
  "finished_at": "2026-09-03T12:58:36.757Z",
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
      "at": "2026-09-03T12:58:36.756Z"
    }
  ]
}
```

#### Claude tries to stop with this transcript

```json
{
  "step_record_id": "step-20260903-215836-0vy3",
  "step": "stop",
  "kind": "run",
  "args": {
    "transcript": "{\"type\":\"assistant\",\"text\":\"I edited the file.\"}"
  },
  "result": {
    "exit_code": 0,
    "output": {
      "decision": "block",
      "reason": "**[require-tests]**\nRun the tests before you stop.",
      "systemMessage": "**[require-tests]**\nRun the tests before you stop."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215836-nllu",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:36.758Z",
  "finished_at": "2026-09-03T12:58:37.039Z",
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

#### the stop is refused and Claude reads "Run the tests before you stop."

```json
{
  "step_record_id": "step-20260903-215837-loe9",
  "step": "stop-refused",
  "kind": "run",
  "args": {
    "output": {
      "decision": "block",
      "reason": "**[require-tests]**\nRun the tests before you stop.",
      "systemMessage": "**[require-tests]**\nRun the tests before you stop."
    },
    "text": "Run the tests before you stop."
  },
  "result": {
    "reason": "**[require-tests]**\nRun the tests before you stop."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215836-nllu",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:37.040Z",
  "finished_at": "2026-09-03T12:58:37.041Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215836-0vy3",
      "step": "stop"
    }
  ]
}
```

### The stop rule lets Claude stop once the transcript shows the tests (line 29)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "require-tests.md" contains | ok | 1 | true | 0 | 0 |
| Claude tries to stop with this transcript | ok | 292 | false | 0 | 0 |
| the hook returns nothing | ok | 0 | false | 0 | 0 |

#### the user rule file "require-tests.md" contains

```json
{
  "step_record_id": "step-20260903-215837-fsns",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "require-tests.md",
    "content": "---\nname: require-tests\nenabled: true\nevent: stop\naction: block\nconditions:\n  - field: transcript\n    operator: not_contains\n    pattern: python3 -m unittest\n---\n\nRun the tests before you stop."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/require-tests.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215837-u3x4",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:37.053Z",
  "finished_at": "2026-09-03T12:58:37.054Z",
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
      "at": "2026-09-03T12:58:37.053Z"
    }
  ]
}
```

#### Claude tries to stop with this transcript

```json
{
  "step_record_id": "step-20260903-215837-ofhu",
  "step": "stop",
  "kind": "run",
  "args": {
    "transcript": "{\"type\":\"assistant\",\"text\":\"Ran python3 -m unittest: OK\"}"
  },
  "result": {
    "exit_code": 0,
    "output": {}
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215837-u3x4",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:37.055Z",
  "finished_at": "2026-09-03T12:58:37.347Z",
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
  "step_record_id": "step-20260903-215837-8gb1",
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
  "scenario_record_id": "scn-20260903-215837-u3x4",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:37.349Z",
  "finished_at": "2026-09-03T12:58:37.349Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215837-ofhu",
      "step": "stop"
    }
  ]
}
```

### A prompt rule adds context beside the prompt (line 51)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "deploy-checklist.md" contains | ok | 2 | true | 0 | 0 |
| the user submits the prompt "please deploy to production now" | ok | 288 | false | 0 | 0 |
| Claude reads the note "Check the monitoring dashboard first." | ok | 0 | false | 0 | 0 |

#### the user rule file "deploy-checklist.md" contains

```json
{
  "step_record_id": "step-20260903-215837-vvew",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "deploy-checklist.md",
    "content": "---\nname: deploy-checklist\nenabled: true\nevent: prompt\naction: warn\nconditions:\n  - field: user_prompt\n    operator: contains\n    pattern: deploy to production\n---\n\nCheck the monitoring dashboard first."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/deploy-checklist.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215837-s8a3",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:37.363Z",
  "finished_at": "2026-09-03T12:58:37.365Z",
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
      "at": "2026-09-03T12:58:37.364Z"
    }
  ]
}
```

#### the user submits the prompt "please deploy to production now"

```json
{
  "step_record_id": "step-20260903-215837-436i",
  "step": "submit-prompt",
  "kind": "run",
  "args": {
    "prompt": "please deploy to production now"
  },
  "result": {
    "exit_code": 0,
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "UserPromptSubmit",
        "additionalContext": "**[deploy-checklist]**\nCheck the monitoring dashboard first."
      },
      "systemMessage": "**[deploy-checklist]**\nCheck the monitoring dashboard first."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215837-s8a3",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:37.366Z",
  "finished_at": "2026-09-03T12:58:37.654Z",
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

#### Claude reads the note "Check the monitoring dashboard first."

```json
{
  "step_record_id": "step-20260903-215837-loca",
  "step": "claude-reads-note",
  "kind": "run",
  "args": {
    "output": {
      "hookSpecificOutput": {
        "hookEventName": "UserPromptSubmit",
        "additionalContext": "**[deploy-checklist]**\nCheck the monitoring dashboard first."
      },
      "systemMessage": "**[deploy-checklist]**\nCheck the monitoring dashboard first."
    },
    "text": "Check the monitoring dashboard first."
  },
  "result": {
    "context": "**[deploy-checklist]**\nCheck the monitoring dashboard first."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215837-s8a3",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:37.655Z",
  "finished_at": "2026-09-03T12:58:37.655Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215837-436i",
      "step": "submit-prompt"
    }
  ]
}
```

### A blocking prompt rule rejects the prompt and tells the user (line 70)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "no-deploy.md" contains | ok | 2 | true | 0 | 0 |
| the user submits the prompt "please deploy to production now" | ok | 287 | false | 0 | 0 |
| the prompt is rejected and the user sees "Not from this session." | ok | 1 | false | 0 | 0 |

#### the user rule file "no-deploy.md" contains

```json
{
  "step_record_id": "step-20260903-215837-v9g5",
  "step": "user-rule-file",
  "kind": "run",
  "args": {
    "file": "no-deploy.md",
    "content": "---\nname: no-deploy\nenabled: true\nevent: prompt\naction: block\nconditions:\n  - field: user_prompt\n    operator: contains\n    pattern: deploy to production\n---\n\nNot from this session."
  },
  "result": {
    "file": "<sandbox>/home/.claude/steerhook/no-deploy.md"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215837-ihzk",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:37.670Z",
  "finished_at": "2026-09-03T12:58:37.672Z",
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
      "at": "2026-09-03T12:58:37.670Z"
    }
  ]
}
```

#### the user submits the prompt "please deploy to production now"

```json
{
  "step_record_id": "step-20260903-215837-dcyc",
  "step": "submit-prompt",
  "kind": "run",
  "args": {
    "prompt": "please deploy to production now"
  },
  "result": {
    "exit_code": 0,
    "output": {
      "decision": "block",
      "reason": "**[no-deploy]**\nNot from this session."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215837-ihzk",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:37.673Z",
  "finished_at": "2026-09-03T12:58:37.960Z",
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

#### the prompt is rejected and the user sees "Not from this session."

```json
{
  "step_record_id": "step-20260903-215837-fzw9",
  "step": "prompt-rejected",
  "kind": "run",
  "args": {
    "output": {
      "decision": "block",
      "reason": "**[no-deploy]**\nNot from this session."
    },
    "text": "Not from this session."
  },
  "result": {
    "reason": "**[no-deploy]**\nNot from this session."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260903-215837-ihzk",
  "run_id": "run-20260903-215826-yk71",
  "started_at": "2026-09-03T12:58:37.962Z",
  "finished_at": "2026-09-03T12:58:37.963Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260903-215837-dcyc",
      "step": "submit-prompt"
    }
  ]
}
```

## Declared vs observed

No step declared `mutates: false` and was measured making a write.
