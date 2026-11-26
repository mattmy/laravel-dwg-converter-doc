# Errors and troubleshooting

Use `reason()` to identify a failure and find the corresponding troubleshooting steps.
Each package exception also provides a sanitized `context()` for server-side diagnostics.

## Handle failures

After validating the upload, catch `InvalidDwg` to show an error on the upload field. Other exceptions
can go to Laravel's exception handler.

```php
use Mattmy\DwgConverter\Exceptions\InvalidDwg;
use Mattmy\DwgConverter\Facades\Dwg;

try {
    $result = Dwg::toDxf($request->file('drawing'))->convert();
    $path = $result->storeAs('drawings');
} catch (InvalidDwg $exception) {
    return back()->withErrors(['drawing' => 'This DWG could not be read.']);
}
```

Keep `context()` in server logs rather than displaying it to users. Its contents are sanitized, but previous
exceptions and stack traces may still contain server paths. Restrict access to full exception reports.

## Exception categories

| Exception | Typical reasons |
|---|---|
| `LibreDwgUnavailable` | `executable_not_found`, `unsupported_tool_capability`, `invalid_configuration` |
| `InvalidDwg` | invalid upload/path/header, input too large, `libredwg_rejected_input` |
| `DwgOperationFailed` | timeout, process/output/format/storage failure, missing thumbnail |

## Command not found

Run the operation's [verification command](./external-tools), then configure its absolute path if necessary.
Only troubleshoot the commands used by the failing operation.

## Image command succeeds but no file appears

- On Windows, set the LibreOffice path to `soffice.com`.
- Use a short absolute `temporary_directory`.
- Confirm LibreOffice 7.4+ and ImageMagick 7 `magick`.
- Confirm the worker can write to the temporary directory.

## Invalid image preview

`image_invalid` means an intermediate or final preview failed the format or dimension checks.
For WebP, the file must contain actual image data in addition to valid container headers.

## No embedded thumbnail

A DWG without an embedded preview throws `DwgOperationFailed` with reason `thumbnail_not_found`.
Use `toImage()` if you need a rendered preview.

`thumbnail_invalid` means a preview was found but failed the basic BMP/PNG/WMF structure checks. The package
does not repair it. See [thumbnail validation](./thumbnails#validation-boundary).

## JSON validation failure

`json_invalid` means the generated JSON could not be read or decoded. If `getPrevious()` returns a
`JsonException` with code `JSON_ERROR_DEPTH`, PHP could not decode the file within its nesting limit
(`depth = 512`).

## Output too large

For `output_too_large` from `toJson()->convert()` or `info()->read()`, check both JSON and general output
limits. The limit applies to the full generated JSON, which can be much larger than the DWG.
See [Runtime settings](./configuration#runtime-settings).

## Layer query failure

`layers_invalid` means the query failed because the tool returned invalid UTF-8 or malformed records.
A successful query with no records returns an empty collection. See [Reading layer data](./layers).

If the tool lacks `--on`, `onlyOn()->read()` throws `LibreDwgUnavailable` with reason `unsupported_tool_capability`.
Update the tool or remove this option to read all layers.

## Storage failure

Check the disk permissions and the [directory and filename rules](./inputs-and-outputs#one-time-output).
If `storeAs()` fails, rerun the operation to get a fresh output before trying to save again.

## Temporary cleanup warning

If you see `DWG converter temporary cleanup failed.` at `warning` level, check whether the worker can remove
files from its temporary directory. This warning does not undo a completed conversion or delivery. If the
operation itself failed, you still receive its original exception.

Temporary files may remain, and the package does not retry cleanup. A logging failure also does not interrupt
the operation. See [logging and privacy](./performance-and-security#logging-and-privacy) for what gets logged.

## Entity queries {#entity-queries}

`entities_invalid` means the JSON artifact could not be read, the JSON was invalid, or its required entity
structure was missing. The root must be an object and `OBJECTS` an array (`[]` is valid; `{}` is not).
`HEADER` is optional; missing unit information becomes a diagnostic.
Use `getPrevious()` to inspect an original JSON decoding or read exception. Missing or empty artifacts use `output_missing`.

If the query returns a result with `issues` or `diagnostics`, see [Understand the result](./entities#understand-the-result).

## Drawing information {#drawing-information}

`invalid_dwg_header` means the header is shorter than six bytes or does not match `AC10` followed by two
digits. A code that matches this pattern but has no known format is returned with `format = null`.
`info_invalid` indicates that the JSON artifact could not be read or decoded, or its root was not an object.
Missing or empty artifacts use `output_missing`. An unavailable metadata field in a successful result is
`null`.
See [Reading drawing information](./drawing-info).
