// Ported from hookify's hooks/stop.py (Apache 2.0, see NOTICE).
// Stop: runs when Claude wants to end its turn; sees "stop" rules.
import { runHook } from "./common.ts";

runHook(() => "stop");
