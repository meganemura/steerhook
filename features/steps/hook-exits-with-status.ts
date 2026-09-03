import { expect } from "playwright/test";
import { defineStep, z } from "nukadoko";
import editFile from "./edit-file.js";
import runBash from "./run-bash.js";
import runBashBlock from "./run-bash-block.js";
import stop from "./stop.js";
import submitPrompt from "./submit-prompt.js";

export default defineStep({
  pattern: "the hook exits with status {code:int}",
  description: "Assert the hook process exit code",
  rationale: "The plugin exits 0 in every case, including a broken rule file, so an error can never block a call by accident.",
  args: z.object({
    exit_code: z.number().describe("The exit code from the When step"),
    code: z.number().describe("The expected exit code"),
  }),
  from: {
    exit_code: [
      [runBash, "exit_code"],
      [runBashBlock, "exit_code"],
      [editFile, "exit_code"],
      [stop, "exit_code"],
      [submitPrompt, "exit_code"],
    ],
  },
  returns: z.object({ exit_code: z.number().describe("The exit code observed") }),
  mutates: false,
  async run({}, args) {
    expect(args.exit_code, "exit code").toBe(args.code);
    return { exit_code: args.exit_code };
  },
});
