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
