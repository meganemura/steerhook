import { expect } from "playwright/test";
import { defineStep, z } from "nukadoko";
import { hookSpecificOutput } from "./lib/hook.js";
import editFile from "./edit-file.js";
import runBash from "./run-bash.js";
import runBashBlock from "./run-bash-block.js";
import stop from "./stop.js";
import submitPrompt from "./submit-prompt.js";

export default defineStep({
  pattern: "the denial reason is exactly",
  description: "Assert the permissionDecisionReason equals the docstring, character for character",
  rationale: "Pins the message format: the rule name in bold brackets, a newline, the message; two rules joined by a blank line.",
  args: z.object({
    output: z.record(z.string(), z.unknown()).describe("The hook output from the When step"),
    expected: z.string().describe("The exact reason text, as the docstring"),
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
    reason: z.string().describe("The full permissionDecisionReason"),
  }),
  mutates: false,
  async run({}, args) {
    expect(args.output, "hook output from the When step").toBeDefined();
    const reason = String(hookSpecificOutput(args.output!).permissionDecisionReason ?? "");
    expect(reason, "permissionDecisionReason").toBe(args.expected.trimEnd());
    return { reason };
  },
});
