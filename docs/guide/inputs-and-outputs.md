# Inputs and outputs

All four operations accept the same three source types and return the same one-time output object.

## Uploaded files

Pass a valid Laravel `UploadedFile` directly:

```php
use Mattmy\DwgConverter\Facades\Dwg;

$result = Dwg::toDxf($request->file('drawing'))->convert();
```

Invalid or incomplete uploads fail before an external command starts.

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

The package snapshots the source when `convert()` or `extract()` is called. It never takes ownership of or
deletes the upload, path, or original byte string.

## One-time output

Every successful operation returns `DwgOutput`.

```php
$extension = $result->extension();
$mimeType = $result->mimeType();
```

These metadata methods do not consume the result. Choose exactly one terminal method:

```php
$path = $result->storeAs('drawings', 'floor-plan.dxf', 's3');
```

or:

```php
$bytes = $result->output();
```

`storeAs()` streams to Laravel Storage. The destination name must be a basename whose extension matches
`extension()`. `output()` loads the complete artifact into PHP memory. Either terminal method cleans up the
temporary artifact even if delivery fails; using it again throws `LogicException`.
