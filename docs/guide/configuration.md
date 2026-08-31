# Configuration

Defaults work when the required commands are on `PATH`. Publish the config only when you need custom command
paths, resource limits, or a different temporary directory.

## Publish the config

```bash
php artisan vendor:publish --tag=dwg-converter-config
```

## Executables

| Config key | Environment variable | Used by |
|---|---|---|
| `executables.dwgbmp` | `LIBREDWG_DWGBMP` | `thumbnail()` |
| `executables.dwg2dxf` | `LIBREDWG_DWG2DXF` | `toDxf()`, `toImage()` |
| `executables.dwgread` | `LIBREDWG_DWGREAD` | `toJson()` |
| `executables.libreoffice` | `DWG_CONVERTER_LIBREOFFICE` | `toImage()` |
| `executables.imagemagick` | `DWG_CONVERTER_IMAGEMAGICK` | `toImage()` |

Only the commands required by the selected operation are checked.

## Runtime settings

| Config key | Default | Effect |
|---|---:|---|
| `timeout` | `60` seconds | Applies separately to each conversion process |
| `max_input_bytes` | 200 MiB | Maximum DWG snapshot size |
| `max_output_bytes` | 512 MiB | General output and intermediate-artifact limit |
| `max_json_output_bytes` | 64 MiB | JSON-specific output limit |
| `temporary_directory` | Laravel framework storage | Root for package-owned workspaces |

An image operation can run three conversion processes, and every command availability probe has its own
short timeout. Its total wall time can therefore exceed one configured `timeout` value.

## Disabling byte limits

Each byte-limit key accepts `int|null`. A positive integer enables the limit; a missing key, `null`, zero, or
a negative integer disables it. Other types are invalid configuration.

JSON uses the smaller active value from `max_output_bytes` and `max_json_output_bytes`. Disabling both allows
unbounded JSON output and requires enough PHP memory for syntax validation.

Keep positive limits for untrusted files. Config limits do not replace worker or container resource controls.

## Windows image conversion

Use LibreOffice's console launcher and a short absolute temporary path:

```php
'executables' => [
    'libreoffice' => 'C:/Program Files/LibreOffice/program/soffice.com',
],
'temporary_directory' => 'C:/dwg-tmp',
```
