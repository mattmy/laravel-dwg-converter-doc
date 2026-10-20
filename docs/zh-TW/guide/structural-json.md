# 輸出結構 JSON

`toJson()` 會將 DWG 匯出為 JSON 檔案，保留 LibreDWG 原生的資料結構。

> **必要命令：** 支援 JSON 輸出的 LibreDWG `dwgread`。請參考
> [外部工具](./external-tools#libredwg)。

## 輸出 JSON

```php
use Mattmy\DwgConverter\Facades\Dwg;

$json = Dwg::toJson($request->file('drawing'))->convert();

$path = $json->storeAs('drawing-data', 'floor-plan.json', 's3');
```

結果副檔名為 `json`，MIME 類型為 `application/json`。套件會先檢查檔案與大小，再驗證 JSON，
不改寫內容，也不要求特定欄位或根節點型別。

## 資料結構的限制 {#schema-邊界}

這份 JSON 保留 LibreDWG 輸出的原始結構，你可以用 `jq` 等工具檢查，或交給應用程式繼續處理。
LibreDWG 不保證不同版本的欄位名稱都相同。若要把其中的欄位長期存進資料庫，請先定義自己的
資料結構與版本，不要直接依賴上游欄位名稱。

它不是 GeoJSON，也沒有 `usingDxfVersion()`：`dwgread` 會保留來源 DWG 版本，而且沒有 `--as`。

## 巢狀深度

驗證沿用 PHP 原生的巢狀深度限制（`depth = 512`）。巢狀過深時，即使語法本身正確，也會回報
`json_invalid`；套件沒有提供提高這個限制的設定。如何區分深度與語法錯誤，請參考
[JSON 驗證失敗](./errors-and-troubleshooting#json-驗證失敗)。

## 大小與記憶體

結構 JSON 可能遠大於來源 DWG。預設專屬上限為 64 MiB，並與一般輸出上限取兩個啟用值中較小者。
由於 `output()` 會將完整 JSON 載入 PHP 記憶體，應優先使用 `storeAs()`。

`storeAs()` 只能避免交付時再次載入整份檔案；`convert()` 驗證時仍會讀取並解碼完整 JSON。
即使使用 `storeAs()`，PHP 記憶體也需要預留比檔案大小更多的空間。
