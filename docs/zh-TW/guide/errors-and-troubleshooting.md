# 錯誤與疑難排解

套件提供三種例外。你可以用 `reason()` 判斷錯誤原因，並用 `context()` 查看已移除敏感資訊的診斷資料。

## 處理失敗

```php
use Mattmy\DwgConverter\Exceptions\DwgOperationFailed;
use Mattmy\DwgConverter\Exceptions\InvalidDwg;
use Mattmy\DwgConverter\Exceptions\LibreDwgUnavailable;
use Mattmy\DwgConverter\Facades\Dwg;

try {
    $result = Dwg::toDxf($request->file('drawing'))->convert();
} catch (LibreDwgUnavailable $exception) {
    report($exception);
} catch (InvalidDwg $exception) {
    return back()->withErrors(['drawing' => '無法接受這份 DWG。']);
} catch (DwgOperationFailed $exception) {
    report($exception);
}
```

診斷資料已限制長度並移除路徑，但仍只適合留在伺服器端，不要直接顯示給使用者。

## 例外分類

| Exception | 常見 reasons |
|---|---|
| `LibreDwgUnavailable` | `executable_not_found`、`unsupported_tool_capability`、`invalid_configuration` |
| `InvalidDwg` | 無效 upload／path／header、輸入過大、`libredwg_rejected_input` |
| `DwgOperationFailed` | timeout、process／output／格式／Storage 失敗、沒有縮圖 |

`libredwg_rejected_input` 代表所選 LibreDWG command 拒絕本次來源；不代表被接受的檔案已證明安全或
完全符合格式。

## 找不到 command

先執行該操作的[驗證 command](./external-tools)，需要時設定絕對路徑。只需排查失敗操作實際使用的
commands。

## 圖片 command 成功但沒有產物

- Windows 請使用 `soffice.com`，不要使用 `soffice.exe`。
- 使用較短的 absolute `temporary_directory`。
- 確認 LibreOffice 7.4+ 與 ImageMagick 7 `magick`。
- 確認 worker 可寫入暫存資料夾。

## 沒有內嵌縮圖

`thumbnail_not_found` 是有效 DWG 沒有預覽時的正常結果。需要渲染預覽時請使用 `toImage()`。

`thumbnail_invalid` 表示有找到預覽，但沒有通過 BMP／PNG／WMF 基本結構檢查。套件不會修補它，
詳見[縮圖驗證邊界](./thumbnails#驗證邊界)。

## JSON 驗證失敗

`json_invalid` 可能是 JSON 語法有誤，也可能是巢狀深度超過 PHP 原生的 `depth = 512` 限制。
請查看 `$exception->getPrevious()`：如果是錯誤碼為 `JSON_ERROR_DEPTH` 的 `JsonException`，
就代表內容過深，不一定是語法錯誤。

## Storage 失敗

指定檔名時，請只填檔名，不要包含目錄路徑。套件會依實際輸出格式加上副檔名，或統一副檔名的大小寫。
即使 `storeAs()` 失敗，這個結果也不能再次使用；請重新執行轉換後再儲存。

## 暫存清理警告

看到 `warning` 等級的 `DWG converter temporary cleanup failed.` 時，請檢查執行轉換的程序
是否有權限刪除暫存目錄內的檔案。已完成的轉換或儲存結果仍然有效；操作本身若失敗，原始例外也會保留。

暫存檔可能殘留，套件不會重試清理。記錄警告時發生的錯誤也不會中斷操作。
記錄內容見[日誌與隱私](./performance-and-security#logging-與隱私)。
