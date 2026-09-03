// Property-based tests for the command views, with hegel.
//
// The views decide what a bash rule sees, so a mistake here either lets a
// command through or denies one the shell would never run. The properties
// below are the three claims the module makes: the code is the command with
// quoted text taken out, each quoted region lands in the view that names it,
// and scanning an already-scanned code changes nothing.

import { test } from "node:test";
import assert from "node:assert/strict";
import * as hegel from "@hegeldev/hegel";
import * as gs from "@hegeldev/hegel/generators";
import { commandViews } from "../plugin/core/shell-views.ts";

// Hegel's own default case count is what a normal run uses. Raise it for an
// exploratory run: HEGEL_CASES=1000 node --test "test/*.test.ts".
const settings = { testCases: Number(process.env.HEGEL_CASES ?? 100) };

// Text for a part of the command that carries no quoting of its own. `<` is
// out because `<<` opens a heredoc, which the heredoc properties cover.
const plainText = gs.text({ excludeCharacters: "'\"\\<" });
// A single-quoted string ends at the next quote and nothing else is special.
const singleQuotedText = gs.text({ excludeCharacters: "'" });
// A double-quoted string ends at the next unescaped quote.
const doubleQuotedText = gs.text({ excludeCharacters: '"\\' });

const heredocWord = gs.fromRegex("[A-Za-z_][A-Za-z0-9_]{0,7}");

// Is `part` what is left of `whole` after removing characters? Both sides
// step by UTF-16 code unit, the same unit the scanner indexes by, so a
// surrogate pair is compared half by half rather than as one code point.
function isSubsequence(part: string, whole: string): boolean {
  let i = 0;
  for (let j = 0; j < whole.length && i < part.length; j += 1) {
    if (part[i] === whole[j]) i += 1;
  }
  return i === part.length;
}

test("any text is scanned into three strings without throwing", () =>
  hegel.test((tc) => {
    const command = tc.draw(gs.text());
    const views = commandViews(command);
    assert.equal(typeof views.code, "string");
    assert.equal(typeof views.literal, "string");
    assert.equal(typeof views.expanded, "string");
  }, settings));

test("the code is the command with characters removed, never added", () =>
  hegel.test((tc) => {
    const command = tc.draw(gs.text());
    const { code } = commandViews(command);
    assert.ok(
      isSubsequence(code, command),
      `code is not a subsequence of the command: ${JSON.stringify(code)}`,
    );
    assert.ok(code.length <= command.length);
  }, settings));

test("scanning the code again gives the same code", () =>
  hegel.test((tc) => {
    const command = tc.draw(gs.text());
    const once = commandViews(command).code;
    const twice = commandViews(once).code;
    assert.equal(twice, once);
  }, settings));

// The model: a command built from named parts has views this test can state
// without calling the scanner. Any quoted part contributes its delimiters to
// the code and its contents to the view that names it.
test("each quoted part lands in the view that names it", () =>
  hegel.test((tc) => {
    const parts = tc.draw(
      gs.arrays(
        gs.composite<{ kind: string; text: string }>((inner) => {
          const kind = inner.draw(gs.sampledFrom(["plain", "single", "double"]));
          if (kind === "plain") return { kind, text: inner.draw(plainText) };
          if (kind === "single") return { kind, text: inner.draw(singleQuotedText) };
          return { kind, text: inner.draw(doubleQuotedText) };
        }),
        { maxSize: 12 },
      ),
    );

    let command = "";
    let code = "";
    const literal: string[] = [];
    const expanded: string[] = [];
    for (const part of parts) {
      if (part.kind === "plain") {
        command += part.text;
        code += part.text;
      } else if (part.kind === "single") {
        command += `'${part.text}'`;
        code += "''";
        if (part.text) literal.push(part.text);
      } else {
        command += `"${part.text}"`;
        code += '""';
        if (part.text) expanded.push(part.text);
      }
    }

    const views = commandViews(command);
    assert.equal(views.code, code);
    assert.equal(views.literal, literal.join("\n"));
    assert.equal(views.expanded, expanded.join("\n"));
  }, settings));

// A heredoc's body belongs to literal when the word carries quotes and to
// expanded when it does not. Either way the body is out of the code, which
// is the whole reason a rule stopped a file that held a loop.
test("a heredoc body lands in literal or expanded by its word's quoting", () =>
  hegel.test((tc) => {
    const word = tc.draw(heredocWord);
    const quote = tc.draw(gs.sampledFrom(["", "'", '"']));
    // A body line equal to the word would end the heredoc early, so give that
    // line one more character rather than drawing again.
    const lines = tc
      .draw(gs.arrays(gs.text({ excludeCharacters: "\n" }), { maxSize: 6 }))
      .map((line) => (line === word ? `${line} ` : line));
    const command = `cat > out.txt <<${quote}${word}${quote}\n${lines.map((l) => `${l}\n`).join("")}${word}\n`;

    const views = commandViews(command);
    const body = lines.join("\n");

    assert.equal(views.code, `cat > out.txt <<${quote}${word}${quote}\n${word}\n`);
    if (quote === "") {
      assert.equal(views.expanded, body);
      assert.equal(views.literal, "");
    } else {
      assert.equal(views.literal, body);
      assert.equal(views.expanded, "");
    }
  }, settings));

// The friction this module was written for: a command word inside a quoted
// argument is not a command, so a rule that matches command words must not
// see it.
test("a command word inside a quoted argument is not in the code", () =>
  hegel.test((tc) => {
    const before = tc.draw(plainText);
    const after = tc.draw(plainText);
    const quote = tc.draw(gs.sampledFrom(["'", '"']));
    const command = `claude -p ${quote}${before} codex exec --help ${after}${quote} --model sonnet`;

    const { code } = commandViews(command);
    assert.doesNotMatch(code, /(^|[\s;&|(])codex\s+exec\b/i);
  }, settings));
