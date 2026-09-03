import { defineStep, z } from "nukadoko";
import { actionOf, writeRule } from "./lib/rules.js";
import { redact, type Sandbox } from "./lib/sandbox.js";

export default defineStep({
  pattern: "the project rule {name:string} {verb:word} bash commands that match {pattern:string}",
  description: "Write a bash rule into the project's rule directory (<project>/.claude/steerhook/); the docstring is the message",
  rationale: "Same shape as user-bash-rule, in the project directory the hook input's cwd names.",
  args: z.object({
    name: z.string().describe("The rule's name, also its file name"),
    verb: z.enum(["blocks", "warns"]).describe("blocks: deny the call; warns: allow it and add context"),
    pattern: z.string().describe("The regular expression matched against the bash command"),
    message: z.string().describe("The message body: what Claude reads when the rule fires"),
  }),
  returns: z.object({ file: z.string().describe("The rule file written") }),
  mutates: true,
  async run({ sandbox }, args) {
    const sb = sandbox as Sandbox;
    const file = writeRule(sb.projectRules, args.name, { enabled: true, event: "bash", pattern: args.pattern, action: actionOf(args.verb) }, args.message);
    return { file: redact(sb, file) };
  },
});
