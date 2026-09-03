import { join } from "node:path";
import { defineStep, z } from "nukadoko";
import type { Sandbox } from "./lib/sandbox.js";

export default defineStep({
  pattern: "STEERHOOK_NODE names a node that does not exist",
  description: "Point STEERHOOK_NODE at a path with no executable, so the launcher cannot start node for the hooks that follow",
  rationale:
    "The launcher's not-found path is what keeps a missing node from switching the rules off in silence. " +
    "Emptying PATH would still find node in absolute install locations on some machines, so the scenario " +
    "uses the explicit override, which the launcher takes without searching further.",
  args: z.object({}),
  returns: z.object({ node: z.string().describe("The path STEERHOOK_NODE was set to") }),
  mutates: true,
  async run({ sandbox }) {
    const sb = sandbox as Sandbox;
    const node = join(sb.root, "no-such-node");
    sb.nodeOverride = node;
    return { node };
  },
});
