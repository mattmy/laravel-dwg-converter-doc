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

The result is a Laravel `Collection<int, DwgLayer>`. Filtering, counting, and name lookup use the data already
read and never rerun the tool. `count()` counts layers, not entities.

## Read only ON layers

```php
$on = Dwg::layers($source)->onlyOn()->read();
```

`onlyOn()` asks the tool to return layers that are neither off nor frozen. Locked layers can still be included;
this does not guarantee entity visibility. It returns a new operation without changing the original and reads
the source only when you call `read()`.

This option requires `--on` support; see [External tools](./external-tools#libredwg) to check your installation.

## Layer fields

Each `Mattmy\DwgConverter\DwgLayer` exposes these fields:

| Field | Type | Meaning |
|---|---|---|
| `name` | `string` | Layer name |
| `isFrozen` | `bool` | Whether the layer is frozen |
| `isOff` | `bool` | Whether the layer is off |
| `isLocked` | `bool` | Whether the layer is locked |

Unfrozen does not mean on: a layer with `isFrozen` set to `false` can still have `isOff` set to `true`.

Results preserve tool order, duplicate entries, and name case and whitespace. You can filter, add, or remove
Collection items, but cannot change individual layer records. Filtering preserves keys; call `values()` if
you need consecutive keys.

## Sources and results

See [Choose a DWG source](./inputs-and-outputs#sources) for supported inputs.
Calling `layers()` does not read the file. Each `read()` call reads the source and runs a new query.

The returned Collection is ready to reuse. See [temporary cleanup warnings](./errors-and-troubleshooting#temporary-cleanup-warning)
if temporary files remain.

## Errors and limits

An empty Collection means the tool returned no layer data for the query.

Invalid UTF-8 or malformed records throw `DwgOperationFailed` with reason `layers_invalid`. The entire query
fails, without partial results or automatic encoding conversion. See [Errors and troubleshooting](./errors-and-troubleshooting)
for other failures.

Queries use `timeout`, `max_input_bytes`, and `max_output_bytes`. See [Configuration](./configuration#runtime-settings).
