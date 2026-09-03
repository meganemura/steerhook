import { defineStep, z } from "nukadoko";
import { actionOf, writeRule } from "./lib/rules.js";
import { redact, type Sandbox } from "./lib/sandbox.js";

export default defineStep({
  pattern: "the user rule {name:string} {verb:word} file edits that match {pattern:string}",
  description: "Write a file rule (event: file) into the user's rule directory; the docstring is the message",
  rationale: "A file rule's simple pattern is matched against the text an edit adds (new_text).",
  args: z.object({
    name: z.string().describe("The rule's name, also its file name"),
    verb: z.enum(["blocks", "warns"]).describe("blocks: deny the edit; warns: allow it and add context"),
    pattern: z.string().describe("The regular expression matched against the added text"),
    message: z.string().describe("The message body: what Claude reads when the rule fires"),
  }),
  returns: z.object({ file: z.string().describe("The rule file written") }),
  mutates: true,
  async run({ sandbox }, args) {
    const sb = sandbox as Sandbox;
    const file = writeRule(sb.userRules, args.name, { enabled: true, event: "file", pattern: args.pattern, action: actionOf(args.verb) }, args.message);
    return { file: redact(sb, file) };
  },
});
