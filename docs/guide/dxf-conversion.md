# Converting to DXF

`toDxf()` exports one DWG as an ASCII DXF artifact. You can keep LibreDWG's default target or request one
of the package's approved DXF versions.

> **Required command:** LibreDWG `dwg2dxf`. See [External tools](./external-tools#libredwg).

## Use the default target

```php
use Mattmy\DwgConverter\Facades\Dwg;

$dxf = Dwg::toDxf(storage_path('app/private/floor-plan.dwg'))->convert();

$path = $dxf->storeAs('drawings', 'floor-plan.dxf', 's3');
```

No target flag is passed when you do not call `toVersion()`.

## Choose a target version

```php
use Mattmy\DwgConverter\DxfVersion;

$dxf = Dwg::toDxf($request->file('drawing'))
    ->toVersion(DxfVersion::R2018)
    ->convert();
```

Supported cases are `R12`, `R14`, `R2000`, `R2004`, `R2007`, `R2010`, `R2013`, and `R2018`.
`toVersion()` returns a new configured operation, so it does not affect later conversions.

## Result contract

The result reports extension `dxf` and MIME type `application/dxf`. The package checks for a non-empty ASCII
DXF with the required section and end markers, but that check does not guarantee every DWG object was
preserved or that every CAD application will display the file identically.
