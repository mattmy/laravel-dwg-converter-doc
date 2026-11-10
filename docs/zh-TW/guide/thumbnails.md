# 擷取縮圖

用 `Dwg::thumbnail($source)->extract()` 擷取 DWG 檔案內嵌的預覽。

> 需要 LibreDWG `dwgbmp`。詳見[外部工具](./external-tools#libredwg)。

## 擷取內嵌預覽

```php
use Mattmy\DwgConverter\Facades\Dwg;

$thumbnail = Dwg::thumbnail($request->file('drawing'))->extract();

$extension = $thumbnail->extension(); // bmp、png 或 wmf
$mimeType = $thumbnail->mimeType();
```

副檔名與 MIME 類型依輸出內容判定，不採用 LibreDWG 產生的檔名。

## 檢查縮圖格式 {#驗證邊界}

套件會檢查 BMP、PNG、WMF 預覽的基本結構。沒有通過檢查時，會拋出 `DwgOperationFailed`，
原因為 `thumbnail_invalid`。

通過基本檢查後，套件會原樣回傳縮圖。部分圖片檢視器仍可能無法開啟結果。

## 儲存縮圖

檔名可以省略。`storeAs()` 會補上偵測到的副檔名。

```php
$path = $thumbnail->storeAs(
    path: 'drawing-thumbnails',
    disk: 's3',
);
```

命名方式與儲存失敗後的重試方式，請見[一次性輸出](./inputs-and-outputs#一次性輸出)。

## 沒有縮圖

有效 DWG 也可能沒有預覽。此時會拋出 `DwgOperationFailed`，`reason()` 為 `thumbnail_not_found`，
不會回傳 `null`，也不會自動改用 `toImage()`。

需要渲染整個模型空間時，請使用[圖片預覽](./image-previews)。
