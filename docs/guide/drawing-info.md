# Reading drawing information

Use `Dwg::version($source)` to identify the format a DWG file was saved in. For drawing details such as insertion
units, title, author, or last save time, use `Dwg::info($source)->read()`.

See [Choose a DWG source](./inputs-and-outputs#sources) for supported inputs.

## Identify the stored format

```php
use Mattmy\DwgConverter\Facades\Dwg;

$version = Dwg::version($source);
$code = $version->code;     // e.g. 'AC1032'
$format = $version->format; // e.g. 'R2018', or null for an unknown code
```

`version()` reads up to six bytes of the header and requires no external tools. Several software versions
can share the same DWG format. A recognized format only confirms the header, so decoding can still fail.

## Read drawing metadata

> Requires LibreDWG `dwgread` with JSON output support. See [External tools](./external-tools#libredwg).

```php
$info = Dwg::info($source)->read();
$title = $info->summary?->title;
$lastSavedAt = $info->timestamps?->lastSavedAt;
```

- `version` contains the stored format of the same source snapshot used for the query.
- `drawingUnits` exposes the insertion unit code (INSUNITS) and its `status`. Recognized units are
  `SPECIFIED`, zero is `UNSPECIFIED`, and missing or unrecognized units are `UNKNOWN`.
- `summary` contains the title, subject, author, keywords, comments, hyperlink base, last saved by,
  revision number, and custom properties. An unavailable summary or empty text field is `null`.
  Non-empty text is preserved as supplied.
- `summary->customProperties` is an ordered list of `name` and `value` pairs, including repeated names.
  An explicit empty list is `[]`. An absent or unreadable list is `null`.
- `timestamps` exposes `createdAt` and `lastSavedAt` as RFC 3339 UTC strings ending in `Z`, with
  milliseconds when nonzero. An unavailable time is `null`. If neither is available, `timestamps` is `null`.

Each `read()` runs a new query and returns reusable data. Even when you only need one field, it generates
and decodes the full JSON and applies the [same byte limits and timeout as `toJson()`](./configuration#runtime-settings).

Some LibreDWG builds emit invalid UTF-8 for characters such as certain emoji. In that case `read()` fails
with `info_invalid`. See [troubleshooting](./errors-and-troubleshooting#drawing-information).
