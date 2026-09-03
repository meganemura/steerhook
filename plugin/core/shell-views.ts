// The views of a bash command. A rule about a command is about what the
// shell does with the text, not about the text itself: `codex exec` inside a
// quoted argument never runs, and a heredoc body is a file's contents. This
// module scans the quoting one time and splits the command into three views.
// Every character lands in exactly one of them.
//
//   code      Everything outside quotes, the quote marks themselves, and a
//             heredoc's operator and terminator. This is what the shell reads
//             as syntax, so it is the view a bash rule matches by default.
//   literal   The contents of single quotes, and the body of a heredoc whose
//             word is quoted. The shell reads none of it.
//   expanded  The contents of double quotes, and the body of a heredoc whose
//             word is not quoted. The shell still expands `$` and a backtick
//             there, so a rule about substitution reads this view.
//
// Boundary: this is a scanner of quoting, not a shell parser. It does not
// know command position, so `sh -c "rm -rf /"` puts the inner command in
// `expanded`, not in `code`. It does not follow `$(...)` or a backtick: both
// are code, and the scanner does not descend into them. It does not expand
// anything. A rule that needs the untouched text reads command_raw instead.

export interface CommandViews {
  code: string;
  literal: string;
  expanded: string;
}

interface PendingHeredoc {
  word: string;
  literal: boolean; // a quoted word means the shell reads nothing in the body
  dashed: boolean; // <<- lets the terminator carry leading tabs
}

// Characters a heredoc word can hold when it carries no quotes. The shell
// allows more, but a word outside this set is rare enough that treating the
// operator as plain code is the safer answer.
const HEREDOC_WORD = /^[A-Za-z0-9_.-]+/;

export function commandViews(command: string): CommandViews {
  let code = "";
  const literal: string[] = [];
  const expanded: string[] = [];
  const pending: PendingHeredoc[] = [];

  const push = (segments: string[], text: string) => {
    if (text) segments.push(text);
  };

  let i = 0;
  const n = command.length;

  while (i < n) {
    const c = command[i];

    // A newline opens the body of every heredoc named on the line above.
    if (c === "\n") {
      code += c;
      i += 1;
      while (pending.length > 0) {
        const heredoc = pending.shift() as PendingHeredoc;
        const body: string[] = [];
        let terminated = false;
        while (i < n) {
          const newline = command.indexOf("\n", i);
          const end = newline < 0 ? n : newline;
          const line = command.slice(i, end);
          const candidate = heredoc.dashed ? line.replace(/^\t+/, "") : line;
          if (candidate === heredoc.word) {
            code += command.slice(i, newline < 0 ? n : newline + 1);
            i = newline < 0 ? n : newline + 1;
            terminated = true;
            break;
          }
          body.push(line);
          i = newline < 0 ? n : newline + 1;
        }
        push(heredoc.literal ? literal : expanded, body.join("\n"));
        // The command ended before the terminator. Every later heredoc has no
        // body to read, so stop looking for one.
        if (!terminated) break;
      }
      continue;
    }

    // A backslash outside quotes quotes one character. Both are code: the
    // shell still reads the pair as syntax, not as text.
    if (c === "\\") {
      code += command.slice(i, i + 2);
      i += i + 1 < n ? 2 : 1; // a trailing backslash quotes nothing
      continue;
    }

    if (c === "'") {
      const end = command.indexOf("'", i + 1);
      if (end < 0) {
        // Unterminated. Read the rest as the string's contents.
        push(literal, command.slice(i + 1));
        code += "'";
        i = n;
        continue;
      }
      push(literal, command.slice(i + 1, end));
      code += "''";
      i = end + 1;
      continue;
    }

    if (c === '"') {
      let j = i + 1;
      let text = "";
      while (j < n) {
        if (command[j] === "\\" && j + 1 < n) {
          // Keep the backslash: a rule such as the backtick warning tells an
          // escaped backtick from a live one by looking for it.
          text += command.slice(j, j + 2);
          j += 2;
          continue;
        }
        if (command[j] === '"') break;
        text += command[j];
        j += 1;
      }
      push(expanded, text);
      code += j < n ? '""' : '"';
      i = j < n ? j + 1 : n;
      continue;
    }

    if (c === "<" && command[i + 1] === "<") {
      // <<< is a here-string, not a heredoc. It carries no body.
      if (command[i + 2] === "<") {
        code += "<<<";
        i += 3;
        continue;
      }
      const heredoc = readHeredocOperator(command, i);
      if (heredoc) {
        code += command.slice(i, heredoc.end);
        pending.push(heredoc.value);
        i = heredoc.end;
        continue;
      }
    }

    code += c;
    i += 1;
  }

  // A quote or a heredoc that never closed leaves its segment already read.
  return { code, literal: literal.join("\n"), expanded: expanded.join("\n") };
}

// Read a heredoc operator that starts at `start`. Returns the pending
// heredoc and the index just past the word, or null when the text after <<
// is not a word this scanner reads.
function readHeredocOperator(command: string, start: number): { value: PendingHeredoc; end: number } | null {
  let j = start + 2;
  let dashed = false;
  if (command[j] === "-") {
    dashed = true;
    j += 1;
  }
  while (command[j] === " " || command[j] === "\t") j += 1;

  const quote = command[j];
  if (quote === "'" || quote === '"') {
    const end = command.indexOf(quote, j + 1);
    if (end < 0) return null;
    return { value: { word: command.slice(j + 1, end), literal: true, dashed }, end: end + 1 };
  }

  // <<\EOF quotes the word too, so the body is literal.
  let quoted = false;
  if (quote === "\\") {
    quoted = true;
    j += 1;
  }
  const match = HEREDOC_WORD.exec(command.slice(j));
  if (!match) return null;
  return { value: { word: match[0], literal: quoted, dashed }, end: j + match[0].length };
}
