import { defineStep, z } from "nukadoko";
import { runHook } from "./lib/hook.js";
import type { Sandbox } from "./lib/sandbox.js";

export default defineStep({
  pattern: "Claude runs this bash command",
  description: "Send a PreToolUse event for the Bash tool with a multi-line command given as a docstring",
  rationale: "Same as run-bash; the docstring form exists for commands that span lines or hold many quotes.",
  args: z.object({ command: z.string().describe("The bash command Claude is about to run, possibly several lines") }),
  returns: z.object({
    exit_code: z.number().describe("The hook process exit code; the plugin always exits 0"),
    output: z.record(z.string(), z.unknown()).describe("The JSON the hook printed on stdout"),
  }),
  mutates: false,
  async run({ sandbox, evidence }, args) {
    return runHook(sandbox as Sandbox, "PreToolUse", { tool_name: "Bash", tool_input: { command: args.command } }, evidence);
  },
});
