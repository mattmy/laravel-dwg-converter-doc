# Extracting thumbnails

Use `Dwg::thumbnail($source)->extract()` to retrieve the preview already embedded in a DWG.

> Requires LibreDWG `dwgbmp`. See [External tools](./external-tools#libredwg).

## Extract an embedded preview

```php
use Mattmy\DwgConverter\Facades\Dwg;

$thumbnail = Dwg::thumbnail($request->file('drawing'))->extract();

$extension = $thumbnail->extension(); // bmp, png, or wmf
$mimeType = $thumbnail->mimeType();
```

The extension and MIME type come from the output bytes, not the filename supplied by LibreDWG.

## Validation boundary

The package checks the basic structure of BMP, PNG, and WMF previews. A preview that fails these checks
throws `DwgOperationFailed` with reason `thumbnail_invalid`.

The package returns the original preview bytes after these basic checks. Some image viewers may still be
unable to open the file.

## Store the thumbnail

You can omit the name. `storeAs()` adds the detected extension automatically.

```php
$path = $thumbnail->storeAs(
    path: 'drawing-thumbnails',
    disk: 's3',
);
```

See [One-time output](./inputs-and-outputs#one-time-output) for filename rules and how to retry a failed save.

## No thumbnail

A valid DWG may not contain a preview. In that case the operation throws `DwgOperationFailed` with reason
`thumbnail_not_found`. It does not return `null` and does not fall back to `toImage()`.

Use [image previews](./image-previews) when you need a rendered whole-model-space image.
