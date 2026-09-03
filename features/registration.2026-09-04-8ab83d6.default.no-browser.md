---
feature: features/registration.feature
commit: 8ab83d6aa493d65a233c00951258136e7ae81851
run_id: run-20260904-061445-tm20
ran_at: 2026-09-04T06:14:59.054+09:00
accepted_at: 2026-09-04T06:15:17.825+09:00
environment: default
browser: none
scenarios:
  - name: The plugin registers three events, each with a script that exists
    line: 6
    scenario_record_id: scn-20260904-061459-w3z3
---

# Hook registration: green at 8ab83d6

## Condition

- environment: default
- browser: not launched (no step in this run destructured page/context)

## The scenario as it ran

```gherkin
Feature: Hook registration

  hooks.json is what Claude Code reads to know which events the plugin
  handles and which command to run for each.

  Scenario: The plugin registers three events, each with a script that exists
    Then the plugin registers hooks for these events
      | PreToolUse       |
      | Stop             |
      | UserPromptSubmit |
```

## What the tool measured

Evidence fields are stripped from every record below: evidence. They stay under the state directory with the trace and the screenshots, and are not committed.

### The plugin registers three events, each with a script that exists (line 6)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the plugin registers hooks for these events | ok | 2 | false | 0 | 0 |

#### the plugin registers hooks for these events

```json
{
  "step_record_id": "step-20260904-061459-0atu",
  "step": "registered-events",
  "kind": "run",
  "args": {
    "events": [
      [
        "PreToolUse"
      ],
      [
        "Stop"
      ],
      [
        "UserPromptSubmit"
      ]
    ]
  },
  "result": {
    "events": [
      "PreToolUse",
      "Stop",
      "UserPromptSubmit"
    ],
    "scripts": [
      "hooks/run.sh",
      "hooks/run.sh",
      "hooks/run.sh"
    ]
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061459-w3z3",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:59.055Z",
  "finished_at": "2026-09-03T21:14:59.057Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false
}
```

## Declared vs observed

No step declared `mutates: false` and was measured making a write.
