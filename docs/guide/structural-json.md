# Exporting structural JSON

Use `Dwg::toJson($source)->convert()` to export a DWG as a JSON file using LibreDWG's native structure.

> Requires LibreDWG `dwgread` with JSON output support. See [External tools](./external-tools#libredwg).

## Export JSON

```php
use Mattmy\DwgConverter\Facades\Dwg;

$json = Dwg::toJson($request->file('drawing'))->convert();

$path = $json->storeAs('drawing-data', 'floor-plan.json', 's3');
```

The result has extension `json` and MIME type `application/json`. The package checks the file and its size,
then validates the JSON without changing it. It does not require specific fields or a particular root type.

## Schema boundary

LibreDWG can change field names between releases. If you store selected fields in a database, map them to
your own schema. To read common drawing fields directly, use [Drawing information](./drawing-info).

The export uses LibreDWG's schema and preserves the source DWG version. GeoJSON and DXF version options
are unavailable for this operation.

## Nesting depth

Validation uses PHP's native nesting limit (`depth = 512`). JSON that is nested too deeply fails with
`json_invalid`, even if its syntax is otherwise correct. The package does not offer a setting to raise this limit.
See [JSON validation failures](./errors-and-troubleshooting#json-validation-failure) to distinguish a depth
error from a syntax error.

## Size and memory

Structural JSON can be much larger than its source. `convert()` reads and decodes the full JSON to validate
it, so allow more PHP memory than the file size. Use `storeAs()` to stream the result without loading it
again for delivery. See [output limits](./configuration#runtime-settings).
