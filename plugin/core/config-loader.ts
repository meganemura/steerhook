// Ported from hookify's core/config_loader.py (Apache 2.0, see NOTICE).
// Loads and parses the rule files in ~/.claude/steerhook/ and in the
// project's .claude/steerhook/. The frontmatter parser is deliberately the
// same small state machine as upstream's: the rule-files feature pins what
// it accepts, and no YAML library is involved.

import { readFileSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface Condition {
  field: string; // "command", "new_text", "old_text", "file_path", etc.
  operator: string; // "regex_match", "contains", "equals", etc.
  pattern: string;
}

export interface Rule {
  name: string;
  enabled: boolean;
  event: string; // "bash", "file", "stop", "all", etc.
  pattern: string | undefined; // Simple pattern (legacy)
  conditions: Condition[];
  action: string; // "warn" or "block"
  toolMatcher: string | undefined; // Override tool matching
  message: string; // Message body from markdown
}

type Frontmatter = Record<string, unknown>;

function asString(value: unknown, fallback: string): string {
  if (value === undefined || value === null) return fallback;
  return typeof value === "string" ? value : String(value);
}

// Python truthiness for the value shapes the parser produces: a string, a
// boolean, or a list.
function truthy(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
}

export function conditionFromDict(data: unknown): Condition {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new TypeError("a condition must be a mapping");
  }
  const d = data as Record<string, unknown>;
  return {
    field: asString(d.field, ""),
    operator: asString(d.operator, "regex_match"),
    pattern: asString(d.pattern, ""),
  };
}

export function ruleFromDict(frontmatter: Frontmatter, message: string): Rule {
  let conditions: Condition[] = [];

  // New style: explicit conditions list
  if ("conditions" in frontmatter) {
    const condList = frontmatter.conditions;
    if (Array.isArray(condList)) conditions = condList.map(conditionFromDict);
  }

  // Legacy style: simple pattern field
  const simplePattern = frontmatter.pattern;
  if (truthy(simplePattern) && conditions.length === 0) {
    // Infer field from event
    const event = asString(frontmatter.event, "all");
    let field: string;
    if (event === "bash") field = "command";
    else if (event === "file") field = "new_text";
    else field = "content";
    conditions = [{ field, operator: "regex_match", pattern: asString(simplePattern, "") }];
  }

  return {
    name: asString(frontmatter.name, "unnamed"),
    enabled: "enabled" in frontmatter ? truthy(frontmatter.enabled) : true,
    event: asString(frontmatter.event, "all"),
    pattern: simplePattern === undefined ? undefined : asString(simplePattern, ""),
    conditions,
    action: asString(frontmatter.action, "warn"),
    toolMatcher: frontmatter.tool_matcher === undefined ? undefined : asString(frontmatter.tool_matcher, ""),
    message: message.trim(),
  };
}

// Remove one pair of matching quotes from both ends of value. Only one
// pair, and only when both ends carry the same quote.
export function unquote(value: string): string {
  if (value.length >= 2 && value[0] === value[value.length - 1] && (value[0] === '"' || value[0] === "'")) {
    return value.slice(1, -1);
  }
  return value;
}

function convertScalar(value: string): string | boolean {
  const v = unquote(value);
  if (v.toLowerCase() === "true") return true;
  if (v.toLowerCase() === "false") return false;
  return v;
}

function splitOnce(text: string, sep: string): [string, string] {
  const i = text.indexOf(sep);
  return [text.slice(0, i), text.slice(i + sep.length)];
}

// Extract the frontmatter and the message body from a rule file.
export function extractFrontmatter(content: string): [Frontmatter, string] {
  if (!content.startsWith("---")) return [{}, content];

  // Split on the first two --- markers, like str.split('---', 2)
  const first = content.indexOf("---");
  const second = content.indexOf("---", first + 3);
  if (second < 0) return [{}, content];

  const frontmatterText = content.slice(first + 3, second);
  const message = content.slice(second + 3).trim();

  // Simple parser that handles indented list items
  const frontmatter: Frontmatter = {};
  const lines = frontmatterText.split("\n");

  let currentKey: string | null = null;
  let currentList: unknown[] = [];
  let currentDict: Record<string, string> = {};
  let inList = false;
  let inDictItem = false;

  for (const line of lines) {
    // Skip empty lines and comments
    const stripped = line.trim();
    if (!stripped || stripped.startsWith("#")) continue;

    // Check indentation level
    const indent = line.length - line.trimStart().length;

    // Top-level key (no indentation or minimal)
    if (indent === 0 && line.includes(":") && !stripped.startsWith("-")) {
      // Save previous list/dict if any
      if (inList && currentKey) {
        if (inDictItem && Object.keys(currentDict).length > 0) {
          currentList.push(currentDict);
          currentDict = {};
        }
        frontmatter[currentKey] = currentList;
        inList = false;
        inDictItem = false;
        currentList = [];
      }

      const [rawKey, rawValue] = splitOnce(line, ":");
      const key = rawKey.trim();
      const value = rawValue.trim();

      if (!value) {
        // Empty value - list or nested structure follows
        currentKey = key;
        inList = true;
        currentList = [];
      } else {
        // Simple key-value pair
        frontmatter[key] = convertScalar(value);
      }
    } else if (stripped.startsWith("-") && inList) {
      // List item (starts with -)
      // Save previous dict item if any
      if (inDictItem && Object.keys(currentDict).length > 0) {
        currentList.push(currentDict);
        currentDict = {};
      }

      const itemText = stripped.slice(1).trim();

      if (itemText.includes(":") && itemText.includes(",")) {
        // Inline comma-separated dict: "- field: command, operator: regex_match"
        const itemDict: Record<string, string> = {};
        for (const part of itemText.split(",")) {
          if (part.includes(":")) {
            const [k, v] = splitOnce(part, ":");
            itemDict[k.trim()] = unquote(v.trim());
          }
        }
        currentList.push(itemDict);
        inDictItem = false;
      } else if (itemText.includes(":")) {
        // Start of multi-line dict item: "- field: command"
        inDictItem = true;
        const [k, v] = splitOnce(itemText, ":");
        currentDict = { [k.trim()]: unquote(v.trim()) };
      } else {
        // Simple list item
        currentList.push(unquote(itemText));
        inDictItem = false;
      }
    } else if (indent > 2 && inDictItem && line.includes(":")) {
      // Continuation of dict item (indented under list item)
      const [k, v] = splitOnce(stripped, ":");
      currentDict[k.trim()] = unquote(v.trim());
    }
  }

  // Save final list/dict if any
  if (inList && currentKey) {
    if (inDictItem && Object.keys(currentDict).length > 0) currentList.push(currentDict);
    frontmatter[currentKey] = currentList;
  }

  return [frontmatter, message];
}

function ruleFilesIn(dir: string): string[] {
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch {
    return [];
  }
  return names
    .filter((n) => n.endsWith(".md") && !n.startsWith("."))
    .sort()
    .map((n) => join(dir, n));
}

// Load all rules from the user and project rule directories.
// event filters by rule event ("bash", "file", "stop", ...). cwd is the
// project directory that holds .claude/; it defaults to the process cwd.
export function loadRules(event?: string, cwd?: string): Rule[] {
  // Rules about the user's own tools apply in every project, so the user
  // directory (~/.claude/steerhook/*.md, or STEERHOOK_RULES_DIR) is read
  // too. A project rule with the same name replaces the user rule.
  const userDir = process.env.STEERHOOK_RULES_DIR || join(homedir(), ".claude", "steerhook");
  const userRules = loadRuleFiles(ruleFilesIn(userDir), event);

  // The project directory has the same shape as the user directory. A
  // plugin hook can run in the plugin's own directory, so the project is
  // taken from the hook input's cwd, not the process cwd.
  const projectRules = loadRuleFiles(ruleFilesIn(join(cwd || ".", ".claude", "steerhook")), event);

  // A disabled project rule also hides the user rule of the same name, so
  // a project can switch a user rule off. Disabled rules drop out last.
  const projectNames = new Set(projectRules.map((r) => r.name));
  const rules = [...userRules.filter((r) => !projectNames.has(r.name)), ...projectRules];
  return rules.filter((r) => r.enabled);
}

function loadRuleFiles(files: string[], event?: string): Rule[] {
  const rules: Rule[] = [];
  for (const filePath of files) {
    try {
      const rule = loadRuleFile(filePath);
      if (!rule) continue;
      // Filter by event if specified
      if (event && rule.event !== "all" && rule.event !== event) continue;
      rules.push(rule);
    } catch (e) {
      process.stderr.write(`Warning: Failed to load ${filePath}: ${String(e)}\n`);
    }
  }
  return rules;
}

// Load a single rule file. Returns null if the file is invalid.
export function loadRuleFile(filePath: string): Rule | null {
  try {
    const content = readFileSync(filePath, "utf8");
    const [frontmatter, message] = extractFrontmatter(content);
    if (Object.keys(frontmatter).length === 0) {
      process.stderr.write(`Warning: ${filePath} missing YAML frontmatter (must start with ---)\n`);
      return null;
    }
    return ruleFromDict(frontmatter, message);
  } catch (e) {
    process.stderr.write(`Error: Cannot read or parse ${filePath}: ${String(e)}\n`);
    return null;
  }
}
