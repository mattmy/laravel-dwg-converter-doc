# Exporting structural JSON

`toJson()` exports LibreDWG's native structural representation of a DWG as a validated JSON artifact.

> **Required command:** LibreDWG `dwgread` with JSON output support. See
> [External tools](./external-tools#libredwg).

## Export JSON

```php
use Mattmy\DwgConverter\Facades\Dwg;

$json = Dwg::toJson($request->file('drawing'))->convert();

$path = $json->storeAs('drawing-data', 'floor-plan.json', 's3');
```

The result has extension `json` and MIME type `application/json`. The package checks the file and its size,
then validates the JSON without changing it. It does not require specific fields or a particular root type.

## Schema boundary

The JSON keeps LibreDWG's original structure. You can inspect it with tools such as `jq` or process it in
your application, but field names may change between LibreDWG releases. If you want to save selected fields
in a database, define your own data structure and version it instead of relying directly on upstream field names.

It is not GeoJSON and does not have `usingDxfVersion()`: `dwgread` preserves the source DWG version and has
no `--as` option.

## Nesting depth

Validation uses PHP's native nesting limit (`depth = 512`). JSON that is nested too deeply fails with
`json_invalid`, even if its syntax is otherwise correct. The package does not offer a setting to raise this limit.
See [JSON validation failures](./errors-and-troubleshooting#json-validation-failure) to distinguish a depth
error from a syntax error.

## Size and memory

Structural JSON can be much larger than its DWG source. The default dedicated limit is 64 MiB, combined with
the general output limit by using the smaller active value. Prefer `storeAs()` because `output()` loads the
entire JSON into PHP memory.
