---
feature: features/stop-and-prompt.feature
commit: 8ab83d6aa493d65a233c00951258136e7ae81851
run_id: run-20260904-061445-tm20
ran_at: 2026-09-04T06:15:02.323+09:00
accepted_at: 2026-09-04T06:15:20.072+09:00
environment: default
browser: none
scenarios:
  - name: A stop rule refuses to stop and tells Claude why
    line: 7
    scenario_record_id: scn-20260904-061502-i7zq
  - name: The stop rule lets Claude stop once the transcript shows the tests
    line: 29
    scenario_record_id: scn-20260904-061502-4efz
  - name: A prompt rule adds context beside the prompt
    line: 51
    scenario_record_id: scn-20260904-061503-8f60
  - name: A blocking prompt rule rejects the prompt and tells the user
    line: 70
    scenario_record_id: scn-20260904-061503-fwt6
---

# Rules for stopping and for prompts: green at 8ab83d6

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
| Claude tries to stop with this transcript | ok | 380 | false | 0 | 0 |
| the stop is refused and Claude reads "Run the tests before you stop." | ok | 1 | false | 0 | 0 |

#### the user rule file "require-tests.md" contains

```json
{
  "step_record_id": "step-20260904-061502-gnml",
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
  "scenario_record_id": "scn-20260904-061502-i7zq",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:02.324Z",
  "finished_at": "2026-09-03T21:15:02.325Z",
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
      "at": "2026-09-03T21:15:02.324Z"
    }
  ]
}
```

#### Claude tries to stop with this transcript

```json
{
  "step_record_id": "step-20260904-061502-v0k7",
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
  "scenario_record_id": "scn-20260904-061502-i7zq",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:02.327Z",
  "finished_at": "2026-09-03T21:15:02.707Z",
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
  "step_record_id": "step-20260904-061502-jhyb",
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
  "scenario_record_id": "scn-20260904-061502-i7zq",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:02.709Z",
  "finished_at": "2026-09-03T21:15:02.710Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061502-v0k7",
      "step": "stop"
    }
  ]
}
```

### The stop rule lets Claude stop once the transcript shows the tests (line 29)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "require-tests.md" contains | ok | 2 | true | 0 | 0 |
| Claude tries to stop with this transcript | ok | 371 | false | 0 | 0 |
| the hook returns nothing | ok | 1 | false | 0 | 0 |

#### the user rule file "require-tests.md" contains

```json
{
  "step_record_id": "step-20260904-061502-cpq9",
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
  "scenario_record_id": "scn-20260904-061502-4efz",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:02.724Z",
  "finished_at": "2026-09-03T21:15:02.726Z",
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
      "at": "2026-09-03T21:15:02.725Z"
    }
  ]
}
```

#### Claude tries to stop with this transcript

```json
{
  "step_record_id": "step-20260904-061502-wndc",
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
  "scenario_record_id": "scn-20260904-061502-4efz",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:02.729Z",
  "finished_at": "2026-09-03T21:15:03.100Z",
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
  "step_record_id": "step-20260904-061503-id83",
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
  "scenario_record_id": "scn-20260904-061502-4efz",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:03.102Z",
  "finished_at": "2026-09-03T21:15:03.103Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061502-wndc",
      "step": "stop"
    }
  ]
}
```

### A prompt rule adds context beside the prompt (line 51)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "deploy-checklist.md" contains | ok | 2 | true | 0 | 0 |
| the user submits the prompt "please deploy to production now" | ok | 368 | false | 0 | 0 |
| Claude reads the note "Check the monitoring dashboard first." | ok | 1 | false | 0 | 0 |

#### the user rule file "deploy-checklist.md" contains

```json
{
  "step_record_id": "step-20260904-061503-e98z",
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
  "scenario_record_id": "scn-20260904-061503-8f60",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:03.119Z",
  "finished_at": "2026-09-03T21:15:03.121Z",
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
      "at": "2026-09-03T21:15:03.119Z"
    }
  ]
}
```

#### the user submits the prompt "please deploy to production now"

```json
{
  "step_record_id": "step-20260904-061503-6xf3",
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
  "scenario_record_id": "scn-20260904-061503-8f60",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:03.123Z",
  "finished_at": "2026-09-03T21:15:03.491Z",
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
  "step_record_id": "step-20260904-061503-0nhm",
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
  "scenario_record_id": "scn-20260904-061503-8f60",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:03.492Z",
  "finished_at": "2026-09-03T21:15:03.493Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061503-6xf3",
      "step": "submit-prompt"
    }
  ]
}
```

### A blocking prompt rule rejects the prompt and tells the user (line 70)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule file "no-deploy.md" contains | ok | 1 | true | 0 | 0 |
| the user submits the prompt "please deploy to production now" | ok | 347 | false | 0 | 0 |
| the prompt is rejected and the user sees "Not from this session." | ok | 1 | false | 0 | 0 |

#### the user rule file "no-deploy.md" contains

```json
{
  "step_record_id": "step-20260904-061503-jyo2",
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
  "scenario_record_id": "scn-20260904-061503-fwt6",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:03.505Z",
  "finished_at": "2026-09-03T21:15:03.506Z",
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
      "at": "2026-09-03T21:15:03.505Z"
    }
  ]
}
```

#### the user submits the prompt "please deploy to production now"

```json
{
  "step_record_id": "step-20260904-061503-jy4e",
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
  "scenario_record_id": "scn-20260904-061503-fwt6",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:03.508Z",
  "finished_at": "2026-09-03T21:15:03.855Z",
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
  "step_record_id": "step-20260904-061503-0yrs",
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
  "scenario_record_id": "scn-20260904-061503-fwt6",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:15:03.857Z",
  "finished_at": "2026-09-03T21:15:03.858Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061503-jy4e",
      "step": "submit-prompt"
    }
  ]
}
```

## Declared vs observed

No step declared `mutates: false` and was measured making a write.
