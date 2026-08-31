# 設定參考

必要 commands 位於 `PATH` 時可以直接使用預設值。只有需要自訂 command path、資源上限或暫存資料夾
時才需發布 config。

## 發布 config

```bash
php artisan vendor:publish --tag=dwg-converter-config
```

## Executables

| Config key | Environment variable | 使用操作 |
|---|---|---|
| `executables.dwgbmp` | `LIBREDWG_DWGBMP` | `thumbnail()` |
| `executables.dwg2dxf` | `LIBREDWG_DWG2DXF` | `toDxf()`、`toImage()` |
| `executables.dwgread` | `LIBREDWG_DWGREAD` | `toJson()` |
| `executables.libreoffice` | `DWG_CONVERTER_LIBREOFFICE` | `toImage()` |
| `executables.imagemagick` | `DWG_CONVERTER_IMAGEMAGICK` | `toImage()` |

只會檢查目前操作需要的 commands。

## Runtime 設定

| Config key | 預設值 | 影響 |
|---|---:|---|
| `timeout` | `60` 秒 | 分別套用於每個 conversion process |
| `max_input_bytes` | 200 MiB | DWG snapshot 最大尺寸 |
| `max_output_bytes` | 512 MiB | 一般輸出及中介產物上限 |
| `max_json_output_bytes` | 64 MiB | JSON 專屬輸出上限 |
| `temporary_directory` | Laravel framework storage | package-owned 工作目錄根路徑 |

圖片操作最多會執行三個 conversion processes，每個 command availability probe 也有自己的短 timeout。
所以總 wall time 可能超過一個設定的 `timeout` 值。

## 停用 byte limits

每個 byte-limit key 接受 `int|null`。正整數會啟用上限；key 不存在、`null`、零或負整數則停用。
其他型別屬於無效設定。

JSON 會採用 `max_output_bytes` 與 `max_json_output_bytes` 中較小的啟用值。兩者都停用時，JSON 輸出
沒有大小限制，而且語法驗證需要足夠 PHP 記憶體。

處理不可信檔案時應保留正整數上限。Config limits 無法取代 worker 或 container 資源限制。

## Windows 圖片轉換

使用 LibreOffice console launcher 與較短的 absolute temporary path：

```php
'executables' => [
    'libreoffice' => 'C:/Program Files/LibreOffice/program/soffice.com',
],
'temporary_directory' => 'C:/dwg-tmp',
```
