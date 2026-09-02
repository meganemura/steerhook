"""Tests for rule loading: the two rule directories, cwd, and quote handling."""

import os
import sys
import tempfile
import unittest
from unittest import mock

PLUGIN_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PLUGIN_ROOT not in sys.path:
    sys.path.insert(0, PLUGIN_ROOT)

from core.config_loader import extract_frontmatter, load_rules  # noqa: E402


def write_rule(path, name, pattern='foo', action='warn', event='bash', message='msg'):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(f'---\nname: {name}\nenabled: true\nevent: {event}\n'
                f'pattern: {pattern}\naction: {action}\n---\n\n{message}\n')


class LoadRulesTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.user_dir = os.path.join(self.tmp.name, 'user')
        self.project = os.path.join(self.tmp.name, 'project')
        os.makedirs(self.user_dir)
        os.makedirs(self.project)
        patcher = mock.patch.dict(os.environ, {'HOOKIFY_RULES_DIR': self.user_dir})
        patcher.start()
        self.addCleanup(patcher.stop)

    def project_rule(self, name, **kwargs):
        write_rule(os.path.join(self.project, '.claude', f'hookify.{name}.local.md'), name, **kwargs)

    def user_rule(self, name, **kwargs):
        write_rule(os.path.join(self.user_dir, f'{name}.md'), name, **kwargs)

    def test_reads_user_and_project_rules(self):
        self.user_rule('only-user')
        self.project_rule('only-project')

        names = [r.name for r in load_rules(event='bash', cwd=self.project)]

        self.assertEqual(names, ['only-user', 'only-project'])

    def test_project_rule_replaces_user_rule_with_same_name(self):
        self.user_rule('shared', message='user version')
        self.project_rule('shared', message='project version')

        rules = load_rules(event='bash', cwd=self.project)

        self.assertEqual([(r.name, r.message) for r in rules], [('shared', 'project version')])

    def test_cwd_argument_resolves_project_rules_without_chdir(self):
        self.project_rule('from-cwd')
        before = os.getcwd()

        with_cwd = [r.name for r in load_rules(event='bash', cwd=self.project)]
        without_cwd = [r.name for r in load_rules(event='bash')]

        self.assertEqual(os.getcwd(), before)
        self.assertEqual(with_cwd, ['from-cwd'])
        self.assertEqual(without_cwd, [])

    def test_missing_user_directory_is_not_an_error(self):
        with mock.patch.dict(os.environ, {'HOOKIFY_RULES_DIR': os.path.join(self.tmp.name, 'absent')}):
            self.project_rule('only-project')

            names = [r.name for r in load_rules(event='bash', cwd=self.project)]

        self.assertEqual(names, ['only-project'])


class QuoteStrippingTest(unittest.TestCase):
    def frontmatter(self, pattern):
        content = ('---\nname: q\nevent: bash\n'
                   f'pattern: {pattern}\n'
                   'conditions:\n  - field: command\n'
                   f'    pattern: {pattern}\n---\nmsg')
        fm, _ = extract_frontmatter(content)
        return fm['pattern'], fm['conditions'][0]['pattern']

    def test_group_wrapped_pattern_keeps_its_quotes(self):
        pattern = '(?:"[^"]*`[^"]*")'
        self.assertEqual(self.frontmatter(pattern), (pattern, pattern))

    def test_matching_pair_is_removed_once(self):
        self.assertEqual(self.frontmatter('"abc"'), ('abc', 'abc'))
        self.assertEqual(self.frontmatter("'abc'"), ('abc', 'abc'))
        self.assertEqual(self.frontmatter('""abc""'), ('"abc"', '"abc"'))

    def test_single_quote_at_one_end_stays(self):
        self.assertEqual(self.frontmatter('[^"]*"'), ('[^"]*"', '[^"]*"'))
        self.assertEqual(self.frontmatter('"'), ('"', '"'))


if __name__ == '__main__':
    unittest.main()
