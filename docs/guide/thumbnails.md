# Extracting thumbnails

`thumbnail()` extracts a preview already embedded in a DWG. It does not render the drawing.

> **Required command:** LibreDWG `dwgbmp`. See [External tools](./external-tools#libredwg).

## Extract an embedded preview

```php
use Mattmy\DwgConverter\Facades\Dwg;

$thumbnail = Dwg::thumbnail($request->file('drawing'))->extract();

$extension = $thumbnail->extension(); // bmp, png, or wmf
$mimeType = $thumbnail->mimeType();
```

The extension and MIME type come from the output bytes, not the filename supplied by LibreDWG.

## Store the thumbnail

The name is optional. The trusted detected extension is applied automatically:

```php
$path = $thumbnail->storeAs(
    path: 'drawing-thumbnails',
    disk: 's3',
);
```

`storeAs()` consumes the result. Calling `output()` or `storeAs()` again on the same object throws
`LogicException`.

## No thumbnail

A valid DWG may not contain a preview. In that case the operation throws `DwgOperationFailed` with reason
`thumbnail_not_found`. It does not return `null` and does not fall back to `toImage()`.

Use [image previews](./image-previews) when you need a rendered whole-model-space image.
