# 設定參考

必要命令位於 `PATH` 時可以直接使用預設值。工具路徑可透過環境變數指定；若要調整資源上限或
暫存資料夾，再發布設定檔即可。

## 發布設定檔 {#發布-config}

```bash
php artisan vendor:publish --tag=dwg-converter-config
```

## 外部工具路徑 {#executables}

| 設定名稱 | 環境變數 | 使用操作 |
|---|---|---|
| `executables.dwgbmp` | `LIBREDWG_DWGBMP` | `thumbnail()` |
| `executables.dwg2dxf` | `LIBREDWG_DWG2DXF` | `toDxf()`、`toImage()` |
| `executables.dwgread` | `LIBREDWG_DWGREAD` | `toJson()` |
| `executables.libreoffice` | `DWG_CONVERTER_LIBREOFFICE` | `toImage()` |
| `executables.imagemagick` | `DWG_CONVERTER_IMAGEMAGICK` | `toImage()` |

只會檢查目前操作需要的命令。

這些設定在 Laravel 中以 `dwg-converter` 為前綴，例如 `config('dwg-converter.timeout')`。
只有工具路徑提供上表列出的環境變數；其他設定請修改發布後的設定檔。若只需設定這些環境變數，
不必先發布設定檔。

## 執行設定 {#runtime-設定}

| 設定名稱 | 預設值 | 影響 |
|---|---:|---|
| `timeout` | `60` 秒 | 分別套用於每個轉換程序 |
| `max_input_bytes` | 200 MiB | DWG 暫存副本的大小上限 |
| `max_output_bytes` | 512 MiB | 一般輸出及中介產物上限 |
| `max_json_output_bytes` | 64 MiB | JSON 專屬輸出上限 |
| `temporary_directory` | Laravel 的 framework 儲存目錄 | 套件暫存工作目錄的根路徑 |

大小上限的單位是位元組（1 MiB = 1,048,576 位元組）。`timeout` 必須是有限的正數，單位為秒。
`temporary_directory` 必須是執行轉換的程序可寫入的本機絕對路徑，預設為
`storage_path('framework/laravel-dwg-converter')`。

圖片操作最多會執行三個轉換程序，檢查命令是否可用時也各有短暫的逾時限制。
因此，總耗時可能超過單一 `timeout` 設定值。

## 停用大小上限 {#停用-byte-limits}

每個大小上限設定接受 `int|null`。正整數會啟用上限；設定不存在、`null`、零或負整數則停用。
其他型別屬於無效設定。

Laravel 會用套件預設值補上省略的設定，因此刪除已發布設定檔中的某個項目，可能會恢復預設上限。
若要停用，請明確設為 `null` 或 `0`。

JSON 會採用 `max_output_bytes` 與 `max_json_output_bytes` 中較小的啟用值。兩者都停用時，JSON 輸出
沒有大小限制，而且語法驗證需要足夠 PHP 記憶體。

處理不可信檔案時應保留正整數上限。設定檔中的上限無法取代工作程序或容器的資源限制。

## Windows 圖片轉換

使用 LibreOffice 命令列啟動程式，並設定較短的暫存絕對路徑：

```php
'executables' => [
    'libreoffice' => 'C:/Program Files/LibreOffice/program/soffice.com',
],
'temporary_directory' => 'C:/dwg-tmp',
```
