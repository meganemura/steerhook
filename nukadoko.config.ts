import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig } from "nukadoko";

// The scenarios run the plugin's hook scripts as Claude Code runs them:
// the command from hooks.json, JSON on stdin, JSON on stdout. No browser.
export default defineConfig({
  fixtures: {
    // One throwaway file system per scenario: a home directory for the
    // user's rules, a project directory for project rules, and a third
    // directory the hook process runs in, which holds no rules at all.
    sandbox: async ({}, use) => {
      const root = mkdtempSync(join(tmpdir(), "steerhook-"));
      const dirs = {
        root,
        home: join(root, "home"),
        userRules: join(root, "home", ".claude", "steerhook"),
        project: join(root, "project"),
        projectRules: join(root, "project", ".claude", "steerhook"),
        elsewhere: join(root, "elsewhere"),
        rulesDirOverride: undefined as string | undefined,
      };
      for (const d of [dirs.home, dirs.project, dirs.elsewhere]) mkdirSync(d, { recursive: true });
      const outcome = await use(dirs);
      if (outcome === "passed") rmSync(root, { recursive: true, force: true });
    },
  },
});
