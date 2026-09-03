import { defineStep, z } from "nukadoko";
import { runHook } from "./lib/hook.js";
import type { Sandbox } from "./lib/sandbox.js";

export default defineStep({
  pattern: "Claude runs the bash command {command:string}",
  description: "Send a PreToolUse event for the Bash tool through the plugin's hook and keep its JSON output",
  rationale:
    "The step runs the command hooks.json registers, in a directory that holds no rules, with the " +
    "project named only by the input's cwd field. That is how Claude Code runs a plugin hook, and it is " +
    "what makes a project rule firing here prove the cwd resolution. stdin, stdout, and stderr are attached " +
    "as evidence so a failed step still shows what the hook said.",
  args: z.object({ command: z.string().describe("The bash command Claude is about to run") }),
  returns: z.object({
    exit_code: z.number().describe("The hook process exit code; the plugin always exits 0"),
    output: z.record(z.string(), z.unknown()).describe("The JSON the hook printed on stdout"),
  }),
  mutates: false,
  async run({ sandbox, evidence }, args) {
    return runHook(sandbox as Sandbox, "PreToolUse", { tool_name: "Bash", tool_input: { command: args.command } }, evidence);
  },
});
