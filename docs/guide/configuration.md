# Configuration

Use this page to configure external tool paths, process timeouts, byte limits, and temporary storage.
The default command paths work when the required tools are on `PATH`.

## Publish the config

```bash
php artisan vendor:publish --tag=dwg-converter-config
```

## Executables

| Config key | Environment variable | Used by |
|---|---|---|
| `executables.dwgbmp` | `LIBREDWG_DWGBMP` | `thumbnail()` |
| `executables.dwg2dxf` | `LIBREDWG_DWG2DXF` | `toDxf()`, `toImage()` |
| `executables.dwgread` | `LIBREDWG_DWGREAD` | `toJson()`, `entities()`, `info()` |
| `executables.dwglayers` | `LIBREDWG_DWGLAYERS` | `layers()` |
| `executables.libreoffice` | `DWG_CONVERTER_LIBREOFFICE` | `toImage()` |
| `executables.imagemagick` | `DWG_CONVERTER_IMAGEMAGICK` | `toImage()` |

Only the commands required by the selected operation are checked.

These settings are under `dwg-converter` in Laravel, for example `config('dwg-converter.timeout')`.
Only executable paths have the environment variables listed above; edit the published config for other settings.
Publishing is optional when you only need to set those environment variables.

Set these values before the first facade call that creates an operation, such as `Dwg::info($source)`.
The converter reuses those settings for the lifetime of the Laravel application container.
`Dwg::version()` reads only the header and does not initialize the converter.

## Runtime settings

| Config key | Default | Effect |
|---|---:|---|
| `timeout` | `60` seconds | Timeout for each conversion or query process |
| `max_input_bytes` | 200 MiB | Maximum DWG snapshot size |
| `max_output_bytes` | 512 MiB | Maximum size of output files, intermediate artifacts, and layer data |
| `max_json_output_bytes` | 64 MiB | JSON output limit for `toJson()->convert()` and `info()->read()` |
| `temporary_directory` | Laravel framework storage | Root for package-owned workspaces |

Byte limits are measured in bytes (1 MiB = 1,048,576 bytes). `timeout` must be a finite positive number of
seconds. `temporary_directory` must be an absolute local path writable by the worker; the default is
`storage_path('framework/laravel-dwg-converter')`.

Each tool availability check has a separate 10-second timeout, so an operation can take longer than
`timeout`. Image conversion can run up to three conversion processes.

For layer queries, `max_output_bytes` counts the bytes returned by the tool. The process stops as soon as
incoming data exceeds the limit.

`toJson()->convert()` and `info()->read()` both use the smaller enabled value of `max_output_bytes` and
`max_json_output_bytes`. If you disable one, the other still applies. Disable both to remove the JSON output cap.

## Disabling byte limits

Each byte-limit key accepts `int|null`. A positive integer enables the limit; a missing key, `null`, zero, or
a negative integer disables it. Other types are invalid configuration.

Laravel merges omitted keys from the package defaults, so deleting a key from the published config may
restore its default. Set it explicitly to `null` or `0` to disable it.

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

`entities()->read()` skips all three byte limits. Timeout, command paths, and `temporary_directory` still
apply. See [entity query resources](./performance-and-security#entity-queries).
