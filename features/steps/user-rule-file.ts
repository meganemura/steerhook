import { join } from "node:path";
import { defineStep, z } from "nukadoko";
import { writeRuleFile } from "./lib/rules.js";
import { redact, type Sandbox } from "./lib/sandbox.js";

export default defineStep({
  pattern: "the user rule file {file:string} contains",
  description: "Write a file into the user's rule directory with exactly the docstring's content",
  rationale: "For scenarios about how a rule file is parsed: quotes, conditions, a missing frontmatter. The other rule steps hide the format.",
  args: z.object({
    file: z.string().describe("The file name inside ~/.claude/steerhook/"),
    content: z.string().describe("The whole file content, frontmatter and message"),
  }),
  returns: z.object({ file: z.string().describe("The rule file written") }),
  mutates: true,
  async run({ sandbox }, args) {
    const sb = sandbox as Sandbox;
    return { file: redact(sb, writeRuleFile(join(sb.userRules, args.file), args.content.trimEnd() + "\n")) };
  },
});
