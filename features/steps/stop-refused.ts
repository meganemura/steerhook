import { expect } from "playwright/test";
import { defineStep, z } from "nukadoko";
import { hookSpecificOutput } from "./lib/hook.js";
import editFile from "./edit-file.js";
import runBash from "./run-bash.js";
import runBashBlock from "./run-bash-block.js";
import stop from "./stop.js";
import submitPrompt from "./submit-prompt.js";

export default defineStep({
  pattern: "the stop is refused and Claude reads {text:string}",
  description: "Assert the Stop hook returned decision block with the text in reason, the field Claude reads on a stop",
  rationale: "Stop keeps upstream's format: top-level decision and reason.",
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
