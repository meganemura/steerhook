import { expect } from "playwright/test";
import { defineStep, z } from "nukadoko";
import { hookSpecificOutput } from "./lib/hook.js";
import editFile from "./edit-file.js";
import runBash from "./run-bash.js";
import runBashBlock from "./run-bash-block.js";
import stop from "./stop.js";
import submitPrompt from "./submit-prompt.js";

export default defineStep({
  pattern: "Claude reads the note {text:string}",
  description: "Assert the hook added the text to Claude's context (hookSpecificOutput.additionalContext)",
  rationale: "additionalContext is what Claude reads on a warning; systemMessage reaches the user only.",
  args: z.object({
    output: z.record(z.string(), z.unknown()).describe("The hook output from the When step"),
    text: z.string().describe("Text that must appear in the additionalContext"),
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
    context: z.string().describe("The full additionalContext the hook returned"),
  }),
  mutates: false,
  async run({}, args) {
    const context = String(hookSpecificOutput(args.output).additionalContext ?? "");
    expect(context, "additionalContext").toContain(args.text);
    return { context };
  },
});
