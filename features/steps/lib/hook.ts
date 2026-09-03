import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Sandbox } from "./sandbox.js";

export type HookEvent = "PreToolUse" | "Stop" | "UserPromptSubmit";

export interface HookResult {
  exit_code: number;
  output: Record<string, unknown>;
}

interface Evidence {
  attach(name: string, body: string | Uint8Array): Promise<void>;
}

// The plugin under test. STEERHOOK_PLUGIN_ROOT points a run at another
// implementation of the same hooks.json contract; the default is this
// repository's plugin/ directory.
export function pluginRoot(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return process.env.STEERHOOK_PLUGIN_ROOT ?? resolve(here, "..", "..", "..", "plugin");
}

// The command Claude Code would run for this event, read from hooks.json
// with ${CLAUDE_PLUGIN_ROOT} expanded, so a scenario exercises the
// registration and the script together.
export function hookCommand(event: HookEvent): string {
  const root = pluginRoot();
  const hooks = JSON.parse(readFileSync(join(root, "hooks", "hooks.json"), "utf8")) as {
    hooks: Record<string, Array<{ hooks: Array<{ command: string }> }>>;
  };
  const entries = hooks.hooks[event];
  if (!entries || entries.length === 0) throw new Error(`hooks.json registers no ${event} hook`);
  return entries[0].hooks[0].command.replaceAll("${CLAUDE_PLUGIN_ROOT}", root);
}

// Run the hook as Claude Code runs it: the hooks.json command through a
// shell, the input JSON on stdin, the result JSON on stdout. The process
// runs in a directory that holds no rules; only the input's cwd names the
// project. HOME points at the sandbox so ~/.claude/steerhook resolves there.
export async function runHook(
  sandbox: Sandbox,
  event: HookEvent,
  input: Record<string, unknown>,
  evidence: Evidence,
): Promise<HookResult> {
  const command = hookCommand(event);
  const env: Record<string, string> = { ...(process.env as Record<string, string>), CLAUDE_PLUGIN_ROOT: pluginRoot(), HOME: sandbox.home };
  delete env.STEERHOOK_RULES_DIR;
  delete env.STEERHOOK_NODE;
  if (sandbox.nodeOverride) env.STEERHOOK_NODE = sandbox.nodeOverride;
  if (sandbox.rulesDirOverride) env.STEERHOOK_RULES_DIR = sandbox.rulesDirOverride;
  const stdin = JSON.stringify({ session_id: "scenario", cwd: sandbox.project, hook_event_name: event, ...input });
  const proc = spawnSync("sh", ["-c", command], { cwd: sandbox.elsewhere, env, input: stdin, encoding: "utf8" });
  await evidence.attach("hook.command.txt", command);
  await evidence.attach("hook.stdin.json", stdin);
  await evidence.attach("hook.stdout.txt", proc.stdout ?? "");
  await evidence.attach("hook.stderr.txt", proc.stderr ?? "");
  if (proc.error) throw proc.error;
  let output: Record<string, unknown>;
  try {
    output = JSON.parse(proc.stdout) as Record<string, unknown>;
  } catch {
    throw new Error(`hook stdout is not JSON (exit ${proc.status}): ${JSON.stringify(proc.stdout)}; stderr: ${proc.stderr}`);
  }
  return { exit_code: proc.status ?? -1, output };
}

export function hookSpecificOutput(output: Record<string, unknown>): Record<string, unknown> {
  const h = output.hookSpecificOutput;
  return h && typeof h === "object" ? (h as Record<string, unknown>) : {};
}
