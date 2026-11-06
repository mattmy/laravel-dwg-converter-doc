# Inputs and outputs

All operations accept the same three source types. Conversions and thumbnail extraction return a one-time
`DwgOutput`; layer queries return a reusable Collection.

## Uploaded files

Pass a valid Laravel `UploadedFile` directly:

```php
use Mattmy\DwgConverter\Facades\Dwg;

$result = Dwg::toDxf($request->file('drawing'))->convert();
```

Invalid or incomplete uploads fail before an external command starts.
Validate that the field contains a file before calling the package: `$request->file('drawing')` can return
`null`, which is not an accepted source type.

## Local absolute paths

A plain string always means a local absolute path:

```php
$result = Dwg::toJson(storage_path('app/private/floor-plan.dwg'))->convert();
```

Relative paths, URLs, stream wrappers, Storage-relative paths, and Windows UNC paths are not accepted.

## DWG bytes

Wrap raw bytes so they cannot be confused with a path:

```php
use Mattmy\DwgConverter\DwgBinary;

$result = Dwg::toDxf(DwgBinary::from($bytes))->convert();
```

The package makes a temporary copy of the source when you call `convert()`, `extract()`, or `read()`. Your original
file or bytes stay unchanged.

See [thumbnails](./thumbnails#validation-boundary) and [structural JSON](./structural-json#nesting-depth)
for the format checks and their limits.

## One-time output

Each successful file operation returns `DwgOutput`.

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
already matches. Without a name, local files and uploads use their filename without the extension. An unsafe
or missing source name, including `DwgBinary`, falls back to `converted-{16 lowercase hex}`.
`output()` reads the complete file into PHP memory.

Either method can be called only once, even if it fails. Calling it again throws `LogicException`; run the
conversion again before retrying delivery. The package attempts to clean up its temporary files after the call,
or when an unused result is destroyed.

If cleanup fails, the package logs a `warning` through Laravel's default logger. Your output or original
exception stays the same, but temporary files may remain. Cleanup is not retried after the result has been
used, and a logging failure does not interrupt the operation. See [cleanup warnings](./errors-and-troubleshooting#temporary-cleanup-warning).

## Layer query results

`layers()->read()` returns a regular `Collection<int, DwgLayer>` that you can filter and count repeatedly,
without one-time output restrictions. See [Reading layer data](./layers) for examples.

## Entity queries {#entity-queries}

`entities()->read()` returns `DwgEntityQueryResult`, with a reusable `DwgEntityCollection` in `entities`.
There is no `output()` or `storeAs()` step. Cleanup is attempted before returning, with the same warning
behavior described above. See [Reading stored entities](./entities) for examples.
