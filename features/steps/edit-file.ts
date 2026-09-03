import { defineStep, z } from "nukadoko";
import { runHook } from "./lib/hook.js";
import type { Sandbox } from "./lib/sandbox.js";

export default defineStep({
  pattern: "Claude edits the file {path:string} to add {text:string}",
  description: "Send a PreToolUse event for the Edit tool (file_path, new_string) through the plugin's hook",
  rationale: "Edit is the tool a file rule is written for; Write and MultiEdit share the event but not the field names.",
  args: z.object({
    path: z.string().describe("The file Claude edits, as the Edit tool's file_path"),
    text: z.string().describe("The text Claude adds, as the Edit tool's new_string"),
  }),
  returns: z.object({
    exit_code: z.number().describe("The hook process exit code; the plugin always exits 0"),
    output: z.record(z.string(), z.unknown()).describe("The JSON the hook printed on stdout"),
  }),
  mutates: false,
  async run({ sandbox, evidence }, args) {
    return runHook(sandbox as Sandbox, "PreToolUse", { tool_name: "Edit", tool_input: { file_path: args.path, old_string: "", new_string: args.text } }, evidence);
  },
});
