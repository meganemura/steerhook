import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { defineStep, z } from "nukadoko";
import { runHook } from "./lib/hook.js";
import type { Sandbox } from "./lib/sandbox.js";

export default defineStep({
  pattern: "Claude tries to stop with this transcript",
  description: "Send a Stop event through the plugin's hook, with the docstring written as the session transcript file",
  rationale: "A stop rule reads the transcript file named by transcript_path; the docstring stands in for that file.",
  args: z.object({ transcript: z.string().describe("The transcript content (JSONL) the stop rule may read") }),
  returns: z.object({
    exit_code: z.number().describe("The hook process exit code; the plugin always exits 0"),
    output: z.record(z.string(), z.unknown()).describe("The JSON the hook printed on stdout"),
  }),
  mutates: false,
  async run({ sandbox, evidence }, args) {
    const sb = sandbox as Sandbox;
    const transcriptPath = join(sb.root, "transcript.jsonl");
    writeFileSync(transcriptPath, args.transcript.trim() + "\n");
    return runHook(sb, "Stop", { stop_hook_active: false, transcript_path: transcriptPath }, evidence);
  },
});
