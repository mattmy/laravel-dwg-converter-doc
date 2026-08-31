# Getting started

Laravel DWG Converter lets a Laravel application extract a DWG's embedded thumbnail or export the file as
DXF, structural JSON, PNG, JPEG, or WebP. Install only the external commands required by the operation you
intend to call.

## Requirements

| Requirement | Supported |
|---|---|
| PHP | 8.3 or later |
| Laravel | 12 or 13 |
| CI tested | PHP 8.3–8.5 with Laravel 12–13, including the PHP 8.3 / Laravel 12 lowest boundary |

Each operation has separate external requirements:

| Operation | Required commands |
|---|---|
| Embedded thumbnail | `dwgbmp` |
| DXF | `dwg2dxf` |
| Structural JSON | `dwgread` with JSON output support |
| PNG, JPEG, or WebP preview | `dwg2dxf`, LibreOffice 7.4+ `soffice`, ImageMagick 7 `magick` |

See [External tools](./external-tools) before installing them. LibreOffice and ImageMagick are not required
for thumbnail, DXF, or JSON operations.

## Installation

Install the package with Composer:

```bash
composer require mattmy/laravel-dwg-converter
```

Install the commands needed by your selected operation. For LibreDWG, follow the
[official LibreDWG repository](https://github.com/libredwg/libredwg). This package does not download or
bundle any external tool.

## Configuration

Commands on `PATH` use the default configuration. If a command lives elsewhere, publish the config and set
its absolute path:

```bash
php artisan vendor:publish --tag=dwg-converter-config
```

```dotenv
LIBREDWG_DWGBMP=/opt/libredwg/bin/dwgbmp
LIBREDWG_DWG2DXF=/opt/libredwg/bin/dwg2dxf
LIBREDWG_DWGREAD=/opt/libredwg/bin/dwgread
DWG_CONVERTER_LIBREOFFICE=/usr/bin/soffice
DWG_CONVERTER_IMAGEMAGICK=/usr/local/bin/magick
```

Only set variables for commands that are not already available on `PATH`. See [Configuration](./configuration)
for timeouts, byte limits, and temporary storage.

## Quick start

This example receives a valid Laravel upload, extracts its embedded preview, and streams the result to the
default Storage disk:

```php
use Mattmy\DwgConverter\Facades\Dwg;

$thumbnail = Dwg::thumbnail($request->file('drawing'))->extract();

$path = $thumbnail->storeAs(
    path: 'drawing-thumbnails',
    name: 'floor-plan.'.$thumbnail->extension(),
);
```

The extension is discovered from the preview bytes and may be `bmp`, `png`, or `wmf`. A valid DWG can have
no embedded preview; handle `DwgOperationFailed` when that result is expected.

## Next steps

- [Install and verify external tools](./external-tools)
- [Convert a DWG to DXF](./dxf-conversion)
- [Create an image preview](./image-previews)
- [Choose inputs and deliver outputs](./inputs-and-outputs)
- [Handle errors](./errors-and-troubleshooting)
