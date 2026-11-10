# 讀取圖面資訊

用 `Dwg::version($source)` 辨識 DWG 檔案的格式版本。若要查看圖面插入單位、標題、作者或最後儲存時間，
請用 `Dwg::info($source)->read()`。

支援的輸入類型請見[選擇 DWG 來源](./inputs-and-outputs#sources)。

## 辨識 DWG 格式版本

```php
use Mattmy\DwgConverter\Facades\Dwg;

$version = Dwg::version($source);
$code = $version->code;     // 例如 'AC1032'
$format = $version->format; // 例如 'R2018'，未知代碼為 null
```

`version()` 最多讀取檔頭的前六個位元組，不需要外部工具。不同軟體版本可能使用相同的 DWG 格式。
辨識出格式只表示檔頭有效，後續解碼仍可能失敗。

## 讀取圖面屬性

> 需要支援 JSON 輸出的 LibreDWG `dwgread`。詳見[外部工具](./external-tools#libredwg)。

```php
$info = Dwg::info($source)->read();
$title = $info->summary?->title;
$lastSavedAt = $info->timestamps?->lastSavedAt;
```

- `version` 是這次查詢所用的 DWG 暫存副本的格式版本。
- `drawingUnits` 提供圖面插入單位（INSUNITS）的代碼和 `status`。已知單位為 `SPECIFIED`，
  零為 `UNSPECIFIED`，缺少或無法辨識時為 `UNKNOWN`。
- `summary` 包含標題、主旨、作者、關鍵字、備註、超連結基底、最後儲存者、修訂編號及自訂屬性。
  讀不到摘要或個別文字為空時會得到 `null`，非空文字則原樣保留。
- `summary->customProperties` 是依原順序排列的 `name` 與 `value` 清單，保留重複名稱。
  明確的空清單為 `[]`，缺少清單或無法判讀時為 `null`。
- `timestamps` 提供 `createdAt` 和 `lastSavedAt`，格式為以 `Z` 結尾的 RFC 3339 UTC 字串，
  毫秒非零時會保留。個別時間無法取得時為 `null`，兩者都無法取得時，`timestamps` 為 `null`。

每次 `read()` 都會重新查詢，取得的資料可以重複使用。即使只需要一個欄位，仍會產生並解碼完整 JSON，
並套用[與 `toJson()` 相同的大小上限及逾時設定](./configuration#runtime-設定)。

某些 LibreDWG 版本處理部分表情符號等字元時，可能輸出無效的 UTF-8，此時 `read()` 會回報 `info_invalid`。
詳見[圖面資訊排錯](./errors-and-troubleshooting#drawing-information)。
