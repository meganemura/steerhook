// Ported from hookify's hooks/pretooluse.py (Apache 2.0, see NOTICE).
// PreToolUse: runs before a tool executes. Bash calls see "bash" rules,
// Edit/Write/MultiEdit calls see "file" rules, and every call sees "all".
import { runHook } from "./common.ts";

runHook((input) => {
  const tool = input.tool_name;
  if (tool === "Bash") return "bash";
  if (tool === "Edit" || tool === "Write" || tool === "MultiEdit") return "file";
  return undefined;
});
