import { defineStep, z } from "nukadoko";
import { writeRule } from "./lib/rules.js";
import type { Sandbox } from "./lib/sandbox.js";

export default defineStep({
  pattern: "the project rule {name:string} is disabled",
  description: "Write a project rule with enabled: false, the way a project switches a user rule of that name off",
  rationale: "The rule's own pattern and message do not matter: a disabled rule never fires, and its name is what hides the user rule.",
  args: z.object({ name: z.string().describe("The rule's name, the same as the user rule it switches off") }),
  returns: z.object({ file: z.string().describe("The rule file written") }),
  mutates: true,
  async run({ sandbox }, args) {
    const sb = sandbox as Sandbox;
    const file = writeRule(sb.projectRules, args.name, { enabled: false, event: "bash", pattern: "disabled", action: "block" }, "Switched off in this project.");
    return { file };
  },
});
