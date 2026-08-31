# 輸出結構 JSON

`toJson()` 會將 LibreDWG 的 DWG native structural representation 輸出為已驗證的 JSON 產物。

> **必要 command：** 具 JSON output 能力的 LibreDWG `dwgread`。請參考
> [外部工具](./external-tools#libredwg)。

## 輸出 JSON

```php
use Mattmy\DwgConverter\Facades\Dwg;

$json = Dwg::toJson($request->file('drawing'))->convert();

$path = $json->storeAs('drawing-data', 'floor-plan.json', 's3');
```

結果副檔名為 `json`，MIME type 為 `application/json`。套件會先驗證 JSON 語法與最低 LibreDWG
structure markers。

## Schema 邊界

這份 JSON 是 opaque LibreDWG 產物，可由 `jq` 等工具檢查或交由應用後續處理，但 LibreDWG 不保證
每次 release 都維持所有欄位名稱。將選定欄位保存為長期 application data 前，請定義並 versioning
自己的 schema。

它不是 GeoJSON，也沒有 `usingDxfVersion()`：`dwgread` 會保留來源 DWG 版本，而且沒有 `--as`。

## 大小與記憶體

結構 JSON 可能遠大於來源 DWG。預設專屬上限為 64 MiB，並與一般輸出上限取兩個啟用值中較小者。
由於 `output()` 會將完整 JSON 載入 PHP 記憶體，應優先使用 `storeAs()`。
