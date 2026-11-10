# 輸出結構 JSON

用 `Dwg::toJson($source)->convert()` 將 DWG 輸出為 JSON 檔案，保留 LibreDWG 原生的資料結構。

> 需要支援 JSON 輸出的 LibreDWG `dwgread`。詳見[外部工具](./external-tools#libredwg)。

## 輸出 JSON

```php
use Mattmy\DwgConverter\Facades\Dwg;

$json = Dwg::toJson($request->file('drawing'))->convert();

$path = $json->storeAs('drawing-data', 'floor-plan.json', 's3');
```

結果副檔名為 `json`，MIME 類型為 `application/json`。套件會先檢查檔案與大小，再驗證 JSON，
不改寫內容，也不要求特定欄位或根節點型別。

## 資料結構的限制 {#schema-邊界}

LibreDWG 的欄位名稱可能隨版本改變。若要把部分欄位存入資料庫，請對應到自己定義的欄位。
若只需要常用的圖面屬性，可以直接[讀取圖面資訊](./drawing-info)。

輸出沿用 LibreDWG 的資料結構與來源 DWG 版本。這個操作不支援 GeoJSON 或指定 DXF 版本。

## 巢狀深度

驗證沿用 PHP 原生的巢狀深度限制（`depth = 512`）。巢狀過深時，即使語法本身正確，也會回報
`json_invalid`；套件沒有提供提高這個限制的設定。如何區分深度與語法錯誤，請參考
[JSON 驗證失敗](./errors-and-troubleshooting#json-驗證失敗)。

## 大小與記憶體

結構 JSON 可能比原始 DWG 大得多。`convert()` 會讀取並解碼完整 JSON 來驗證內容，
所以 PHP 需要預留比 JSON 檔案更大的記憶體空間。使用 `storeAs()` 可直接串流儲存，免去再載入一次的成本。
詳見[輸出上限](./configuration#runtime-設定)。
