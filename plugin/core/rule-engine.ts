// Ported from hookify's core/rule_engine.py (Apache 2.0, see NOTICE).
// Evaluates rules against a hook input and builds the hook output. The
// output shapes are the fork's: the rule message goes where Claude reads
// it (permissionDecisionReason on a deny, additionalContext on a warning)
// and stays in systemMessage for the user.

import { readFileSync } from "node:fs";
import type { Condition, Rule } from "./config-loader.ts";

export type HookInput = Record<string, unknown>;
export type HookOutput = Record<string, unknown>;

// Cache compiled regexes. A pattern that does not compile is reported
// once on stderr and never matches, as upstream's re.error path did.
const regexCache = new Map<string, RegExp | null>();

function compileRegex(pattern: string): RegExp | null {
  const cached = regexCache.get(pattern);
  if (cached !== undefined) return cached;
  let regex: RegExp | null;
  try {
    regex = new RegExp(pattern, "i");
  } catch (e) {
    process.stderr.write(`Invalid regex pattern '${pattern}': ${String(e)}\n`);
    regex = null;
  }
  regexCache.set(pattern, regex);
  return regex;
}

function toolInputOf(input: HookInput): Record<string, unknown> {
  const t = input.tool_input;
  return typeof t === "object" && t !== null ? (t as Record<string, unknown>) : {};
}

function stringOf(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === undefined || value === null) return "";
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

// Evaluate all rules and return the combined hook output. Blocking rules
// take priority over warning rules. All matching rule messages are joined.
// Returns {} when no rule matches.
export function evaluateRules(rules: Rule[], input: HookInput): HookOutput {
  const hookEvent = stringOf(input.hook_event_name);
  const blocking: Rule[] = [];
  const warning: Rule[] = [];

  for (const rule of rules) {
    if (ruleMatches(rule, input)) {
      if (rule.action === "block") blocking.push(rule);
      else warning.push(rule);
    }
  }

  const combine = (matched: Rule[]) => matched.map((r) => `**[${r.name}]**\n${r.message}`).join("\n\n");

  if (blocking.length > 0) {
    const message = combine(blocking);
    if (hookEvent === "Stop") {
      return { decision: "block", reason: message, systemMessage: message };
    }
    if (hookEvent === "PreToolUse") {
      return {
        hookSpecificOutput: {
          hookEventName: hookEvent,
          permissionDecision: "deny",
          permissionDecisionReason: message,
        },
        systemMessage: message,
      };
    }
    if (hookEvent === "UserPromptSubmit") {
      return { decision: "block", reason: message };
    }
    return { systemMessage: message };
  }

  if (warning.length > 0) {
    const message = combine(warning);
    // Stop keeps systemMessage only: additionalContext on Stop keeps
    // Claude running, which is more than a warning.
    if (hookEvent === "PreToolUse" || hookEvent === "UserPromptSubmit") {
      return {
        hookSpecificOutput: { hookEventName: hookEvent, additionalContext: message },
        systemMessage: message,
      };
    }
    return { systemMessage: message };
  }

  return {};
}

function ruleMatches(rule: Rule, input: HookInput): boolean {
  const toolName = stringOf(input.tool_name);
  const toolInput = toolInputOf(input);

  if (rule.toolMatcher && !matchesTool(rule.toolMatcher, toolName)) return false;

  // Rules must have at least one condition to be valid
  if (rule.conditions.length === 0) return false;

  // All conditions must match
  return rule.conditions.every((c) => checkCondition(c, toolName, toolInput, input));
}

function matchesTool(matcher: string, toolName: string): boolean {
  if (matcher === "*") return true;
  return matcher.split("|").includes(toolName);
}

function checkCondition(condition: Condition, toolName: string, toolInput: Record<string, unknown>, input: HookInput): boolean {
  const value = extractField(condition.field, toolName, toolInput, input);
  if (value === null) return false;

  const pattern = condition.pattern;
  switch (condition.operator) {
    case "regex_match": {
      const regex = compileRegex(pattern);
      return regex !== null && regex.test(value);
    }
    case "contains":
      return value.includes(pattern);
    case "equals":
      return value === pattern;
    case "not_contains":
      return !value.includes(pattern);
    case "starts_with":
      return value.startsWith(pattern);
    case "ends_with":
      return value.endsWith(pattern);
    default:
      return false;
  }
}

function readTranscript(path: string): string {
  try {
    return readFileSync(path, "utf8");
  } catch (e) {
    process.stderr.write(`Warning: Cannot read transcript ${path}: ${String(e)}\n`);
    return "";
  }
}

// Extract a field value from the tool input or the hook input. Returns
// null when the field is not known for this tool or event.
function extractField(field: string, toolName: string, toolInput: Record<string, unknown>, input: HookInput): string | null {
  // Direct tool_input fields
  if (field in toolInput) return stringOf(toolInput[field]);

  // Stop, UserPromptSubmit, and other non-tool events read the hook input
  if (field === "reason") return stringOf(input.reason);
  if (field === "transcript") {
    const transcriptPath = input.transcript_path;
    if (typeof transcriptPath === "string" && transcriptPath) return readTranscript(transcriptPath);
  } else if (field === "user_prompt") {
    // The hook input carries the text in "prompt" (documented); upstream
    // read "user_prompt", so a prompt rule never fired.
    return stringOf(input.prompt ?? input.user_prompt);
  }

  // Special cases by tool type
  if (toolName === "Bash") {
    if (field === "command") return stringOf(toolInput.command);
  } else if (toolName === "Write" || toolName === "Edit") {
    if (field === "content") return stringOf(toolInput.content || toolInput.new_string);
    if (field === "new_text" || field === "new_string") return stringOf(toolInput.new_string);
    if (field === "old_text" || field === "old_string") return stringOf(toolInput.old_string);
    if (field === "file_path") return stringOf(toolInput.file_path);
  } else if (toolName === "MultiEdit") {
    if (field === "file_path") return stringOf(toolInput.file_path);
    if (field === "new_text" || field === "content") {
      const edits = Array.isArray(toolInput.edits) ? (toolInput.edits as Array<Record<string, unknown>>) : [];
      return edits.map((e) => stringOf(e.new_string)).join(" ");
    }
  }

  return null;
}
