# steerhook

[English](README.md)

向きを変える hook である。
Claude に走らせたくないコマンドの型と、代わりに取ってほしい形を、規則として書く。
Claude が道具を動かす前に、steerhook が呼び出しを規則に当てる。
規則は呼び出しを止めることも、警告を付けて通すこともできる。
どちらの場合も規則の文が Claude に届くので、Claude はそれが要る場面で代わりの形を知る。

規則の置き場は利用者の側にある。
`~/.claude/steerhook/` に置き、すべてのプロジェクトで効く。
プロジェクト自身が持つ規則は読まない。

steerhook は Anthropic の Claude Code 向け plugin
[hookify](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/hookify)
を fork したものである（Apache 2.0、`NOTICE` を参照）。

## hookify との違い

- **規則の文が Claude に届く**：hookify は文を利用者にしか送らない。Claude
  には「拒否された」としか見えず、規則が求めている代わりの形を知る手立てがない。
  steerhook は block なら `permissionDecisionReason`、warn なら
  `additionalContext` として送る。利用者には従来どおり `systemMessage` で見える。
- **規則の置き場は `~/.claude/steerhook/*.md`**：hookify
  はプロジェクトからしか読まない。自分の道具についての規則はどのプロジェクトでも
  効いてほしいので、置き場が一つ要る。`/steerhook:add`
  と規則を書く skill はここに書く。別の場所にするなら `STEERHOOK_RULES_DIR` を設定する。
- **プロジェクト自身の規則を読まない**：hookify
  では、プロジェクト側の規則が同じ名前で利用者の規則を上書きできる。steerhook
  はそれを許さない。プロジェクトを開くことは、そのプロジェクトを信用することと同じではない。
  そこに置かれた規則ファイルは、確認を挟まずに利用者の規則を差し替えたり切ったりできてしまう。
- **PostToolUse hook を外した**：規則は道具への入力しか読まない。
  そのため PostToolUse は PreToolUse と同じ検査を繰り返し、同じ文を記録に二度残していた。
- **bash の規則はシェルが走らせるものに当たる**：hookify
  は生のコマンド文字列に当てる。引用された引数の中の `codex exec` も、heredoc
  の本文に書かれた `while` ループも規則を発火させるが、シェルはどちらも走らせない。
  steerhook は引用の構造を走査し、コードに当てる。規則は他の見え方を名指すこともできる
  （`command_literal`、`command_expanded`、`command_raw`）。
- **引用符を剥がすのは一組だけ**：hookify は両端の `"` と `'` をすべて剥がしていた。
  `[^"]*"` のような正規表現は、閉じ引用符を失っていた。

## 導入

```sh
/plugin marketplace add meganemura/steerhook
/plugin install steerhook@steerhook
```

作業ツリーから一回のセッションだけ読み込むなら、次のようにする。

```sh
claude --plugin-dir /path/to/steerhook/plugin
```

## 規則を書く

`~/.claude/steerhook/no-direct-codex-exec.md`:

```markdown
---
name: no-direct-codex-exec
enabled: true
event: bash
pattern: (^|[\s;&|(])codex\s+exec\b
action: block
---

Do not run `codex exec` from Bash. Send the task to the `codex:codex-rescue`
subagent with `--wait`, so the completion arrives as an agent notification.
```

`/steerhook:add <止めたいこと>` は規則を書いてくれる。
`/steerhook:list` は読み込まれている規則を出す。
欄と event の一覧、および Claude に何が見えるかは、手引きである `plugin/README.md` にある。

## 動作条件

Node 22.18 以降が要る。
hook は node がそのまま実行する TypeScript ファイルなので、ビルドも導入作業もない。
Node 26.7.0 で動作を確認している。
古い node はファイルを読めず構文エラーで終了し、Claude Code はそれを hook のエラーとして表示する。
これは node の版の問題であって、規則の問題ではない。

Claude Code は、自分を起動したプロセスの PATH で hook を動かす。
GUI から起動すると、node の無い PATH を引き継ぐことがある。
起動スクリプトは、よくある導入先（mise、volta、fnm、nvm、Homebrew）を順に探す。
node を自分で指すなら `STEERHOOK_NODE` にそのパスを入れる。
置き場の一つは `~/.claude/settings.json` の `env` である。
node が見つからないとき、hook はその旨を利用者向けの文で伝え、呼び出しはそのまま通す。

## 開発

```sh
npm install              # シナリオ用の nukadoko と、性質テスト用の hegel
npx nuka check           # feature と step の静的検査
npm test                 # command view の性質テスト
npx nuka run features    # すべてのシナリオを走らせる
```

`features/` のシナリオが挙動の契約である。
Claude Code と同じように、`hooks.json` の登録を通して hook スクリプトを起動し、標準入力に JSON を渡す。
実装言語には依存しないので、`STEERHOOK_PLUGIN_ROOT` を指せば同じ契約の別実装に対しても回せる。

`test/` には command view の性質テストが入っている。
hegel で書いてある。
コマンドを列挙せずに生成するので、誰も書こうとしなかった文字列に対して走査器を試せる。
試行回数を上げるなら `HEGEL_CASES=1000 npm test` とする。

## ライセンス

Apache License 2.0。
`LICENSE` と `NOTICE` を参照。
