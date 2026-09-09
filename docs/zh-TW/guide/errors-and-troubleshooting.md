# 錯誤與疑難排解

套件公開三種例外。每種例外都提供穩定的 `reason()` 與去敏後的 scalar `context()`，供應用處理與診斷。

## 處理失敗

```php
use Mattmy\DwgConverter\Exceptions\DwgOperationFailed;
use Mattmy\DwgConverter\Exceptions\InvalidDwg;
use Mattmy\DwgConverter\Exceptions\LibreDwgUnavailable;
use Mattmy\DwgConverter\Facades\Dwg;

try {
    $result = Dwg::toDxf($request->file('drawing'))->convert();
} catch (LibreDwgUnavailable $exception) {
    report([$exception->reason(), $exception->context()]);
} catch (InvalidDwg $exception) {
    return back()->withErrors(['drawing' => '無法接受這份 DWG。']);
} catch (DwgOperationFailed $exception) {
    report([$exception->reason(), $exception->context()]);
}
```

不要向使用者顯示 raw diagnostic context。雖然內容已有長度限制並移除 paths，但用途仍是 server 診斷。

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

## Storage 失敗

明確提供的檔名必須是安全 basename。套件會附加或正規化可信的輸出副檔名。失敗的 `storeAs()` 仍會
消費結果並清理暫存產物；再次交付前需重新執行轉換。
