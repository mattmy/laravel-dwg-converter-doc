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
    report([$exception->reason(), $exception->context()]);
} catch (InvalidDwg $exception) {
    return back()->withErrors(['drawing' => 'The DWG could not be accepted.']);
} catch (DwgOperationFailed $exception) {
    report([$exception->reason(), $exception->context()]);
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

## Storage failure

An explicit filename must be a safe basename. The package appends or normalizes the trusted output extension.
A failed `storeAs()` still consumes the output and cleans its temporary artifact; run the conversion again
before retrying delivery.
