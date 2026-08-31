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

The result reports extension `json` and MIME type `application/json`. Before returning it, the package checks
the JSON syntax and the minimum LibreDWG structural markers.

## Schema boundary

The JSON is an opaque LibreDWG artifact. It can be inspected with tools such as `jq` or processed by your
application, but LibreDWG does not promise that every field name remains stable between releases. Define and
version your own application schema before storing selected fields as durable application data.

It is not GeoJSON and does not have `usingDxfVersion()`: `dwgread` preserves the source DWG version and has
no `--as` option.

## Size and memory

Structural JSON can be much larger than its DWG source. The default dedicated limit is 64 MiB, combined with
the general output limit by using the smaller active value. Prefer `storeAs()` because `output()` loads the
entire JSON into PHP memory.
