# Reading stored entities

Use `Dwg::entities($source)->read()` to query stored entities. The result includes a Laravel collection of records.

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
Each `read()` runs a new query. You can filter and count the returned data repeatedly.

## Read selected layers

If you only need certain layers, select them before `read()`:

```php
$result = Dwg::entities($source)
    ->onlyLayers('Walls', 'Doors')
    ->read();

// A list works too.
$result = Dwg::entities($source)->onlyLayers(['Walls', 'Doors'])->read();
```

Names match exactly, including case and spaces. An entity is selected if its layer matches any supplied name.
Pass a layer query collection or an individual `DwgLayer` directly:

```php
$layers = Dwg::layers($source)->onlyOn()->read();
$result = Dwg::entities($source)->onlyLayers($layers)->read();

if (($layer = $layers->first()) !== null) {
    $result = Dwg::entities($source)->onlyLayers($layer)->read();
}
```

Omit `onlyLayers()` to read all reported entities. An empty list or collection selects zero records
and still runs the query.
With a layer selection, an entity needs a resolved layer name to match. A `DwgLayer` supplies its name only.

Calling `onlyLayers()` again replaces the selection on the new operation. The query decodes the full JSON,
then parses the selected entities in detail. Related attributes can still come from other layers.

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
- `drawingUnits`: the drawing's insertion unit code (INSUNITS) and its status. Lengths stay in their source units.
- `diagnostics`: source-wide information such as counts of skipped records or unknown drawing units.
  The same scope applies with `onlyLayers()` and after collection filters.

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

`complete()` selects records with no issues in the supported fields. A successful query can return zero
entities or include diagnostics such as a count of ordinary non-entity records. LibreDWG can omit records
without a diagnostic.

## What the count means

Counts cover the selected stored records across model space, layouts, and block definitions. With no layer
selection, this includes hidden entities and entities on off or frozen layers. Each block definition's
entities are counted once, regardless of how often the block is inserted. MINSERT rows and columns stay
unexpanded, and external references are not loaded. A door or window count needs rules specific to your drawing.

Coordinates keep their original WCS/OCS context; INSERT transforms are not applied. Angles are radians.
Colors describe stored values or inheritance, not the final display color. Anonymous block names are kept as supplied.

For method signatures and filter options, see [Entity API reference](./api-reference#entity-queries).
The three configured byte limits do not apply to entity queries. See
[entity query resources and precision](./performance-and-security#entity-queries).
Source, tool, or whole-query failures throw exceptions; see [Errors](./errors-and-troubleshooting#entity-queries).
