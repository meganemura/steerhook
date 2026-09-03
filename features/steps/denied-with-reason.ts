import { expect } from "playwright/test";
import { defineStep, z } from "nukadoko";
import { hookSpecificOutput } from "./lib/hook.js";
import editFile from "./edit-file.js";
import runBash from "./run-bash.js";
import runBashBlock from "./run-bash-block.js";
import stop from "./stop.js";
import submitPrompt from "./submit-prompt.js";

export default defineStep({
  pattern: "the command is denied and Claude reads {text:string}",
  description: "Assert the hook denied the tool call and put the text where Claude reads it (permissionDecisionReason)",
  rationale:
    "permissionDecisionReason is the one field Claude sees on a deny; systemMessage goes to the user " +
    "only. Asserting on the reason, not on systemMessage, is the point of this fork.",
  args: z.object({
    output: z.record(z.string(), z.unknown()).describe("The hook output from the When step"),
    text: z.string().describe("Text that must appear in the reason Claude reads"),
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
    decision: z.string().describe("The permissionDecision the hook returned"),
    reason: z.string().describe("The full permissionDecisionReason"),
  }),
  mutates: false,
  async run({}, args) {
    const h = hookSpecificOutput(args.output);
    expect(h.permissionDecision, "permissionDecision").toBe("deny");
    const reason = String(h.permissionDecisionReason ?? "");
    expect(reason, "permissionDecisionReason").toContain(args.text);
    return { decision: String(h.permissionDecision), reason };
  },
});
