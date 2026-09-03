Feature: Reading rule files

  A rule is one markdown file: frontmatter between two --- lines, then the
  message. steerhook parses the frontmatter itself, without a YAML library, so
  these scenarios pin what that parser accepts.

  Scenario: A pattern in matching quotes loses that one pair
    Given the user rule file "quoted.md" contains
      """
      ---
      name: quoted
      enabled: true
      event: bash
      pattern: "\bfoo\b"
      action: block
      ---

      Quoted pattern matched.
      """
    When Claude runs the bash command "foo"
    Then the command is denied and Claude reads "Quoted pattern matched."

  Scenario: A pattern wrapped in a group keeps the quotes inside it
    Given the user rule file "backtick.md" contains
      """
      ---
      name: backtick-in-double-quotes
      enabled: true
      event: bash
      pattern: (?:"[^"\n]*`[^"\n]*")
      action: warn
      ---

      A backtick inside double quotes is a command substitution.
      """
    When Claude runs the bash command "echo \"today is `date`\""
    Then Claude reads the note "A backtick inside double quotes is a command substitution."

  Scenario: The same pattern stays quiet for a backtick outside double quotes
    Given the user rule file "backtick.md" contains
      """
      ---
      name: backtick-in-double-quotes
      enabled: true
      event: bash
      pattern: (?:"[^"\n]*`[^"\n]*")
      action: warn
      ---

      A backtick inside double quotes is a command substitution.
      """
    When Claude runs the bash command "echo 'no `dq` here'"
    Then the hook returns nothing

  Scenario: A rule with enabled false never fires
    Given the user rule file "off.md" contains
      """
      ---
      name: off
      enabled: false
      event: bash
      pattern: foo
      action: block
      ---

      Never.
      """
    When Claude runs the bash command "foo"
    Then the hook returns nothing

  Scenario: A file without frontmatter is skipped and the hook still answers
    Given the user rule file "notes.md" contains
      """
      Just some notes. No frontmatter.
      """
    And the user rule "no-foo" blocks bash commands that match "foo"
      """
      Use bar instead of foo.
      """
    When Claude runs the bash command "foo"
    Then the command is denied and Claude reads "Use bar instead of foo."
    And the hook exits with status 0

  Scenario: A rule with conditions fires when every condition matches
    Given the user rule file "env-edit.md" contains
      """
      ---
      name: env-edit
      enabled: true
      event: file
      action: warn
      conditions:
        - field: file_path
          operator: regex_match
          pattern: \.env$
        - field: new_text
          operator: contains
          pattern: KEY
      ---

      Keep secrets out of .env edits.
      """
    When Claude edits the file ".env" to add "API_KEY=1"
    Then Claude reads the note "Keep secrets out of .env edits."

  Scenario: A rule with conditions stays quiet when one condition fails
    Given the user rule file "env-edit.md" contains
      """
      ---
      name: env-edit
      enabled: true
      event: file
      action: warn
      conditions:
        - field: file_path
          operator: regex_match
          pattern: \.env$
        - field: new_text
          operator: contains
          pattern: KEY
      ---

      Keep secrets out of .env edits.
      """
    When Claude edits the file "README.md" to add "API_KEY=1"
    Then the hook returns nothing

  Scenario: A rule for all events fires on a bash command through a condition
    Given the user rule file "everywhere.md" contains
      """
      ---
      name: everywhere
      enabled: true
      event: all
      action: warn
      conditions:
        - field: command
          operator: contains
          pattern: sudo
      ---

      Think before sudo.
      """
    When Claude runs the bash command "sudo ls"
    Then Claude reads the note "Think before sudo."
