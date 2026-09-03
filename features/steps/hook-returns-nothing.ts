import { expect } from "playwright/test";
import { defineStep, z } from "nukadoko";
import { hookSpecificOutput } from "./lib/hook.js";
import editFile from "./edit-file.js";
import runBash from "./run-bash.js";
import runBashBlock from "./run-bash-block.js";
import stop from "./stop.js";
import submitPrompt from "./submit-prompt.js";

export default defineStep({
  pattern: "the hook returns nothing",
  description: "Assert the hook printed an empty JSON object: no decision, no message, no context",
  rationale: "An empty object is the documented way to let a call through untouched; any key would be a claim the scenario did not make.",
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
    keys: z.array(z.string()).describe("The top-level keys the hook returned; empty on a pass"),
  }),
  mutates: false,
  async run({}, args) {
    expect(args.output, "hook output").toEqual({});
    return { keys: Object.keys(args.output) };
  },
});
