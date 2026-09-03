#!/bin/sh
# Launcher for the steerhook hooks. Claude Code runs a hook with the PATH
# of the process that started it; a GUI launch can carry a minimal PATH
# that has no node. python3 sits in /usr/bin, node does not. This script
# finds node in the usual places and runs the hook, or says on stdout
# that it could not, so a missing node never switches the rules off in
# silence. It exits 0 on every path, like the hooks themselves.
#
# Usage: run.sh <hook-name>   (pretooluse, stop, userpromptsubmit)

hook="$1"
root="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
script="$root/hooks/$hook.ts"

find_node() {
  if command -v node >/dev/null 2>&1; then
    command -v node
    return 0
  fi
  for candidate in \
    "$HOME/.local/share/mise/shims/node" \
    "$HOME/.volta/bin/node" \
    "$HOME/.local/share/fnm/aliases/default/bin/node" \
    "/opt/homebrew/bin/node" \
    "/usr/local/bin/node"
  do
    if [ -x "$candidate" ]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done
  # nvm keeps one directory per version; take the newest.
  if [ -d "$HOME/.nvm/versions/node" ]; then
    newest=$(ls -1 "$HOME/.nvm/versions/node" 2>/dev/null | sort -V | tail -1)
    if [ -n "$newest" ] && [ -x "$HOME/.nvm/versions/node/$newest/bin/node" ]; then
      printf '%s\n' "$HOME/.nvm/versions/node/$newest/bin/node"
      return 0
    fi
  fi
  return 1
}

# STEERHOOK_NODE names the node to use, for a launch whose PATH has none
# (set it in the env section of settings.json). It is not searched further.
if [ -n "$STEERHOOK_NODE" ]; then
  if [ -x "$STEERHOOK_NODE" ]; then
    node_bin="$STEERHOOK_NODE"
  else
    cat >/dev/null
    printf '%s\n' "{\"systemMessage\": \"steerhook: STEERHOOK_NODE names $STEERHOOK_NODE, which is not an executable, so no rule was applied to this call.\"}"
    exit 0
  fi
else
node_bin=$(find_node) || {
  # Drain stdin so the caller never sees a broken pipe.
  cat >/dev/null
  printf '%s\n' '{"systemMessage": "steerhook: node was not found on PATH or in the usual install locations, so no rule was applied to this call. Put node on the PATH Claude Code starts with."}'
  exit 0
}
fi

exec "$node_bin" "$script"
