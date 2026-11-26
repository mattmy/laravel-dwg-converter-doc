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

## Working with the JSON structure {#schema-boundary}

The export preserves the source DWG version. LibreDWG can change field names between releases, so map
any fields you plan to store to your own schema. To read common metadata directly, use
[Drawing information](./drawing-info).

## Nesting depth

Validation uses PHP's native nesting limit (`depth = 512`). JSON beyond that limit fails with
`json_invalid`. See [JSON validation failures](./errors-and-troubleshooting#json-validation-failure)
to check the underlying error.

## Size and memory

Structural JSON can be much larger than its source. `convert()` reads and decodes the full JSON to validate
it, so allow more PHP memory than the file size. Use `storeAs()` to stream the result without loading it
again for delivery. See [output limits](./configuration#runtime-settings).
