# Configuration

Defaults work when the required commands are on `PATH`. You can set custom command paths with environment
variables. Publish the config to change resource limits or the temporary directory.

## Publish the config

```bash
php artisan vendor:publish --tag=dwg-converter-config
```

## Executables

| Config key | Environment variable | Used by |
|---|---|---|
| `executables.dwgbmp` | `LIBREDWG_DWGBMP` | `thumbnail()` |
| `executables.dwg2dxf` | `LIBREDWG_DWG2DXF` | `toDxf()`, `toImage()` |
| `executables.dwgread` | `LIBREDWG_DWGREAD` | `toJson()`, `entities()` |
| `executables.dwglayers` | `LIBREDWG_DWGLAYERS` | `layers()` |
| `executables.libreoffice` | `DWG_CONVERTER_LIBREOFFICE` | `toImage()` |
| `executables.imagemagick` | `DWG_CONVERTER_IMAGEMAGICK` | `toImage()` |

Only the commands required by the selected operation are checked.

These settings are under `dwg-converter` in Laravel, for example `config('dwg-converter.timeout')`.
Only executable paths have the environment variables listed above; edit the published config for other settings.
Publishing is optional when you only need to set those environment variables.

## Runtime settings

| Config key | Default | Effect |
|---|---:|---|
| `timeout` | `60` seconds | Timeout for each conversion or query process |
| `max_input_bytes` | 200 MiB | Maximum DWG snapshot size |
| `max_output_bytes` | 512 MiB | Maximum size of output files, intermediate artifacts, and layer data |
| `max_json_output_bytes` | 64 MiB | JSON-specific output limit |
| `temporary_directory` | Laravel framework storage | Root for package-owned workspaces |

Byte limits are measured in bytes (1 MiB = 1,048,576 bytes). `timeout` must be a finite positive number of
seconds. `temporary_directory` must be an absolute local path writable by the worker; the default is
`storage_path('framework/laravel-dwg-converter')`.

Each tool availability check has a separate 10-second timeout, so an operation can take longer than
`timeout`. Image conversion can run up to three conversion processes.

For layer queries, `max_output_bytes` counts the bytes returned by the tool. The process stops as soon as
incoming data exceeds the limit.

## Disabling byte limits

Each byte-limit key accepts `int|null`. A positive integer enables the limit; a missing key, `null`, zero, or
a negative integer disables it. Other types are invalid configuration.

Laravel merges omitted keys from the package defaults, so deleting a key from the published config may
restore its default. Set it explicitly to `null` or `0` to disable it.

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

## Entity queries {#entity-queries}

`entities()->read()` does not read, validate, or apply `max_input_bytes`, `max_output_bytes`, or
`max_json_output_bytes`, even when set to positive values. Timeout, command paths, and `temporary_directory`
still apply; other operations keep their limits. See [entity query resources](./performance-and-security#entity-queries).
