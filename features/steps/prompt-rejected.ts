import { expect } from "playwright/test";
import { defineStep, z } from "nukadoko";
import { hookSpecificOutput } from "./lib/hook.js";
import editFile from "./edit-file.js";
import runBash from "./run-bash.js";
import runBashBlock from "./run-bash-block.js";
import stop from "./stop.js";
import submitPrompt from "./submit-prompt.js";

export default defineStep({
  pattern: "the prompt is rejected and the user sees {text:string}",
  description: "Assert the UserPromptSubmit hook returned decision block with the text in reason, which Claude Code shows to the user",
  rationale: "On a rejected prompt the reason goes to the user and the prompt is erased; nothing reaches Claude.",
  args: z.object({
    output: z.record(z.string(), z.unknown()).describe("The hook output from the When step"),
    text: z.string().describe("Text that must appear in the reason"),
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
    reason: z.string().describe("The full reason the hook returned"),
  }),
  mutates: false,
  async run({}, args) {
    expect(args.output.decision, "decision").toBe("block");
    const reason = String(args.output.reason ?? "");
    expect(reason, "reason").toContain(args.text);
    return { reason };
  },
});
