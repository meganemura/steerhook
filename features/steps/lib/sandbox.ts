// The shape the sandbox fixture in nukadoko.config.ts hands to a step.
export interface Sandbox {
  root: string;
  home: string;
  userRules: string;
  project: string;
  projectRules: string;
  elsewhere: string;
  rulesDirOverride: string | undefined;
  nodeOverride: string | undefined;
}

// The acceptance records are committed and public. The sandbox root is a
// per-machine temporary path, so every string that leaves a step (a return
// value, an evidence file) has it replaced by one fixed placeholder.
export const SANDBOX_PLACEHOLDER = "<sandbox>";

export function redact(sandbox: Sandbox, text: string): string {
  return text.split(sandbox.root).join(SANDBOX_PLACEHOLDER);
}
