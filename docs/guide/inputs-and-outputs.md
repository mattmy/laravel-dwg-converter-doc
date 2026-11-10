# Inputs and outputs

Learn how to pass a DWG to the package and use the result. Save generated files to Laravel Storage or read
their bytes. Queries return data you can use directly.

## Choose a DWG source {#sources}

All operations accept an uploaded file (`UploadedFile`), a local absolute path, or DWG bytes wrapped in
`DwgBinary`. `convert()`, `extract()`, and `read()` work on a temporary copy. `Dwg::version()` reads the
source header directly. All leave the source unchanged.

### Uploaded files

Pass a valid Laravel `UploadedFile` directly.

```php
use Mattmy\DwgConverter\Facades\Dwg;

$result = Dwg::toDxf($request->file('drawing'))->convert();
```

Invalid or incomplete uploads fail before an external command starts.
Validate that the field contains a file before calling the package: `$request->file('drawing')` can return
`null`, which is not an accepted source type.

### Local absolute paths

A plain string always means a local absolute path.

```php
$result = Dwg::toDxf(storage_path('app/private/floor-plan.dwg'))->convert();
```

Relative paths, URLs, stream wrappers, Storage-relative paths, and Windows UNC paths are not accepted.

### DWG bytes

Wrap DWG bytes in `DwgBinary` so the package can distinguish them from a path.

```php
use Mattmy\DwgConverter\DwgBinary;

$result = Dwg::toDxf(DwgBinary::from($bytes))->convert();
```

## One-time output

Conversions and thumbnail extraction return `DwgOutput`.

The result holds temporary files, so keep it in the same process. Cloning, serializing, or unserializing it
throws `LogicException`; the original result stays unchanged. For a queue job, make the source file available
to the worker and run the conversion inside the job.

```php
$extension = $result->extension();
$mimeType = $result->mimeType();
```

You can read this metadata more than once. Then choose one way to use the output:

```php
$path = $result->storeAs('drawings', 'floor-plan.dxf', 's3');
```

or:

```php
$bytes = $result->output();
```

`storeAs()` streams to Laravel Storage. `path` is a directory relative to the selected disk, such as
`drawings/2026`; use `/` as the separator, or an empty string for the disk root. Absolute paths and `.` or
`..` segments are rejected. Omit `disk` to use Laravel's default disk. The returned string is the stored
path relative to that disk, not a public URL.

Its optional name must be a filename without a directory path.
The package keeps that name and adds the output extension if needed, or normalizes its letter case if it
already matches. For WebP output, `plan.WEBP` becomes `plan.webp` and `plan.png` becomes `plan.png.webp`.
Without a name, local files and uploads use their filename without the extension. An unsafe or missing
source name, including `DwgBinary`, falls back to `converted-{16 lowercase hex}`.
`output()` reads the complete file into PHP memory.

For each `DwgOutput`, choose either `storeAs()` or `output()` and call it once. A second call throws
`LogicException` even if the first failed. Rerun the original operation to get a fresh result before retrying.
The package attempts to clean up temporary files after the call or when an unused result is destroyed.

If temporary files remain, see [cleanup warnings](./errors-and-troubleshooting#temporary-cleanup-warning).

## Layer query results

`layers()->read()` returns a regular `Collection<int, DwgLayer>` that you can filter and count repeatedly,
without one-time output restrictions. See [Reading layer data](./layers) for examples.

## Entity queries {#entity-queries}

`entities()->read()` returns `DwgEntityQueryResult`, with a reusable `DwgEntityCollection` in `entities`.
See [Reading stored entities](./entities) for examples.

## Drawing information

`version()` returns a `DwgFileVersion` immediately. `info()->read()` returns a `DwgInfo` after querying
the drawing. Both results are reusable. See [Reading drawing information](./drawing-info).
