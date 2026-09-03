Feature: Hook registration

  hooks.json is what Claude Code reads to know which events the plugin
  handles and which command to run for each.

  Scenario: The plugin registers three events, each with a script that exists
    Then the plugin registers hooks for these events
      | PreToolUse       |
      | Stop             |
      | UserPromptSubmit |
