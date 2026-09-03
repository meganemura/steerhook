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
