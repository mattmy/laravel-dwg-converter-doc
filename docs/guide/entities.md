# Reading stored entities

Use `Dwg::entities($source)->read()` to read entities stored in a DWG. Use Laravel collections to filter
by type or layer and count the matching records.

> Requires LibreDWG `dwgread` with JSON output support. See [External tools](./external-tools#libredwg).

## Read entities

```php
use Mattmy\DwgConverter\DwgEntityType;
use Mattmy\DwgConverter\Facades\Dwg;

$result = Dwg::entities(storage_path('app/private/drawing.dwg'))->read();
$lines = $result->ofType(DwgEntityType::LINE);
$count = $lines->count();

foreach ($lines as $line) {
    $layerName = $line->layer->name;
    $start = $line->geometry?->start;
    $end = $line->geometry?->end;
}
```

See [Choose a DWG source](./inputs-and-outputs#sources) for supported inputs.
Each `read()` runs a new query. Once returned, the data can be reused without calling `output()` or `storeAs()`.

## Read selected layers

If you only need certain layers, select them before `read()`:

```php
$result = Dwg::entities($source)
    ->onlyLayers('Walls', 'Doors')
    ->read();

// A list works too.
$result = Dwg::entities($source)->onlyLayers(['Walls', 'Doors'])->read();
```

Names match exactly, including case and spaces. Multiple names select either layer, not their intersection.
`onlyLayers([])` selects nothing; entities whose layer name cannot be resolved also do not match.
Without `onlyLayers()`, all reported entities are read.

Each `onlyLayers()` returns a new operation with the supplied selection. The query still decodes the full JSON
and can read related attributes on other layers. It skips detailed parsing for excluded entities.

## Filter and count

The result and `$result->entities` offer the same filters. Chain them to narrow the current collection:

```php
use Mattmy\DwgConverter\DwgOwnerKind;

$inserts = $result->withOwnerKind(DwgOwnerKind::MODEL_SPACE)
    ->ofType('INSERT')
    ->referencingBlock('DOOR-A');

$count = $inserts->count();
$byLayer = $result->entities->groupBy('layer.name');
```

| Method | Selects |
|---|---|
| `ofType($type)` | Original type, using `DwgEntityType` or a string |
| `onLayer($name)` | Exact layer name, after reading |
| `withOwnerKind($kind)` | Model space, paper space, block definition, or unknown owner |
| `referencingBlock($name)` | INSERT/MINSERT target block name |
| `withColorMode($mode)` | Stored color mode, using `DwgColorMode` |
| `complete()` / `incomplete()` | Entities without / with parsing issues |
| `withIssue($reason)` | Entities with a given `DwgEntityIssueReason` |

Names and types are case-sensitive, with no trimming or wildcard matching. Types outside the convenience enum
can be queried as strings. Each filter returns a new collection without rerunning the tool or changing the original.
Keys and order are preserved; use `values()` when you need consecutive keys. Other operations use Laravel's collection methods.

## Understand the result

- `entities`: entity records with type, handle, layer, owner, geometry, color, block, attributes, and local issues.
- `drawingUnits`: the source unit code and whether it is specified, unspecified, or unknown. Lengths are not converted.
- `diagnostics`: query-wide information, such as skipped records or unknown drawing units. Filtering does not recalculate it;
  even with `onlyLayers()`, it describes the whole source.

Geometry is available for **LINE, CIRCLE, ARC, and INSERT**. Other identifiable types remain in the collection
with common data, `geometry = null`, and an issue. Values that cannot be read are left unknown; usable partial data is kept.
`null` can also mean a field does not apply, so check `issues` before treating it as an error.

```php
foreach ($result->incomplete() as $entity) {
    foreach ($entity->issues as $issue) {
        // Enum reason and the affected field, e.g. geometry.radius.
        $reason = $issue->reason->value;
        $field = $issue->field;
    }
}
```

`complete()` means the supported fields have no parsing issues, not that all CAD data was decoded.
Diagnostics may contain normal non-entity counts; a nonempty list is not automatically a failure.
An empty result can be successful, and empty diagnostics do not prove that nothing was missed upstream.

## What the count means

Counts include stored records in model space, layouts, and block definitions, including hidden entities and off/frozen layers.
A block inserted ten times does not create ten copies of its definition's entities. MINSERT rows/columns are not expanded,
and external references are not loaded. Counts are therefore not visible-instance or door/window totals.

Coordinates keep their original WCS/OCS context; INSERT transforms are not applied. Angles are radians.
Colors describe stored values or inheritance, not the final display color. Anonymous block names are kept as supplied.

For method signatures and filter options, see [Entity API reference](./api-reference#entity-queries).
The three configured byte limits do not apply to entity queries. See
[entity query resources and precision](./performance-and-security#entity-queries).
Source, tool, or whole-query failures throw exceptions; see [Errors](./errors-and-troubleshooting#entity-queries).
