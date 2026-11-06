# 圖層資料查詢

`Dwg::layers($source)->read()` 讀取 DWG 的圖層名稱與狀態，不會修改圖層或產生分層檔案。

> **必要命令：** LibreDWG `dwglayers`，需支援 `--flags`。請參考[外部工具](./external-tools#libredwg)。

## 讀取與篩選圖層

```php
use Mattmy\DwgConverter\Facades\Dwg;

$layers = Dwg::layers(storage_path('app/private/floor-plan.dwg'))->read();
$unfrozen = $layers->where('isFrozen', false);
$frozen = $layers->where('isFrozen', true);
$total = $layers->count();
$names = $layers->pluck('name');
```

結果是 Laravel 的 `Collection<int, DwgLayer>`。篩選、計數與查詢名稱都使用已讀取的資料，不會重新執行工具。
`count()` 計算的是圖層數量，不是圖元數量。

## 只讀取開啟的圖層

```php
$on = Dwg::layers($source)->onlyOn()->read();
```

`onlyOn()` 讓工具只回傳未關閉且未凍結的圖層，鎖定圖層仍可包含；這不保證圖元實際可見。
它會回傳新的操作物件，不影響原操作，呼叫 `read()` 才讀取來源。

此選項需要工具支援 `--on`，安裝檢查見[外部工具](./external-tools#libredwg)。

## 圖層欄位

每筆 `Mattmy\DwgConverter\DwgLayer` 提供下列欄位：

| 欄位 | 型別 | 說明 |
|---|---|---|
| `name` | `string` | 圖層名稱 |
| `isFrozen` | `bool` | 是否凍結 |
| `isOff` | `bool` | 是否關閉 |
| `isLocked` | `bool` | 是否鎖定 |

未凍結不等於開啟：`isFrozen` 為 `false` 的圖層，`isOff` 仍可能為 `true`。

結果保留工具回傳的順序、重複項目，以及名稱的大小寫與空白。Collection 可以篩選或增減項目，
但每筆圖層資料不能修改。篩選會保留原本的索引，需要連續索引時請呼叫 `values()`。

## 來源與結果

支援 `UploadedFile`、本機絕對路徑與 `DwgBinary`，詳見[輸入與輸出](./inputs-and-outputs)。
`layers()` 只指定來源，呼叫 `read()` 才會讀取；每次 `read()` 都會重新查詢。

取得的 Collection 可以重複使用，不是一次性的 `DwgOutput`，也不需要呼叫 `output()` 或 `storeAs()`。
回傳前會嘗試清理暫存檔；清理失敗時會記錄 `warning`，資料仍可使用，但可能留下暫存檔。

## 錯誤與限制

工具成功執行但未回傳資料時，結果是空 Collection。這只表示工具回報空清單，不保證原圖沒有圖層。

若回傳資料不是有效的 UTF-8，或紀錄格式不符，會拋出 `DwgOperationFailed`，`reason()` 為
`layers_invalid`。整次查詢會失敗，不會回傳部分資料或自動轉碼。其他錯誤見[錯誤與疑難排解](./errors-and-troubleshooting)。

查詢沿用 `timeout`、`max_input_bytes` 與 `max_output_bytes`，詳見[設定參考](./configuration#runtime-設定)。
