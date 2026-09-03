"""End-to-end tests: run the hook scripts as Claude Code runs them."""

import json
import os
import subprocess
import sys
import tempfile
import unittest

PLUGIN_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def write_rule(path, name, pattern, action, message):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(f'---\nname: {name}\nenabled: true\nevent: bash\n'
                f'pattern: {pattern}\naction: {action}\n---\n\n{message}\n')


class PreToolUseHookTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.user_dir = os.path.join(self.tmp.name, 'user')
        self.project = os.path.join(self.tmp.name, 'project')
        self.elsewhere = os.path.join(self.tmp.name, 'elsewhere')
        for d in (self.user_dir, self.project, self.elsewhere):
            os.makedirs(d)

    def run_hook(self, command):
        # The process runs in a directory that holds no rules, as a plugin
        # hook does. Only the cwd field in the input names the project.
        env = dict(os.environ, CLAUDE_PLUGIN_ROOT=PLUGIN_ROOT, HOOKIFY_RULES_DIR=self.user_dir)
        input_data = {
            'hook_event_name': 'PreToolUse',
            'tool_name': 'Bash',
            'tool_input': {'command': command},
            'cwd': self.project,
        }
        proc = subprocess.run(
            [sys.executable, os.path.join(PLUGIN_ROOT, 'hooks', 'pretooluse.py')],
            input=json.dumps(input_data), capture_output=True, text=True,
            cwd=self.elsewhere, env=env, check=True)
        return json.loads(proc.stdout)

    def test_project_rule_blocks_with_reason(self):
        write_rule(os.path.join(self.project, '.claude', 'hookify', 'no-foo.md'),
                   'no-foo', r'\bfoo\b', 'block', 'Use bar instead of foo.')

        result = self.run_hook('foo --help')

        output = result['hookSpecificOutput']
        self.assertEqual(output['permissionDecision'], 'deny')
        self.assertIn('Use bar instead of foo.', output['permissionDecisionReason'])

    def test_user_rule_warns_with_additional_context(self):
        write_rule(os.path.join(self.user_dir, 'careful-foo.md'),
                   'careful-foo', r'\bfoo\b', 'warn', 'foo is slow.')

        result = self.run_hook('foo --help')

        self.assertIn('foo is slow.', result['hookSpecificOutput']['additionalContext'])
        self.assertNotIn('permissionDecision', result['hookSpecificOutput'])

    def test_unmatched_command_passes(self):
        write_rule(os.path.join(self.user_dir, 'no-foo.md'),
                   'no-foo', r'\bfoo\b', 'block', 'Use bar instead of foo.')

        self.assertEqual(self.run_hook('ls'), {})


class HooksJsonTest(unittest.TestCase):
    def test_registered_events_and_scripts(self):
        with open(os.path.join(PLUGIN_ROOT, 'hooks', 'hooks.json')) as f:
            hooks = json.load(f)['hooks']

        self.assertEqual(sorted(hooks), ['PreToolUse', 'Stop', 'UserPromptSubmit'])
        for event, entries in hooks.items():
            for entry in entries:
                for hook in entry['hooks']:
                    script = hook['command'].split('/hooks/')[1].rstrip('"')
                    self.assertTrue(os.path.exists(os.path.join(PLUGIN_ROOT, 'hooks', script)), script)


if __name__ == '__main__':
    unittest.main()
