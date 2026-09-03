---
feature: features/launcher.feature
commit: 8ab83d6aa493d65a233c00951258136e7ae81851
run_id: run-20260904-061445-tm20
ran_at: 2026-09-04T06:14:49.986+09:00
accepted_at: 2026-09-04T06:15:15.278+09:00
environment: default
browser: none
scenarios:
  - name: Without a usable node the hook tells the user and lets the call through
    line: 9
    scenario_record_id: scn-20260904-061449-l847
---

# Finding node: green at 8ab83d6

## Condition

- environment: default
- browser: not launched (no step in this run destructured page/context)

## The scenario as it ran

```gherkin
Feature: Finding node

  The hooks run on node. Claude Code starts a hook with the PATH of the
  process that launched it, and a launch from a GUI can carry a PATH without
  node. The launcher looks in the usual install places, or takes the node
  that STEERHOOK_NODE names. When it finds none, it tells the user on the
  spot instead of letting the rules go quiet.

  Scenario: Without a usable node the hook tells the user and lets the call through
    Given the user rule "no-foo" blocks bash commands that match "foo"
      """
      Use bar instead of foo.
      """
    And STEERHOOK_NODE names a node that does not exist
    When Claude runs the bash command "foo"
    Then the command is allowed
    And the user sees "no rule was applied to this call"
    And the hook exits with status 0
```

## What the tool measured

Evidence fields are stripped from every record below: evidence. They stay under the state directory with the trace and the screenshots, and are not committed.

### Without a usable node the hook tells the user and lets the call through (line 9)

| step | status | ms | mutates | reads | writes |
| --- | --- | --- | --- | --- | --- |
| the user rule "no-foo" blocks bash commands that match "foo" | ok | 1 | true | 0 | 0 |
| STEERHOOK_NODE names a node that does not exist | ok | 1 | true | 0 | 0 |
| Claude runs the bash command "foo" | ok | 183 | false | 0 | 0 |
| the command is allowed | ok | 1 | false | 0 | 0 |
| the user sees "no rule was applied to this call" | ok | 1 | false | 0 | 0 |
| the hook exits with status 0 | ok | 1 | false | 0 | 0 |

#### the user rule "no-foo" blocks bash commands that match "foo"

```json
{
  "step_record_id": "step-20260904-061449-623r",
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
  "scenario_record_id": "scn-20260904-061449-l847",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:49.987Z",
  "finished_at": "2026-09-03T21:14:49.988Z",
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
      "at": "2026-09-03T21:14:49.987Z"
    }
  ]
}
```

#### STEERHOOK_NODE names a node that does not exist

```json
{
  "step_record_id": "step-20260904-061449-g60b",
  "step": "node-override-missing",
  "kind": "run",
  "args": {},
  "result": {
    "node": "<sandbox>/no-such-node"
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061449-l847",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:49.989Z",
  "finished_at": "2026-09-03T21:14:49.990Z",
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
  "step_record_id": "step-20260904-061449-p9o6",
  "step": "run-bash",
  "kind": "run",
  "args": {
    "command": "foo"
  },
  "result": {
    "exit_code": 0,
    "output": {
      "systemMessage": "steerhook: STEERHOOK_NODE names <sandbox>/no-such-node, which is not an executable, so no rule was applied to this call."
    }
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061449-l847",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:49.990Z",
  "finished_at": "2026-09-03T21:14:50.173Z",
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
  "step_record_id": "step-20260904-061450-n33o",
  "step": "allowed",
  "kind": "run",
  "args": {
    "output": {
      "systemMessage": "steerhook: STEERHOOK_NODE names <sandbox>/no-such-node, which is not an executable, so no rule was applied to this call."
    }
  },
  "result": {
    "permission_decision": null
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061449-l847",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:50.174Z",
  "finished_at": "2026-09-03T21:14:50.175Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061449-p9o6",
      "step": "run-bash"
    }
  ]
}
```

#### the user sees "no rule was applied to this call"

```json
{
  "step_record_id": "step-20260904-061450-8tmt",
  "step": "user-sees",
  "kind": "run",
  "args": {
    "output": {
      "systemMessage": "steerhook: STEERHOOK_NODE names <sandbox>/no-such-node, which is not an executable, so no rule was applied to this call."
    },
    "text": "no rule was applied to this call"
  },
  "result": {
    "system_message": "steerhook: STEERHOOK_NODE names <sandbox>/no-such-node, which is not an executable, so no rule was applied to this call."
  },
  "status": "ok",
  "environment": "default",
  "session": null,
  "scenario_record_id": "scn-20260904-061449-l847",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:50.176Z",
  "finished_at": "2026-09-03T21:14:50.177Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061449-p9o6",
      "step": "run-bash"
    }
  ]
}
```

#### the hook exits with status 0

```json
{
  "step_record_id": "step-20260904-061450-5htq",
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
  "scenario_record_id": "scn-20260904-061449-l847",
  "run_id": "run-20260904-061445-tm20",
  "started_at": "2026-09-03T21:14:50.178Z",
  "finished_at": "2026-09-03T21:14:50.179Z",
  "observed": {
    "http_reads": 0,
    "http_writes": 0
  },
  "mutates": false,
  "used": [
    {
      "step_record_id": "step-20260904-061449-p9o6",
      "step": "run-bash"
    }
  ]
}
```

## Declared vs observed

No step declared `mutates: false` and was measured making a write.
