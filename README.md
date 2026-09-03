# Table Viewer

Drop a spreadsheet on the page, or paste a link. The page shows the data as a table.
You can search and sort the table.

The app is one static file, `public/index.html`. The browser does all the work. The app does not upload your data.

## Deploy

The repository works as a Cloudflare Worker or as a Cloudflare Pages project.

**Worker (recommended):** In the Cloudflare dashboard, go to Workers & Pages, then Create, then
connect this repository. Do not set a build command. The deploy command is `npx wrangler deploy`.
The settings come from `wrangler.jsonc`. The Worker serves the `public/` directory and the `/proxy` path.
To deploy from your computer, run `npx wrangler deploy`.

**Pages:** Create a Pages project from this repository. Do not set a build command.
Set the output directory to `public`. Pages finds `functions/proxy.js` and deploys it as a Pages Function.

**Local test:** Run `npx wrangler dev` for the Worker, or `npx wrangler pages dev public` for Pages.
You can also open `public/index.html` in a browser. Then pasted links work only for sites that send CORS headers.

## Links and CORS

The browser gets a pasted link directly. This works for sites that send CORS headers.
Examples: published Google Sheets, GitHub raw and blob links, Dropbox share links, and most open data portals.

Some sites do not send CORS headers. Many government and company download pages are examples.
A browser cannot read files from these sites. For these links, the page uses `/proxy?url=...`.
The code in `src/proxy.js` serves this path. It accepts requests from this site only.
It sends all data as a download, never as a page. It stops after 100 MB.

If you do not want the proxy, delete `src/`, `functions/`, and `wrangler.jsonc`. The page then tells
the user to download the file and drop it on the page.

## Features

- Drop a file on the page, select a file, or paste with Ctrl+V. You can paste a file, CSV text, or a link.
- File types: CSV, TSV, Excel (.xlsx, .xls, .xlsm, .xlsb), ODS, and JSON (an array of objects or arrays).
- Link types: direct file links, Google Sheets share links (the sheet must be public or published to the web),
  GitHub blob links, and Dropbox share links. You can also open `/?url=<link>` to load a link.
- A workbook with more than one sheet gets a sheet selector.
- Search finds text in all visible columns. Matches are highlighted. Ctrl+F moves the cursor to the search box.
  Esc clears the search.
- Click a column name to sort. Click again to reverse the order. Click a third time to remove the sort.
  Number columns sort as numbers. This includes values such as `$1,234` and `12%`. Empty cells go last.
- Drag the right edge of a column name to change the width. Double-click the edge to fit the content.
  The edge is a keyboard control: Tab to it and use the arrow keys.
- The "Columns" menu shows or hides columns.
- Click a cell to select it. Double-click it, or press Enter, to see the full value and copy it.
  The arrow keys move between cells. PageDown and PageUp change the page.
- The row numbers stay in view when the table scrolls sideways.
- The "Header row" box selects the row that contains the column names. If the first row only contains
  `1, 2, 3, ...`, the page uses the next row.
- The page shows 50 to 5000 rows at a time. You can turn on text wrap.
  You can download all filtered rows and visible columns as a CSV file.
- A progress bar shows while a file loads. Errors and warnings show in a banner that you can dismiss.
- The page works with a keyboard and a screen reader. Controls have names, and the sort state is announced.
