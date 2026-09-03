// Ported from hookify's hooks/userpromptsubmit.py (Apache 2.0, see NOTICE).
// UserPromptSubmit: runs when the user submits a prompt; sees "prompt" rules.
import { runHook } from "./common.ts";

runHook(() => "prompt");
