import { defineStep, z } from "nukadoko";
import { actionOf, writeRule } from "./lib/rules.js";
import type { Sandbox } from "./lib/sandbox.js";

export default defineStep({
  pattern: "the user rule {name:string} {verb:word} bash commands that match {pattern:string}",
  description: "Write a bash rule into the user's rule directory (~/.claude/steerhook/); the docstring is the message",
  rationale:
    "The message is a docstring rather than a capture so a feature can show the whole text Claude will " +
    "read. The verb is the plain word (blocks, warns) because the reader is not expected to know the " +
    "action field's values.",
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
    const file = writeRule(sb.userRules, args.name, { enabled: true, event: "bash", pattern: args.pattern, action: actionOf(args.verb) }, args.message);
    return { file };
  },
});
