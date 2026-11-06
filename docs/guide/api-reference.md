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

### Fields and enums

All types are in `Mattmy\DwgConverter`. Data objects are readonly; the entity collection remains mutable.

| DTO | Readonly properties |
|---|---|
| `DwgEntityQueryResult` | `entities: DwgEntityCollection<int, DwgEntity>, diagnostics: list<DwgQueryDiagnostic>, drawingUnits: DwgDrawingUnits` |
| `DwgEntity` | `type: ?string, handle: ?string, layer: DwgLayerReference, owner: DwgEntityOwner, geometry: four-type nullable union, color: DwgColor, block: ?DwgBlockReference, attributes: list<DwgAttribute> or null, isComplete: bool, issues: list<DwgEntityIssue>` |
| DwgLayerReference / DwgBlockReference | handle: ?string, name: ?string |
| DwgEntityOwner | kind: DwgOwnerKind, directHandle / containerHandle / containerName / layoutHandle / layoutName: ?string |
| DwgAttribute | handle / tag / value: ?string |
| DwgPoint | x / y: float, z: ?float |
| DwgDirection | x / y / z: float |
| DwgScale | x / y / z: ?float |
| DwgDrawingUnits | code: ?int, status: DwgDrawingUnitStatus |
| DwgColor | mode: DwgColorMode, aci / rgb: ?int |
| DwgEntityIssue | reason: DwgEntityIssueReason, field: ?string |
| DwgQueryDiagnostic | reason: DwgQueryDiagnosticReason, recordCount: ?int |

Geometry is DwgLineGeometry, DwgCircleGeometry, DwgArcGeometry, DwgInsertGeometry or null:

| Type | Properties |
|---|---|
| LINE | start / end: ?DwgPoint, coordinateSystem: DwgCoordinateSystem |
| CIRCLE | center: ?DwgPoint, radius: ?float, extrusion: ?DwgDirection, coordinateSystem |
| ARC | center, radius, startAngle / endAngle: ?float, extrusion, coordinateSystem, angleUnit: DwgAngleUnit |
| INSERT | insertionPoint: ?DwgPoint, scale: ?DwgScale, rotation: ?float, extrusion, coordinateSystem, angleUnit |

| Enum | Cases and string values |
|---|---|
| DwgOwnerKind | MODEL_SPACE=model_space, PAPER_SPACE=paper_space, BLOCK_DEFINITION=block_definition, UNKNOWN=unknown |
| DwgCoordinateSystem | WCS=wcs, OCS=ocs, UNKNOWN=unknown |
| DwgAngleUnit | RADIANS=radians |
| DwgDrawingUnitStatus | SPECIFIED=specified, UNSPECIFIED=unspecified, UNKNOWN=unknown |
| DwgColorMode | ACI=aci, TRUE_COLOR=true_color, BY_LAYER=by_layer, BY_BLOCK=by_block, UNKNOWN=unknown |
| DwgEntityType | LINE, CIRCLE, ARC, INSERT, MINSERT, HATCH, SPLINE, LWPOLYLINE; values equal their case names |

### Issues and diagnostics

`DwgEntityIssueReason` values:
`missing_value`, `invalid_value`, `duplicate_handle`, `missing_reference`, `invalid_reference`,
`target_not_found`, `ambiguous_reference`, `wrong_target_type`, `reference_cycle`,
`unsupported_geometry`, `unknown_color`, `incomplete_attributes`.

`field` identifies an affected public field, such as `geometry.radius` or `owner`.
`isComplete` is true exactly when `issues` is empty; several issues still describe one incomplete entity.

`DwgQueryDiagnosticReason` values:
`non_entity_records`, `non_object_records`, `unclassifiable_records`, `unknown_drawing_units`.

The first three count skipped records, not missing entities. `recordCount` is a known positive integer,
or `null` for a non-count diagnostic. Issues and diagnostics contain no raw tool output or private names.

::: details Partial data and unusual source records

- Handles are uppercase hexadecimal strings without `0x` or leading zeroes. Missing/invalid handles become `null`; duplicate records remain. Ambiguous targets are not chosen arbitrarily.
- Owner identifies where an entity belongs; `block` identifies an INSERT/MINSERT target. Unknown owners retain known handles. Anonymous block names are not resolved to effective names.
- Attributes preserve order, duplicate tags, whitespace, and numeric text. `[]` means a confirmed empty list; `null` means inapplicable or wholly unknown. Partial lists retain readable items.
- An explicit attribute vector requires an integer `num_owned` matching its length, even with a false `has_attribs`. An empty vector without a valid count is unknown. With count 0, it stays `[]`; conflicting first/last references add `incomplete_attributes` without following those links.
- Repeated vector references `[A,A,B]` stay `[A,A,B]` with `incomplete_attributes`. Actual linked-list cycles stop with `reference_cycle`.
- HEADER space references must point directly to a unique BLOCK_HEADER. An entity target gives UNKNOWN / `wrong_target_type` without following it. Ordinary explicit owner chains may follow entities. When HEADER resolves an owner, an invalid direct reference adds `invalid_reference` without discarding the resolved container/layout; omitted/null references are allowed, and valid direct handles are kept without resolving their targets.
- LINE uses WCS; CIRCLE/ARC/INSERT use OCS. ARC/INSERT angles are radians. Missing coordinates, Z, directions, or scale axes are not filled in. Partial geometry is retained; all-unavailable geometry is `null`. MINSERT retains block/attributes but has no supported geometry.
- Radius must be positive; extrusion needs three finite components and cannot be zero. Scale accepts finite zero/negative values. ACI is not converted to RGB; RGB is a 24-bit integer and black 0 is valid. Inherited colors are valid; missing indices are not guessed as BYBLOCK. Transparency and color-book resolution are unsupported.
:::
