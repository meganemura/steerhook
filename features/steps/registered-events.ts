import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect } from "playwright/test";
import { defineStep, z } from "nukadoko";
import { pluginRoot } from "./lib/hook.js";

export default defineStep({
  pattern: "the plugin registers hooks for these events",
  description: "Read hooks.json and assert it registers exactly the events in the table, each with a script that exists",
  rationale: "hooks.json is the contract Claude Code reads; the table is the whole list, so an event added or dropped fails here.",
  args: z.object({
    events: z.array(z.array(z.string())).describe("The data table's rows, one event name per row"),
  }),
  returns: z.object({
    events: z.array(z.string()).describe("The events hooks.json registers, sorted"),
    scripts: z.array(z.string()).describe("The script path each registered command names, relative to the plugin root"),
  }),
  mutates: false,
  async run({}, args) {
    const root = pluginRoot();
    const hooks = JSON.parse(readFileSync(join(root, "hooks", "hooks.json"), "utf8")) as {
      hooks: Record<string, Array<{ hooks: Array<{ command: string }> }>>;
    };
    const events = Object.keys(hooks.hooks).sort();
    const expected = args.events.map((row) => row[0]).sort();
    expect(events, "registered events").toEqual(expected);
    const scripts: string[] = [];
    for (const entries of Object.values(hooks.hooks)) {
      for (const entry of entries) {
        for (const hook of entry.hooks) {
          const m = /\$\{CLAUDE_PLUGIN_ROOT\}\/([^"' ]+)/.exec(hook.command);
          expect(m, `command names a script under the plugin root: ${hook.command}`).not.toBeNull();
          const script = m![1];
          expect(existsSync(join(root, script)), `script exists: ${script}`).toBe(true);
          scripts.push(script);
        }
      }
    }
    return { events, scripts };
  },
});
