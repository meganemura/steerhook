"""Tests for the hook output format of RuleEngine.evaluate_rules.

The fork changes where a rule message goes: Claude must be able to read it.
"""

import os
import sys
import unittest

PLUGIN_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PLUGIN_ROOT not in sys.path:
    sys.path.insert(0, PLUGIN_ROOT)

from core.config_loader import Condition, Rule  # noqa: E402
from core.rule_engine import RuleEngine  # noqa: E402


def make_rule(name, action, field='command', pattern=r'codex\s+exec'):
    return Rule(
        name=name,
        enabled=True,
        event='bash',
        conditions=[Condition(field=field, operator='regex_match', pattern=pattern)],
        action=action,
        message=f'Message of {name}.',
    )


class PreToolUseOutputTest(unittest.TestCase):
    def setUp(self):
        self.engine = RuleEngine()
        self.input_data = {
            'hook_event_name': 'PreToolUse',
            'tool_name': 'Bash',
            'tool_input': {'command': 'codex exec --help'},
        }

    def test_block_puts_message_in_permission_decision_reason(self):
        result = self.engine.evaluate_rules([make_rule('no-codex', 'block')], self.input_data)

        output = result['hookSpecificOutput']
        self.assertEqual(output['hookEventName'], 'PreToolUse')
        self.assertEqual(output['permissionDecision'], 'deny')
        self.assertIn('Message of no-codex.', output['permissionDecisionReason'])
        self.assertIn('Message of no-codex.', result['systemMessage'])

    def test_warn_puts_message_in_additional_context(self):
        result = self.engine.evaluate_rules([make_rule('careful', 'warn')], self.input_data)

        output = result['hookSpecificOutput']
        self.assertEqual(output['hookEventName'], 'PreToolUse')
        self.assertIn('Message of careful.', output['additionalContext'])
        self.assertNotIn('permissionDecision', output)
        self.assertIn('Message of careful.', result['systemMessage'])

    def test_no_match_returns_empty(self):
        self.input_data['tool_input']['command'] = 'ls'

        result = self.engine.evaluate_rules(
            [make_rule('no-codex', 'block'), make_rule('careful', 'warn')], self.input_data)

        self.assertEqual(result, {})


class UserPromptSubmitOutputTest(unittest.TestCase):
    def setUp(self):
        self.engine = RuleEngine()
        # The hook input carries the text in "prompt"; rules name the field user_prompt.
        self.input_data = {
            'hook_event_name': 'UserPromptSubmit',
            'prompt': 'deploy to production now',
        }
        self.kwargs = dict(field='user_prompt', pattern='deploy to production')

    def test_block_returns_decision_block_with_reason(self):
        result = self.engine.evaluate_rules(
            [make_rule('no-deploy', 'block', **self.kwargs)], self.input_data)

        self.assertEqual(result['decision'], 'block')
        self.assertIn('Message of no-deploy.', result['reason'])

    def test_warn_puts_message_in_additional_context(self):
        result = self.engine.evaluate_rules(
            [make_rule('deploy-checklist', 'warn', **self.kwargs)], self.input_data)

        output = result['hookSpecificOutput']
        self.assertEqual(output['hookEventName'], 'UserPromptSubmit')
        self.assertIn('Message of deploy-checklist.', output['additionalContext'])
        self.assertNotIn('decision', result)


class StopOutputTest(unittest.TestCase):
    def test_block_keeps_upstream_format(self):
        engine = RuleEngine()
        input_data = {'hook_event_name': 'Stop', 'reason': 'done'}
        rule = make_rule('keep-going', 'block', field='reason', pattern='done')

        result = engine.evaluate_rules([rule], input_data)

        self.assertEqual(result['decision'], 'block')
        self.assertIn('Message of keep-going.', result['reason'])
        self.assertIn('Message of keep-going.', result['systemMessage'])
        self.assertNotIn('hookSpecificOutput', result)


if __name__ == '__main__':
    unittest.main()
