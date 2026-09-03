import { expect } from "playwright/test";
import { defineStep, z } from "nukadoko";
import { hookSpecificOutput } from "./lib/hook.js";
import editFile from "./edit-file.js";
import runBash from "./run-bash.js";
import runBashBlock from "./run-bash-block.js";
import stop from "./stop.js";
import submitPrompt from "./submit-prompt.js";

export default defineStep({
  pattern: "the command is allowed",
  description: "Assert the hook did not deny the call (no permissionDecision deny, no decision block)",
  rationale: "A warning rule must let the call through; this is the half of warn that a note assertion alone does not prove.",
  args: z.object({
    output: z.record(z.string(), z.unknown()).describe("The hook output from the When step"),
  }),
  from: {
    output: [
      [runBash, "output"],
      [runBashBlock, "output"],
      [editFile, "output"],
      [stop, "output"],
      [submitPrompt, "output"],
    ],
  },
  returns: z.object({
    permission_decision: z.string().nullable().describe("The permissionDecision the hook returned, or null when it returned none"),
  }),
  mutates: false,
  async run({}, args) {
    const h = hookSpecificOutput(args.output);
    const decision = h.permissionDecision === undefined ? null : String(h.permissionDecision);
    expect(decision, "permissionDecision").not.toBe("deny");
    expect(args.output.decision, "decision").not.toBe("block");
    return { permission_decision: decision };
  },
});
