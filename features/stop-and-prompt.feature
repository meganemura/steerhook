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
