Feature: What a bash rule matches

  A bash rule says what Claude must not run. It is about what the shell does,
  so steerhook does not match the raw text of the command. It scans the
  command's quoting one time and splits the text into three views. Every
  character lands in exactly one of them.

    command           The code. Everything outside quotes, the quote marks
                      themselves, and a heredoc's operator and terminator.
                      A simple pattern reads this view.
    command_literal   The text the shell never reads as code: the contents of
                      single quotes, and the body of a heredoc whose word is
                      quoted.
    command_expanded  The text the shell still expands: the contents of double
                      quotes, and the body of a heredoc whose word is not
                      quoted.

  A fourth field, command_raw, holds the whole string the tool received. A
  rule about how a command is written, rather than about what it runs, reads
  that one.

  Segments of one view are joined with a newline, so a pattern that cannot
  cross a line cannot join two separate quoted strings.

  Scenario: A command word inside a single-quoted argument does not run
    Given the user rule "no-codex-exec" blocks bash commands that match "(^|[\s;&|(])codex\s+exec\b"
      """
      Send the task to the codex:codex-rescue subagent instead.
      """
    When Claude runs the bash command "claude -p 'run codex exec and report back' --model sonnet"
    Then the hook returns nothing

  Scenario: The same rule fires when the command word is the one that runs
    Given the user rule "no-codex-exec" blocks bash commands that match "(^|[\s;&|(])codex\s+exec\b"
      """
      Send the task to the codex:codex-rescue subagent instead.
      """
    When Claude runs the bash command "timeout 600 codex exec --help"
    Then the command is denied and Claude reads "Send the task to the codex:codex-rescue subagent instead."

  Scenario: A quoted heredoc body is not part of the command
    Given the user rule "no-sleep-loop" blocks bash commands that match "\b(until|while)\b[\s\S]*\bsleep\b"
      """
      Do not wait with a loop.
      """
    When Claude runs this bash command
      """
      cat > reap.mjs <<'EOF'
      while (queue.length) { await sleep(1); }
      EOF
      """
    Then the hook returns nothing

  Scenario: command_literal holds the body of a quoted heredoc
    Given the user rule "no-todo-in-file" warns bash commands whose command_literal matches "\bTODO\b"
      """
      This writes a TODO into a file.
      """
    When Claude runs this bash command
      """
      cat > notes.md <<'EOF'
      TODO: name the owner of this step.
      EOF
      """
    Then Claude reads the note "This writes a TODO into a file."

  Scenario: The same rule stays quiet when the word is only in the command
    Given the user rule "no-todo-in-file" warns bash commands whose command_literal matches "\bTODO\b"
      """
      This writes a TODO into a file.
      """
    When Claude runs the bash command "grep -r TODO src/"
    Then the hook returns nothing

  Scenario: command_expanded holds the text inside double quotes
    Given the user rule "backtick-in-double-quotes" warns bash commands whose command_expanded matches "`"
      """
      A backtick here is a command substitution.
      """
    When Claude runs the bash command "echo \"today is `date`\""
    Then Claude reads the note "A backtick here is a command substitution."

  Scenario: Double quotes written inside single quotes are not quotes
    Given the user rule "backtick-in-double-quotes" warns bash commands whose command_expanded matches "`"
      """
      A backtick here is a command substitution.
      """
    When Claude runs the bash command "ruby -i -pe 'gsub(/x/, \"`y`\")' README.md"
    Then the hook returns nothing

  Scenario: command_expanded holds the body of a heredoc whose word is not quoted
    Given the user rule "backtick-in-double-quotes" warns bash commands whose command_expanded matches "`"
      """
      A backtick here is a command substitution.
      """
    When Claude runs this bash command
      """
      cat > report.md <<EOF
      The version is `git describe`.
      EOF
      """
    Then Claude reads the note "A backtick here is a command substitution."

  Scenario: An escaped double quote does not end the string it sits in
    Given the user rule "backtick-in-double-quotes" warns bash commands whose command_expanded matches "`"
      """
      A backtick here is a command substitution.
      """
    When Claude runs this bash command
      """
      echo "a \" b" 'c `d` e'
      """
    Then the hook returns nothing

  Scenario: command_raw holds the text the tool received
    Given the user rule "no-quoted-mention" warns bash commands whose command_raw matches "codex\s+exec"
      """
      This command names codex exec, even inside quotes.
      """
    When Claude runs the bash command "grep 'codex exec' notes.md"
    Then Claude reads the note "This command names codex exec, even inside quotes."
