// Shared body of the three hook entry points. Reads the hook input from
// stdin, loads the rules for the event, and prints the hook output as
// JSON. Every path prints valid JSON and exits 0: a broken rule file or a
// bad input must never block a tool call by accident.

import { readFileSync } from "node:fs";
import { loadRules } from "../core/config-loader.ts";
import { evaluateRules, type HookInput } from "../core/rule-engine.ts";

export function runHook(eventFor: (input: HookInput) => string | undefined): void {
  let output: Record<string, unknown>;
  try {
    const input = JSON.parse(readFileSync(0, "utf8")) as HookInput;
    const rules = loadRules(eventFor(input));
    output = evaluateRules(rules, input);
  } catch (e) {
    output = { systemMessage: `steerhook error: ${e instanceof Error ? e.message : String(e)}` };
  }
  process.stdout.write(JSON.stringify(output) + "\n");
}
