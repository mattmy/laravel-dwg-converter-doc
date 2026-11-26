# Getting started

Laravel DWG Converter extracts embedded thumbnails, exports DXF, structural JSON, and image previews, and
reads drawing information, layers, and entities.

## Requirements

| Requirement | Supported |
|---|---|
| PHP | 8.2 or later |
| Laravel | 12 or 13 |
| CI tested | PHP 8.2 with Laravel 12, and PHP 8.3 to 8.5 with Laravel 12 or 13 |

Laravel 13 requires PHP 8.3 or later. CI tests both the lowest and current dependencies on PHP 8.2 with Laravel 12.

To read just the [stored DWG format](./drawing-info), you need no external commands. For other operations,
see the [requirements by operation](./external-tools#requirements-by-operation).

## Installation

```bash
composer require mattmy/laravel-dwg-converter
```

Install the [external commands](./external-tools) required by the operations you use.

## Configuration

Commands on `PATH` work with the default settings. See [Configuration](./configuration) to set custom command
paths, timeouts, byte limits, or temporary storage.

## Quick start

Pass a validated Laravel upload to extract its embedded preview and save it to the default Storage disk.

```php
use Mattmy\DwgConverter\Facades\Dwg;

$thumbnail = Dwg::thumbnail($request->file('drawing'))->extract();

$path = $thumbnail->storeAs(
    path: 'drawing-thumbnails',
    name: 'floor-plan',
);
```

The package adds the detected extension (`bmp`, `png`, or `wmf`). A DWG without an embedded preview raises
`thumbnail_not_found`. See [Extracting thumbnails](./thumbnails).

## Next steps

- Export [DXF](./dxf-conversion), [structural JSON](./structural-json), or [image previews](./image-previews).
- Read [drawing information](./drawing-info), [layers](./layers), or [entities](./entities).
