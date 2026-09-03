import { mkdirSync, renameSync } from "node:fs";
import { join } from "node:path";
import { defineStep, z } from "nukadoko";
import type { Sandbox } from "./lib/sandbox.js";

export default defineStep({
  pattern: "the user rules are moved to a directory named by STEERHOOK_RULES_DIR",
  description: "Move ~/.claude/steerhook/ elsewhere and point STEERHOOK_RULES_DIR at the new place for the hooks that follow",
  rationale: "Pins the override variable the README documents. The rules leave the default location so a pass proves the variable was read.",
  args: z.object({}),
  returns: z.object({ dir: z.string().describe("The directory STEERHOOK_RULES_DIR now names") }),
  mutates: true,
  async run({ sandbox }) {
    const sb = sandbox as Sandbox;
    const dir = join(sb.root, "rules-elsewhere");
    mkdirSync(sb.userRules, { recursive: true });
    renameSync(sb.userRules, dir);
    sb.rulesDirOverride = dir;
    return { dir };
  },
});
