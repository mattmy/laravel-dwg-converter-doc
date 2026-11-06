# API reference

This page lists application-facing APIs. Follow the linked guides for operation details and setup.

## Facade operations

```php
Dwg::thumbnail(UploadedFile|string|DwgBinary $source): ThumbnailExtraction
Dwg::toDxf(UploadedFile|string|DwgBinary $source): DxfConversion
Dwg::toJson(UploadedFile|string|DwgBinary $source): JsonConversion
Dwg::toImage(UploadedFile|string|DwgBinary $source): ImageConversion
Dwg::layers(UploadedFile|string|DwgBinary $source): LayerReading
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

## LayerReading

```php
read(): Collection<int, DwgLayer>
```

Returns a reusable `Collection<int, DwgLayer>` without an `output()` or `storeAs()` step.
`DwgLayer` exposes read-only fields: `name: string`, `isFrozen: bool`, `isOff: bool`, and `isLocked: bool`.
See [Reading layer data](./layers) for filtering and state meanings.

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

For changes between releases, see the [Changelog](https://github.com/mattmy/laravel-dwg-converter/blob/main/CHANGELOG.md).

## Entity queries {#entity-queries}

Start with [Reading stored entities](./entities).

```php
Dwg::entities(UploadedFile|string|DwgBinary $source): EntityReading

// EntityReading
onlyLayers(string|array $layers, string ...$additionalLayers): self
read(): DwgEntityQueryResult
```

`onlyLayers()` accepts a string or a list of strings, optionally followed by more strings.
Invalid lists (non-string items, nested lists, or non-list keys) throw `InvalidArgumentException` before reading.
The first argument is required; missing arguments or incorrect native types cause PHP argument/type errors.

### Filters

```php
complete(): DwgEntityCollection
incomplete(): DwgEntityCollection
withColorMode(DwgColorMode $mode): DwgEntityCollection
ofType(DwgEntityType|string $type): DwgEntityCollection
onLayer(string $name): DwgEntityCollection
withOwnerKind(DwgOwnerKind $kind): DwgEntityCollection
referencingBlock(string $name): DwgEntityCollection
withIssue(DwgEntityIssueReason $reason): DwgEntityCollection
```

Both `DwgEntityQueryResult` and `DwgEntityCollection` expose these methods. Collection methods return `static`;
result methods return `DwgEntityCollection<int, DwgEntity>`. Filters preserve keys, order, and entity objects.
They use the current collection without caching; previously returned collections do not follow later changes.
`withIssue()` returns each matching entity once.

Option types are in `Mattmy\DwgConverter`:

- `ofType()`: use an enum such as `DwgEntityType::LINE`, or an original type string such as `'LINE'`.
- `withOwnerKind()`: `DwgOwnerKind::MODEL_SPACE`, `PAPER_SPACE`, `BLOCK_DEFINITION`, or `UNKNOWN`.
- `withColorMode()`: `DwgColorMode::ACI`, `TRUE_COLOR`, `BY_LAYER`, `BY_BLOCK`, or `UNKNOWN`.
- `withIssue()`: pass a `DwgEntityIssueReason`, such as `DwgEntityIssueReason::TARGET_NOT_FOUND`.

### Query result

`DwgEntityQueryResult` provides `entities`, `drawingUnits`, and `diagnostics`.
An entity's `issues` describe its parsing problems; `diagnostics` describe the whole query and do not necessarily indicate failure.
See [Understand the result](./entities#understand-the-result) for field access and interpreting issues.
