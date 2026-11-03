# Reading layer data

`Dwg::layers($source)->read()` reads DWG layer names and states. It does not edit layers or export separate layer files.

> **Required command:** LibreDWG `dwglayers` with `--flags` support. See [External tools](./external-tools#libredwg).

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

Use a Laravel `UploadedFile`, a local absolute path, or `DwgBinary` as the source. See [Inputs and outputs](./inputs-and-outputs).
Calling `layers()` does not read the file. Each `read()` call reads the source and runs a new query.

The returned Collection is reusable, unlike a one-time `DwgOutput`. There is no need to call `output()` or
`storeAs()`. Cleanup is attempted before returning. Cleanup failures log a `warning` and leave the data
usable, but temporary files may remain.

## Errors and limits

If the tool succeeds without returning data, the result is an empty Collection. This only means the tool
reported an empty list; it does not guarantee that the original drawing has no layers.

Invalid UTF-8 or malformed records throw `DwgOperationFailed` with reason `layers_invalid`. The entire query
fails, without partial results or automatic encoding conversion. See [Errors and troubleshooting](./errors-and-troubleshooting)
for other failures.

Queries use `timeout`, `max_input_bytes`, and `max_output_bytes`. See [Configuration](./configuration#runtime-settings).
