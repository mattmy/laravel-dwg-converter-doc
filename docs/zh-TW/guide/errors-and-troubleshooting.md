# 錯誤與疑難排解

用 `reason()` 判斷錯誤原因，再查閱對應的排查方式。套件例外也會透過 `context()` 提供已移除敏感資訊的診斷資料，
供伺服器端排查使用。

## 處理失敗

以下範例假設上傳檔案已通過驗證。

```php
use Mattmy\DwgConverter\Exceptions\DwgOperationFailed;
use Mattmy\DwgConverter\Exceptions\InvalidDwg;
use Mattmy\DwgConverter\Exceptions\LibreDwgUnavailable;
use Mattmy\DwgConverter\Facades\Dwg;

try {
    $result = Dwg::toDxf($request->file('drawing'))->convert();
    $path = $result->storeAs('drawings');
} catch (LibreDwgUnavailable $exception) {
    report($exception);
} catch (InvalidDwg $exception) {
    return back()->withErrors(['drawing' => '無法接受這份 DWG。']);
} catch (DwgOperationFailed $exception) {
    report($exception);
}
```

診斷資料已限制長度並移除路徑，但仍只適合留在伺服器端，不要直接顯示給使用者。

這項處理只適用於 `context()`。原始例外與堆疊追蹤仍可能包含伺服器路徑，完整例外紀錄請保存在有
存取控管的伺服器日誌中。

## 例外分類

| 例外 | 常見原因 |
|---|---|
| `LibreDwgUnavailable` | `executable_not_found`、`unsupported_tool_capability`、`invalid_configuration` |
| `InvalidDwg` | 上傳、路徑或檔頭無效、輸入過大、`libredwg_rejected_input` |
| `DwgOperationFailed` | 逾時、程序執行或輸出失敗、格式無效、儲存失敗、沒有縮圖 |

`libredwg_rejected_input` 代表所選 LibreDWG 命令拒絕本次來源；不代表被接受的檔案已證明安全或
完全符合格式。

## 找不到命令 {#找不到-command}

先執行該操作的[驗證命令](./external-tools)，需要時設定絕對路徑。只需排查失敗操作實際使用的命令。

## 圖片命令成功但沒有產物 {#圖片-command-成功但沒有產物}

- Windows 請使用 `soffice.com`，不要使用 `soffice.exe`。
- 將 `temporary_directory` 設為較短的絕對路徑。
- 確認 LibreOffice 7.4+ 與 ImageMagick 7 `magick`。
- 確認執行轉換的程序可寫入暫存資料夾。

## 沒有內嵌縮圖

DWG 沒有內嵌預覽時，會拋出 `DwgOperationFailed`，原因為 `thumbnail_not_found`。需要渲染預覽時請使用 `toImage()`。

`thumbnail_invalid` 表示有找到預覽，但沒有通過 BMP／PNG／WMF 基本結構檢查。套件不會修補它，
詳見[縮圖驗證邊界](./thumbnails#驗證邊界)。

## JSON 驗證失敗

`json_invalid` 可能是產物讀取失敗、JSON 語法有誤，也可能是巢狀深度超過 PHP 原生的 `depth = 512` 限制。
請查看 `$exception->getPrevious()`：如果是錯誤碼為 `JSON_ERROR_DEPTH` 的 `JsonException`，
就代表內容過深，不一定是語法錯誤。

## 輸出過大

`toJson()->convert()` 或 `info()->read()` 回報 `output_too_large` 時，請同時檢查 JSON 與一般輸出上限。
上限是以產生的完整 JSON 計算，檔案可能比原始 DWG 大得多。詳見[執行設定](./configuration#runtime-設定)。

## 圖層查詢失敗

`layers_invalid` 表示工具回傳的資料不是有效的 UTF-8，或圖層紀錄格式不符。整次查詢會失敗，
不會回傳部分資料或自動轉碼。工具成功執行但沒有回傳資料時，才會得到空 Collection。
詳見[圖層資料查詢](./layers)。

如果工具不支援 `--on`，呼叫 `onlyOn()->read()` 會拋出 `LibreDwgUnavailable`，原因為 `unsupported_tool_capability`。
請更新工具，或移除此選項以讀取全部圖層。

## Storage 失敗

請檢查磁碟寫入權限，並確認[目錄與檔名](./inputs-and-outputs#一次性輸出)符合規則。
`storeAs()` 失敗後，請重新執行操作取得新的結果，再試一次。

## 暫存清理警告

看到 `warning` 等級的 `DWG converter temporary cleanup failed.` 時，請檢查執行轉換的程序
是否有權限刪除暫存目錄內的檔案。已完成的轉換或儲存結果仍然有效；操作本身若失敗，原始例外也會保留。

暫存檔可能殘留，套件不會重試清理。記錄警告時發生的錯誤也不會中斷操作。
記錄內容見[日誌與隱私](./performance-and-security#logging-與隱私)。

## 圖元查詢 {#entity-queries}

`entities_invalid` 表示無法讀取 JSON 產物、JSON 無效，或缺少必要的圖元資料結構。
根節點須為物件，`OBJECTS` 須為陣列（可以是 `[]`，不能以 `{}` 代替）；`HEADER` 可省略，缺少單位資訊時記入診斷。
JSON 解碼或讀取拋出的原始例外，可由 `getPrevious()` 查看；缺失或空產物則為 `output_missing`。

單筆 `issues` 與整次 `diagnostics` 是正常回傳資料的一部分，不會自動讓查詢失敗。
如何判讀請參考[看懂查詢結果](./entities#看懂查詢結果)。

## 圖面資訊 {#drawing-information}

`invalid_dwg_header` 表示檔頭不足六個位元組，或不符合 `AC10` 加兩位數字的格式。
若代碼符合格式，但沒有對應的已知版本，仍會回傳代碼，`format` 則為 `null`。
`info_invalid` 表示無法讀取或解碼 JSON 產物，或根節點型別錯誤。產物缺失或為空時回報
`output_missing`。查詢成功時，無法判讀的個別欄位為 `null`。詳見[讀取圖面資訊](./drawing-info)。
