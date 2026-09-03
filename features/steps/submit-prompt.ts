import { defineStep, z } from "nukadoko";
import { runHook } from "./lib/hook.js";
import type { Sandbox } from "./lib/sandbox.js";

export default defineStep({
  pattern: "the user submits the prompt {prompt:string}",
  description: "Send a UserPromptSubmit event through the plugin's hook, with the text in the documented prompt field",
  rationale: "The hook input carries the text as prompt; a rule names the field user_prompt.",
  args: z.object({ prompt: z.string().describe("The text the user typed") }),
  returns: z.object({
    exit_code: z.number().describe("The hook process exit code; the plugin always exits 0"),
    output: z.record(z.string(), z.unknown()).describe("The JSON the hook printed on stdout"),
  }),
  mutates: false,
  async run({ sandbox, evidence }, args) {
    return runHook(sandbox as Sandbox, "UserPromptSubmit", { prompt: args.prompt }, evidence);
  },
});
