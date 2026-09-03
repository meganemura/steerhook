Feature: The author's own rules

  These four rules live in the author's ~/.claude/steerhook/. They pin the
  regular-expression dialect the plugin has to support: word boundaries, a
  character class with a newline escape, a negative lookbehind, and a match
  across lines. Each rule gets one command it must catch and one it must let
  through.

  Two of the rules also pin which view of the command they read. The codex
  rule and the loop rule read the code, so a command word inside a quoted
  argument and a loop inside a heredoc body never reach them. The backtick
  rule reads the expanded text, so it sees what the shell will substitute and
  nothing else.

  Scenario: codex exec is stopped even behind another command
    Given the user rule file "no-direct-codex-exec.md" contains
      """
      ---
      name: no-direct-codex-exec
      enabled: true
      event: bash
      pattern: (^|[\s;&|(])codex\s+exec\b
      action: block
      ---

      Do not run codex exec from Bash. Send the task to the codex:codex-rescue subagent.
      """
    When Claude runs the bash command "cd work && timeout 600 codex exec --help"
    Then the command is denied and Claude reads "Send the task to the codex:codex-rescue subagent."

  Scenario: A quoted mention of codex exec passes
    Given the user rule file "no-direct-codex-exec.md" contains
      """
      ---
      name: no-direct-codex-exec
      enabled: true
      event: bash
      pattern: (^|[\s;&|(])codex\s+exec\b
      action: block
      ---

      Do not run codex exec from Bash. Send the task to the codex:codex-rescue subagent.
      """
    When Claude runs the bash command "grep \"codex exec\" notes.md"
    Then the hook returns nothing

  Scenario: codex exec inside a single-quoted prompt passes
    Given the user rule file "no-direct-codex-exec.md" contains
      """
      ---
      name: no-direct-codex-exec
      enabled: true
      event: bash
      pattern: (^|[\s;&|(])codex\s+exec\b
      action: block
      ---

      Do not run codex exec from Bash. Send the task to the codex:codex-rescue subagent.
      """
    When Claude runs the bash command "claude -p 'run codex exec --help and report' --model sonnet"
    Then the hook returns nothing

  Scenario: A polling loop with sleep is stopped, also across lines
    Given the user rule file "no-until-sleep-loop.md" contains
      """
      ---
      name: no-until-sleep-loop
      enabled: true
      event: bash
      pattern: \b(until|while)\b[^\n;]*(;|\n)\s*do\b[\s\S]*\bsleep\b
      action: block
      ---

      Do not write a loop that waits with sleep. A background task sends a notification when it completes.
      """
    When Claude runs this bash command
      """
      until curl -s localhost:8080; do
        sleep 2
      done
      """
    Then the command is denied and Claude reads "A background task sends a notification when it completes."

  Scenario: A loop without sleep passes
    Given the user rule file "no-until-sleep-loop.md" contains
      """
      ---
      name: no-until-sleep-loop
      enabled: true
      event: bash
      pattern: \b(until|while)\b[^\n;]*(;|\n)\s*do\b[\s\S]*\bsleep\b
      action: block
      ---

      Do not write a loop that waits with sleep. A background task sends a notification when it completes.
      """
    When Claude runs the bash command "while read line; do echo $line; done < list.txt"
    Then the hook returns nothing

  Scenario: A heredoc that writes a loop into a file passes
    Given the user rule file "no-until-sleep-loop.md" contains
      """
      ---
      name: no-until-sleep-loop
      enabled: true
      event: bash
      pattern: \b(until|while)\b[^\n;]*(;|\n)\s*do\b[\s\S]*\bsleep\b
      action: block
      ---

      Do not write a loop that waits with sleep. A background task sends a notification when it completes.
      """
    When Claude runs this bash command
      """
      cat > reap.mjs <<'EOF'
      while (queue.length) { await sleep(1); }
      EOF
      """
    Then the hook returns nothing

  Scenario: Reading the rule's own file passes
    Given the user rule file "no-until-sleep-loop.md" contains
      """
      ---
      name: no-until-sleep-loop
      enabled: true
      event: bash
      pattern: \b(until|while)\b[^\n;]*(;|\n)\s*do\b[\s\S]*\bsleep\b
      action: block
      ---

      Do not write a loop that waits with sleep. A background task sends a notification when it completes.
      """
    When Claude runs the bash command "cat ~/.claude/steerhook/no-until-sleep-loop.md"
    Then the hook returns nothing

  Scenario: herdr send-text with --enter is stopped
    Given the user rule file "herdr-send-text-enter.md" contains
      """
      ---
      name: herdr-send-text-enter
      enabled: true
      event: bash
      pattern: herdr\s+pane\s+send-text\b[^\n]*--enter
      action: block
      ---

      herdr pane send-text has no --enter flag. Send the text first, then send the key in a second command.
      """
    When Claude runs the bash command "herdr pane send-text w1:p1 \"hello\" --enter"
    Then the command is denied and Claude reads "Send the text first, then send the key in a second command."

  Scenario: herdr send-text without --enter passes
    Given the user rule file "herdr-send-text-enter.md" contains
      """
      ---
      name: herdr-send-text-enter
      enabled: true
      event: bash
      pattern: herdr\s+pane\s+send-text\b[^\n]*--enter
      action: block
      ---

      herdr pane send-text has no --enter flag. Send the text first, then send the key in a second command.
      """
    When Claude runs the bash command "herdr pane send-text w1:p1 \"hello\""
    Then the hook returns nothing

  Scenario: A backtick inside double quotes gets a warning
    Given the user rule file "backtick-in-double-quotes.md" contains
      """
      ---
      name: backtick-in-double-quotes
      enabled: true
      event: bash
      action: warn
      conditions:
        - field: command_expanded
          operator: regex_match
          pattern: (?<!\\)`
      ---

      A backtick inside double quotes is a command substitution. Write a long text to a file and pass it on stdin.
      """
    When Claude runs the bash command "echo \"now `date`\""
    Then the command is allowed
    And Claude reads the note "Write a long text to a file and pass it on stdin."

  Scenario: An escaped backtick inside double quotes passes
    Given the user rule file "backtick-in-double-quotes.md" contains
      """
      ---
      name: backtick-in-double-quotes
      enabled: true
      event: bash
      action: warn
      conditions:
        - field: command_expanded
          operator: regex_match
          pattern: (?<!\\)`
      ---

      A backtick inside double quotes is a command substitution. Write a long text to a file and pass it on stdin.
      """
    When Claude runs the bash command "git commit -m \"Add \`x\` flag\""
    Then the hook returns nothing
