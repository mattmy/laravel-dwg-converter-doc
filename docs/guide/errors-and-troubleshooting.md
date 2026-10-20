# Errors and troubleshooting

The package exposes three exception types. Each supplies a stable `reason()` and sanitized scalar `context()`
for application handling and diagnostics.

## Handle failures

```php
use Mattmy\DwgConverter\Exceptions\DwgOperationFailed;
use Mattmy\DwgConverter\Exceptions\InvalidDwg;
use Mattmy\DwgConverter\Exceptions\LibreDwgUnavailable;
use Mattmy\DwgConverter\Facades\Dwg;

try {
    $result = Dwg::toDxf($request->file('drawing'))->convert();
} catch (LibreDwgUnavailable $exception) {
    report($exception);
} catch (InvalidDwg $exception) {
    return back()->withErrors(['drawing' => 'The DWG could not be accepted.']);
} catch (DwgOperationFailed $exception) {
    report($exception);
}
```

Do not show raw diagnostic context to end users. It is bounded and path-redacted, but is intended for server
diagnostics.

## Exception categories

| Exception | Typical reasons |
|---|---|
| `LibreDwgUnavailable` | `executable_not_found`, `unsupported_tool_capability`, `invalid_configuration` |
| `InvalidDwg` | invalid upload/path/header, input too large, `libredwg_rejected_input` |
| `DwgOperationFailed` | timeout, process/output/format/storage failure, missing thumbnail |

`libredwg_rejected_input` means the selected LibreDWG command rejected this source. It does not certify files
that were accepted as safe or fully conforming.

## Command not found

Run the operation's [verification command](./external-tools), then configure its absolute path if necessary.
Only troubleshoot the commands used by the failing operation.

## Image command succeeds but no file appears

- On Windows, use `soffice.com` rather than `soffice.exe`.
- Use a short absolute `temporary_directory`.
- Confirm LibreOffice 7.4+ and ImageMagick 7 `magick`.
- Confirm the worker can write to the temporary directory.

## No embedded thumbnail

`thumbnail_not_found` is a normal result for a valid DWG without a preview. Use `toImage()` if a rendered
preview is required.

`thumbnail_invalid` means a preview was found but failed the basic BMP/PNG/WMF structure checks. The package
does not repair it. See [thumbnail validation](./thumbnails#validation-boundary).

## JSON validation failure

`json_invalid` can mean either a syntax error or too much nesting for PHP's native `depth = 512` limit.
Check `$exception->getPrevious()`: if it is a `JsonException` with code `JSON_ERROR_DEPTH`, the JSON was too
deeply nested. That does not necessarily mean its syntax was wrong.

## Storage failure

An explicit filename must be a safe basename. The package appends or normalizes the trusted output extension.
A failed `storeAs()` still consumes the output and attempts temporary cleanup; run the conversion again
before retrying delivery.

## Temporary cleanup warning

If you see `DWG converter temporary cleanup failed.` at `warning` level, check whether the worker can remove
files from its temporary directory. This warning does not undo a completed conversion or delivery. If the
operation itself failed, you still receive its original exception.

Temporary files may remain, and the package does not retry cleanup. A logging failure also does not interrupt
the operation. See [logging and privacy](./performance-and-security#logging-and-privacy) for what gets logged.
