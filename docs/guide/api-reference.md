# API reference

## Facade operations

Import `Mattmy\DwgConverter\Facades\Dwg` to call these methods.

```php
Dwg::thumbnail(UploadedFile|string|DwgBinary $source): ThumbnailExtraction
Dwg::toDxf(UploadedFile|string|DwgBinary $source): DxfConversion
Dwg::toJson(UploadedFile|string|DwgBinary $source): JsonConversion
Dwg::toImage(UploadedFile|string|DwgBinary $source): ImageConversion
Dwg::layers(UploadedFile|string|DwgBinary $source): LayerReading
Dwg::entities(UploadedFile|string|DwgBinary $source): EntityReading
Dwg::version(UploadedFile|string|DwgBinary $source): DwgFileVersion
Dwg::info(UploadedFile|string|DwgBinary $source): InfoReading
```

`version()` reads the header immediately. The other methods bind a source without I/O and return a
new operation. See [Inputs and outputs](./inputs-and-outputs).

## Drawing information

```php
InfoReading::read(): DwgInfo
```

`DwgFileVersion` exposes `code: string` and `format: ?string`. `DwgInfo` contains `version`,
`drawingUnits`, `summary` and `timestamps`. See [Reading drawing information](./drawing-info).

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
onlyOn(): self
read(): Collection<int, DwgLayer>
```

`onlyOn()` returns a new operation for layers that are neither off nor frozen. Locked layers can qualify.
`DwgLayer` exposes read-only fields: `name: string`, `isFrozen: bool`, `isOff: bool`, and `isLocked: bool`.
See [Reading layer data](./layers) for filtering and state meanings.

## Entity queries {#entity-queries}

Start with [Reading stored entities](./entities).

```php
// EntityReading
onlyLayers(string|DwgLayer|array|Collection $layers, string|DwgLayer ...$additionalLayers): self
read(): DwgEntityQueryResult
```

`onlyLayers()` accepts layer names, `DwgLayer` objects, or a list or Laravel collection containing either.
Arrays must be flat lists; collection keys are ignored. Invalid items throw `InvalidArgumentException`.
Layer objects are matched by name, and later changes to the supplied collection do not affect the selection.

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

Call and chain these filters on the query result or entity collection. The signatures above are for the
query result. On `DwgEntityCollection`, the methods return `static` and preserve keys, order, and entity objects.

Option types are in `Mattmy\DwgConverter`:

- `ofType()`: use an enum such as `DwgEntityType::LINE`, or an original type string such as `'LINE'`.
- `withOwnerKind()`: `DwgOwnerKind::MODEL_SPACE`, `PAPER_SPACE`, `BLOCK_DEFINITION`, or `UNKNOWN`.
- `withColorMode()`: `DwgColorMode::ACI`, `TRUE_COLOR`, `BY_LAYER`, `BY_BLOCK`, or `UNKNOWN`.
- `withIssue()`: pass a `DwgEntityIssueReason`, such as `DwgEntityIssueReason::TARGET_NOT_FOUND`.

### Query result

`DwgEntityQueryResult` provides `entities`, `drawingUnits`, and `diagnostics`.
An entity's `issues` describe its parsing problems; `diagnostics` describe the whole query and do not necessarily indicate failure.
See [Understand the result](./entities#understand-the-result) for field access and interpreting issues.

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

You can read `extension()` and `mimeType()` more than once. For each `DwgOutput`, choose either `storeAs()`
or `output()` and call it once. If it fails, rerun the original operation to get a fresh result before retrying.
Cloning, serializing, or unserializing a `DwgOutput` throws `LogicException`.

See [One-time output](./inputs-and-outputs#one-time-output) for storage paths and filename rules.

## Exceptions

`LibreDwgUnavailable`, `InvalidDwg`, and `DwgOperationFailed` all provide:

```php
reason(): string
context(): array
```

See [Errors and troubleshooting](./errors-and-troubleshooting).

For changes between releases, see the [Changelog](https://github.com/mattmy/laravel-dwg-converter/blob/main/CHANGELOG.md).
