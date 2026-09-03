import { join } from "node:path";
import { defineStep, z } from "nukadoko";
import { actionOf, writeRuleFile } from "./lib/rules.js";
import { redact, type Sandbox } from "./lib/sandbox.js";

export default defineStep({
  pattern: "the user rule {name:string} {verb:word} bash commands whose {field:word} matches {pattern:string}",
  description: "Write a bash rule that names which view of the command it matches, as a single condition",
  rationale:
    "A simple pattern reads the command's code view. A rule that wants another view has to name it, and " +
    "the only way to name a field is a condition, so this step writes the conditions form. It sits beside " +
    "user-bash-rule rather than replacing it, because the simple form is what most rules use.",
  args: z.object({
    name: z.string().describe("The rule's name, also its file name"),
    verb: z.enum(["blocks", "warns"]).describe("blocks: deny the call; warns: allow it and add context"),
    field: z
      .enum(["command", "command_literal", "command_expanded", "command_raw"])
      .describe("Which view of the bash command the pattern is matched against"),
    pattern: z.string().describe("The regular expression matched against that view"),
    message: z.string().describe("The message body: what Claude reads when the rule fires"),
  }),
  returns: z.object({ file: z.string().describe("The rule file written") }),
  mutates: true,
  async run({ sandbox }, args) {
    const sb = sandbox as Sandbox;
    const content =
      `---\nname: ${args.name}\nenabled: true\nevent: bash\naction: ${actionOf(args.verb)}\n` +
      `conditions:\n  - field: ${args.field}\n    operator: regex_match\n    pattern: ${args.pattern}\n` +
      `---\n\n${args.message.trim()}\n`;
    const file = writeRuleFile(join(sb.userRules, `${args.name}.md`), content);
    return { file: redact(sb, file) };
  },
});
