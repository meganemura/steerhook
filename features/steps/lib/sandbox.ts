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
