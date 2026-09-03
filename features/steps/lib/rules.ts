import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// Write one rule file in the format the plugin reads: YAML-like
// frontmatter between --- lines, then the message body.
export function writeRule(
  dir: string,
  name: string,
  fields: Record<string, string | boolean>,
  message: string,
): string {
  const lines = Object.entries(fields).map(([k, v]) => `${k}: ${v}`);
  const content = `---\nname: ${name}\n${lines.join("\n")}\n---\n\n${message.trim()}\n`;
  return writeRuleFile(join(dir, `${name}.md`), content);
}

export function writeRuleFile(file: string, content: string): string {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
  return file;
}

export function actionOf(verb: string): "block" | "warn" {
  if (verb === "blocks") return "block";
  if (verb === "warns") return "warn";
  throw new Error(`unknown rule verb "${verb}": use "blocks" or "warns"`);
}
