# mathmd — accessible math editor

A screen-reader-friendly web editor for math documents: Markdown with LaTeX
and AsciiMath formulas, Desmos graphs, and chess boards. Designed for NVDA.

**Try it:** <https://mathmd.denizsincar.ru>

## What's inside

- **Monaco** editor (the engine behind VS Code)
- **MathJax 4** — LaTeX (`$x^2$`, `$$...$$`) and AsciiMath (backticks: `` `sqrt(2)` ``)
- **Desmos** — interactive graphs, fenced block ` ```desmos `
- **chessjax** — accessible chess boards, fenced block ` ```chess `
- Live preview, one-click export to standalone HTML
- **Linter** — unclosed formulas, broken chess blocks and dangling move
  buttons are underlined in the editor; `Alt+ё` shows the list instead of the
  preview, `F8` / `Shift+F8` jump between errors.

`error.mp3` is the accessibility error signal from
[VS Code](https://github.com/microsoft/vscode) (`src/vs/platform/accessibilitySignal/browser/media/error.mp3`),
MIT licensed.

## Writing

- **Formulas:** LaTeX in `$...$` (inline) or `$$...$$` (display); AsciiMath in backticks `` `...` ``.
- **Graph:** each line of a ` ```desmos ` block is an expression:

  ````md
  ```desmos
  y=x^2
  ```
  ````

- **Chess board:** ` ```chess ` block with board attributes:

  ````md
  ```chess
  fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  ```
  ````

  Also `pgn="url"` (with `move="N"` to jump to a ply), `lang`, `controls="off"`.
  For the full list of controls see the [chessjax](https://github.com/denizsincar29/chessjax) repo.

- **Frontmatter:** document settings at the very top. Type `---` in an empty
  document and the block fills in itself. Keys: `title`, `lang` (ru/en/de),
  `author`, `description`, and module switches `mathjax` / `chessjax` /
  `desmos` (`yes`/`no`). Mathjax is on by default, chessjax and desmos are off.

## Autocomplete

Suggestions appear automatically where the context makes the choice clear:

- **In math** — LaTeX commands inside `$…$` (and friends), AsciiMath inside
  backticks; `\` or the first letter of a command opens the list.
- **Frontmatter** — type a key like `title` and it pops up.
- **Inside ```` ```chess ````** — board attributes (`fen`, `pgn`, …); inside
  ```` ```desmos ```` — expressions.
- **After ```` ``` ````** — pick a whole block: `chess with fen`, `chess with
  pgn`, or `desmos`.

Delimiters, blocks, and Markdown scaffolding appear on **Ctrl+Space**. Plain
text never pops the list.

## Keyboard

| Key | Action |
|---|---|
| `Alt+ё` (or `Alt+\``) | Full preview, jump to cursor line |
| `Ctrl+Shift+Enter` | Hide preview |
| `Alt+M` | Formula: inline / block |
| `Alt+L` | Formula syntax: LaTeX / AsciiMath |
| `Alt+1` … `Alt+9` | Insert formula templates (fraction, root, sum, …) |
| `Ctrl+Space` | Scaffolding suggestions (delimiters, blocks, keys) |
| `F8` / `Shift+F8` | Next / previous error, cursor jumps to the line |
| `Ctrl+S` | Save `.md` (into the same file on disk) |
| `Ctrl+Alt+S` | Save `.md` as a new file |
| `Ctrl+Shift+S` | Save the standalone HTML |

## File & export

- **Open `.md` / Save `.md`** use the File System Access API where it exists
  (Chromium): the editor keeps the file handle and `Ctrl+S` writes straight
  back into the same file on disk, with `Ctrl+Alt+S` for “save as”. `Ctrl+Shift+S`
  saves a standalone HTML page for sharing. Firefox and Safari have no file
  API — there saving downloads a copy into “Downloads” and the editor says so.
- Handles live for the session only: after a reload the first save asks where
  to write again.
- Graphs are embedded into the exported HTML; chess boards render as static
  semantic tables, so the file works without JavaScript.
- The **Examples** dropdown loads demo documents.

## Run locally

Pure static site:

```sh
python3 -m http.server 8000
```

chessjax loads from CDN (jsdelivr), so nothing needs copying.
