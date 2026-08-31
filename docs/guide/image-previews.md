# Creating image previews

`toImage()` creates a trimmed, whole-model-space raster preview. It supports PNG, JPEG, and WebP, plus
three preset export resolutions.

> **Required commands:** LibreDWG `dwg2dxf`, LibreOffice 7.4+ `soffice`, and ImageMagick 7 `magick`.
> See [External tools](./external-tools).

## Create the default PNG

```php
use Mattmy\DwgConverter\Facades\Dwg;

$image = Dwg::toImage(storage_path('app/private/floor-plan.dwg'))->convert();

$path = $image->storeAs('drawing-previews', 'floor-plan.png');
```

The defaults are PNG, no explicit intermediate DXF version, and `ImageResolution::HIGH`.

## Choose format, DXF version, and resolution

```php
use Mattmy\DwgConverter\DxfVersion;
use Mattmy\DwgConverter\ImageFormat;
use Mattmy\DwgConverter\ImageResolution;

$image = Dwg::toImage($request->file('drawing'))
    ->format(ImageFormat::WEBP)
    ->usingDxfVersion(DxfVersion::R2018)
    ->atResolution(ImageResolution::MEDIUM)
    ->convert();
```

`usingDxfVersion()` controls only the intermediate DXF. It does not assign a version to the image. All three
option methods return a new operation, preserve the other choices, and perform no conversion until
`convert()` is called.

## Formats

| Case | Extension | MIME type | Note |
|---|---|---|---|
| `ImageFormat::PNG` | `png` | `image/png` | Default |
| `ImageFormat::JPEG` | `jpg` | `image/jpeg` | Flattened onto white and re-encoded after trimming |
| `ImageFormat::WEBP` | `webp` | `image/webp` | Requires LibreOffice 7.4+ |

SVG is intentionally unsupported.

## Resolution presets

| Case | Export canvas |
|---|---:|
| `ImageResolution::HIGH` | 4096 × 5792 |
| `ImageResolution::MEDIUM` | 2048 × 2896 |
| `ImageResolution::LOW` | 1024 × 1448 |

These dimensions describe the canvas before white-margin trimming. Final dimensions depend on drawing
content; the presets are not compression-quality settings.

## Output limits

The result is a best-effort preview of the entire model space. It does not split multiple drawings, promise
paper-space or viewport fidelity, supply missing fonts or xrefs, or guarantee an AutoCAD-identical image.
