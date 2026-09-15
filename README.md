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
- **Cloud documents** — open and save documents in an
  [mdcloud](https://github.com/denizsincar29/mdcloud) instance (`Alt+O`).

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
| `Escape` | Leave the editor (focus goes to the preview button) |
| `Ctrl+S` | Save (into the cloud document or the same file on disk) |
| `Ctrl+Alt+S` | Save as a new cloud address / a new file |
| `Ctrl+Shift+S` | Save the standalone HTML |
| `Alt+O` | Cloud documents: list, open, save, sign in |

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

## Cloud documents

`Alt+O` (or the **Cloud documents** button) talks to an
[mdcloud](https://github.com/denizsincar29/mdcloud) server — by default
`https://mdcloud.denizsincar.ru`; set `window.MATHMD_CLOUD` before `cloud.js`
loads to point somewhere else.

- The dialog signs you in (username/password) and lists your documents; picking
  one opens it as a normal editor document, with the local draft kept in the
  **Document** list.
- `Ctrl+S` on a document that came from the cloud writes it back to the cloud:
  the server bumps *edited at*, and the cloud page shows the new text. Documents
  that came from a file still save to that file.
- `Ctrl+Alt+S` saves under a new cloud address; the *Save to the cloud* form in
  the dialog does the same for the current document.
- A link `mathmd.denizsincar.ru/#cloud=owner/path` (fragment, never sent to the
  server) opens that document straight away — it is what the cloud page's
  **Edit** button uses, so the path stays out of server logs.
- The session is an httpOnly cookie on the shared parent domain, so signing in
  once covers both the editor and the cloud page. `cloud.js` holds no tokens —
  the browser attaches the cookie itself.

## Tests

```sh
node test/cloud.test.mjs
```

Checks `cloud.js` without a browser: URL building (Cyrillic and nested paths),
request bodies, cookie credentials, and error mapping. No dependencies.

## Run locally

Pure static site:

```sh
python3 -m http.server 8000
```

chessjax loads from CDN (jsdelivr), so nothing needs copying.
