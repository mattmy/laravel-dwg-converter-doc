# 擷取縮圖

`thumbnail()` 會擷取 DWG 已內嵌的預覽，不會渲染圖面。

> **必要 command：** LibreDWG `dwgbmp`。請參考[外部工具](./external-tools#libredwg)。

## 擷取內嵌預覽

```php
use Mattmy\DwgConverter\Facades\Dwg;

$thumbnail = Dwg::thumbnail($request->file('drawing'))->extract();

$extension = $thumbnail->extension(); // bmp、png 或 wmf
$mimeType = $thumbnail->mimeType();
```

副檔名與 MIME type 依輸出 bytes 判定，不信任 LibreDWG 產生的檔名。

## 儲存縮圖

檔名可省略；可信的偵測副檔名會自動套用：

```php
$path = $thumbnail->storeAs(
    path: 'drawing-thumbnails',
    disk: 's3',
);
```

`storeAs()` 會消費結果。對同一物件再次呼叫 `output()` 或 `storeAs()` 會拋出 `LogicException`。

## 沒有縮圖

有效 DWG 也可能沒有預覽。此時會拋出 reason 為 `thumbnail_not_found` 的 `DwgOperationFailed`，
不會回傳 `null`，也不會自動改用 `toImage()`。

需要渲染整個 model space 時，請使用[圖片預覽](./image-previews)。
