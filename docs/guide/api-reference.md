# API reference

This page lists application-facing APIs. Follow the linked guides for operation details and setup.

## Facade operations

```php
Dwg::thumbnail(UploadedFile|string|DwgBinary $source): ThumbnailExtraction
Dwg::toDxf(UploadedFile|string|DwgBinary $source): DxfConversion
Dwg::toJson(UploadedFile|string|DwgBinary $source): JsonConversion
Dwg::toImage(UploadedFile|string|DwgBinary $source): ImageConversion
```

Each method binds a source without I/O and returns a new operation. See [Inputs and outputs](./inputs-and-outputs).

## ThumbnailExtraction

```php
extract(): DwgOutput
```

Extracts an embedded BMP, PNG, or WMF preview. See [Extracting thumbnails](./thumbnails).

## DxfConversion

```php
toVersion(DxfVersion $version): self
convert(): DwgOutput
```

`toVersion()` returns a new operation with the selected target. `convert()` creates ASCII DXF. See
[Converting to DXF](./dxf-conversion).

`DxfVersion` cases: `R12`, `R14`, `R2000`, `R2004`, `R2007`, `R2010`, `R2013`, `R2018`.

## JsonConversion

```php
convert(): DwgOutput
```

Creates LibreDWG structural JSON. It has no target-version or format option. See
[Exporting structural JSON](./structural-json).

## ImageConversion

```php
format(ImageFormat $format): self
usingDxfVersion(DxfVersion $version): self
atResolution(ImageResolution $resolution): self
convert(): DwgOutput
```

Every option returns a new operation and preserves the other selections. See
[Creating image previews](./image-previews).

- `ImageFormat`: `PNG`, `JPEG`, `WEBP`.
- `ImageResolution`: `HIGH`, `MEDIUM`, `LOW`.

## DwgBinary

```php
DwgBinary::from(string $contents): DwgBinary
$binary->contents(): string
```

Wraps raw bytes so a string is not mistaken for a local path.

## DwgOutput

```php
extension(): string
mimeType(): string
output(): string
storeAs(string $path, ?string $name = null, ?string $disk = null): string
```

You can read `extension()` and `mimeType()` more than once. Call either `output()` or `storeAs()` once per
result; a failed call also uses up the result. Run the conversion again if you need to retry.
Cloning, serializing, or unserializing a `DwgOutput` throws `LogicException`.

`storeAs()` keeps the name you provide and adds the output extension if needed. If the extension already
matches, only its letter case is normalized. Without `name`, local files and uploads use their filename without
the extension. If that name is unsafe or unavailable, including for `DwgBinary`, the package uses
`converted-{16 lowercase hex}`. For WebP, `test1.webp` stays `test1.webp`, `test1.png` becomes
`test1.png.webp`, and `test1.WEBP` becomes `test1.webp`.

## Exceptions

`LibreDwgUnavailable`, `InvalidDwg`, and `DwgOperationFailed` all provide:

```php
reason(): string
context(): array
```

See [Errors and troubleshooting](./errors-and-troubleshooting).
