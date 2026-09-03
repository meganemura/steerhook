import { expect } from "playwright/test";
import { defineStep, z } from "nukadoko";
import { hookSpecificOutput } from "./lib/hook.js";
import editFile from "./edit-file.js";
import runBash from "./run-bash.js";
import runBashBlock from "./run-bash-block.js";
import stop from "./stop.js";
import submitPrompt from "./submit-prompt.js";

export default defineStep({
  pattern: "the user sees {text:string}",
  description: "Assert the hook put the text in systemMessage, the field shown to the user",
  rationale: "The user keeps seeing the reason on screen; the fork adds the Claude-side fields beside it, it does not move the message.",
  args: z.object({
    output: z.record(z.string(), z.unknown()).describe("The hook output from the When step"),
    text: z.string().describe("Text that must appear in systemMessage"),
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
    system_message: z.string().describe("The full systemMessage the hook returned"),
  }),
  mutates: false,
  async run({}, args) {
    const systemMessage = String(args.output.systemMessage ?? "");
    expect(systemMessage, "systemMessage").toContain(args.text);
    return { system_message: systemMessage };
  },
});
