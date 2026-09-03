# Table Viewer

Drop a spreadsheet on the page, or paste a link. The page shows the data as a table.
You can search and sort the table.

The app is one static `index.html` file. The browser does all the work. The app does not upload your data.

## Deploy

**Cloudflare Pages:** Connect a Pages project to this repository. Do not set a build command.
Set the output directory to `/`. Pages finds `functions/proxy.js` and deploys it as a Pages Function.

**Local test:** Run `npx wrangler pages dev .` to test with the Pages Function.
Or run `python3 -m http.server` to test without it. You can also open `index.html` in a browser.

## Links and CORS

The browser gets a pasted link directly. This works for sites that send CORS headers.
Examples: published Google Sheets, GitHub raw and blob links, Dropbox share links, and most open data portals.

Some sites do not send CORS headers. Many government and company download pages are examples.
A browser cannot read files from these sites. For these links, the page uses `/proxy?url=...`.
The Pages Function in `functions/proxy.js` serves this path. It accepts requests from this site only.

If you do not want the function, delete the file. The page then tells the user to download the file
and drop it on the page.

## Features

- Drop a file on the page, select a file, or paste with Ctrl+V. You can paste a file, CSV text, or a link.
- File types: CSV, TSV, Excel (.xlsx, .xls, .xlsm, .xlsb), ODS, and JSON (an array of objects or arrays).
- Link types: direct file links, Google Sheets share links (the sheet must be public or published to the web),
  GitHub blob links, and Dropbox share links. You can also open `/?url=<link>` to load a link.
- A workbook with more than one sheet gets a sheet selector.
- Search finds text in all columns. Matches are highlighted. Ctrl+F moves the cursor to the search box.
- Click a column header to sort. Click again to reverse the order. Click a third time to remove the sort.
  Number columns sort as numbers. This includes values such as `$1,234` and `12%`. Empty cells go last.
- The "Header row" box selects the row that contains the column names. If the first row only contains
  `1, 2, 3, ...`, the page uses the next row.
- The page shows 50 to 5000 rows at a time. You can turn on text wrap.
  You can download the rows that are shown as a CSV file.
