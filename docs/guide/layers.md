# Reading layer data

Use `Dwg::layers($source)->read()` to read DWG layer names and check whether each layer is off, frozen,
or locked.

> Requires LibreDWG `dwglayers` with `--flags` support. See [External tools](./external-tools#libredwg).

## Read and filter layers

```php
use Mattmy\DwgConverter\Facades\Dwg;

$layers = Dwg::layers(storage_path('app/private/floor-plan.dwg'))->read();
$unfrozen = $layers->where('isFrozen', false);
$frozen = $layers->where('isFrozen', true);
$total = $layers->count();
$names = $layers->pluck('name');
```

The result is a Laravel `Collection<int, DwgLayer>`. Filter, count, or look up layers on that collection.
Call `read()` again to query the source again.
Pass the collection or an individual layer to [`entities()->onlyLayers()`](./entities#read-selected-layers) to read matching entities.

## Read only ON layers

```php
$on = Dwg::layers($source)->onlyOn()->read();
```

`onlyOn()` returns a new operation that selects layers that are neither off nor frozen. A locked layer can
still qualify. The selection uses layer flags, so an entity on a selected layer can still be hidden.

This option requires `--on` support; see [External tools](./external-tools#libredwg) to check your installation.

## Layer fields

| Field | Type | Meaning |
|---|---|---|
| `name` | `string` | Layer name |
| `isFrozen` | `bool` | Whether the layer is frozen |
| `isOff` | `bool` | Whether the layer is off |
| `isLocked` | `bool` | Whether the layer is locked |

Unfrozen does not mean on: a layer with `isFrozen` set to `false` can still have `isOff` set to `true`.

Results preserve tool order, duplicate entries, and the case and whitespace of names. The collection is
mutable and individual `DwgLayer` records are read-only. Filtering preserves keys. Call `values()` if you
need consecutive keys.

## Sources and results

See [Choose a DWG source](./inputs-and-outputs#sources) for supported inputs.
The query runs when you call `read()`.

## Errors and limits

An empty Collection means the tool returned no layer data for the query.

Invalid UTF-8 or malformed records stop the query with `DwgOperationFailed` and reason `layers_invalid`.
See [Errors and troubleshooting](./errors-and-troubleshooting#layer-query-failure).

Queries use `timeout`, `max_input_bytes`, and `max_output_bytes`. See [Configuration](./configuration#runtime-settings).
