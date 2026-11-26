# 設定參考

套件預設使用 `PATH` 上的命令。要調整逾時、大小上限或暫存位置，可先發布 `config/dwg-converter.php`。

## 發布設定檔 {#發布-config}

```bash
php artisan vendor:publish --tag=dwg-converter-config
```

## 外部工具路徑 {#executables}

| 設定名稱 | 環境變數 | 使用操作 |
|---|---|---|
| `executables.dwgbmp` | `LIBREDWG_DWGBMP` | `thumbnail()` |
| `executables.dwg2dxf` | `LIBREDWG_DWG2DXF` | `toDxf()`、`toImage()` |
| `executables.dwgread` | `LIBREDWG_DWGREAD` | `toJson()`、`entities()`、`info()` |
| `executables.dwglayers` | `LIBREDWG_DWGLAYERS` | `layers()` |
| `executables.libreoffice` | `DWG_CONVERTER_LIBREOFFICE` | `toImage()` |
| `executables.imagemagick` | `DWG_CONVERTER_IMAGEMAGICK` | `toImage()` |

只會檢查目前操作需要的命令。

在 Laravel 中，設定名稱以 `dwg-converter` 為前綴，例如 `config('dwg-converter.timeout')`。
只設定工具路徑的環境變數時，可以省略發布步驟。如果在發布的設定檔自訂 `executables`，
請保留每個會用到的工具項目。Laravel 只會補上缺少的第一層設定。

請在第一次透過 Facade 建立操作（例如呼叫 `Dwg::info($source)`）前完成設定。
同一個 Laravel 應用程式容器會沿用轉換器首次讀取的設定。
`Dwg::version()` 只讀檔頭，不會初始化轉換器。

## 執行設定 {#runtime-設定}

| 設定名稱 | 預設值 | 影響 |
|---|---:|---|
| `timeout` | `60` 秒 | 每個轉換或查詢程序的逾時上限 |
| `max_input_bytes` | 200 MiB | DWG 暫存副本的大小上限 |
| `max_output_bytes` | 512 MiB | 輸出檔、中介產物及圖層資料的大小上限 |
| `max_json_output_bytes` | 64 MiB | `toJson()->convert()` 與 `info()->read()` 的 JSON 輸出上限 |
| `temporary_directory` | Laravel 的 framework 儲存目錄 | 套件暫存工作目錄的根路徑 |

大小上限的單位是位元組（1 MiB = 1,048,576 位元組）。`timeout` 必須是有限的正數，單位為秒。
`temporary_directory` 必須是執行轉換的程序可寫入的本機絕對路徑，預設為
`storage_path('framework/laravel-dwg-converter')`。

每個工具的可用性檢查另有 10 秒上限，因此操作總耗時可能超過 `timeout`。圖片轉換最多會執行三個轉換程序。

圖層查詢的 `max_output_bytes` 以工具回傳資料的位元組數計算，接收資料時一旦超限就會停止程序。

`toJson()->convert()` 和 `info()->read()` 都採用 `max_output_bytes` 與 `max_json_output_bytes` 中較小的啟用值。
只停用其中一個時，另一個仍然適用。兩個都停用才會解除 JSON 輸出上限。

## 停用大小上限 {#停用-byte-limits}

每個大小上限設定接受 `int|null`。正整數會啟用上限；設定不存在、`null`、零或負整數則停用。
其他型別屬於無效設定。

Laravel 會用套件預設值補上省略的設定，因此刪除已發布設定檔中的某個項目，可能會恢復預設上限。
若要停用，請明確設為 `null` 或 `0`。

處理不可信檔案時應保留正整數上限。設定檔中的上限無法取代工作程序或容器的資源限制。

## Windows 圖片轉換

在應用程式的 `.env` 設定 `DWG_CONVERTER_LIBREOFFICE`，再到發布的設定檔將
`temporary_directory` 設為較短的絕對路徑。

```dotenv
DWG_CONVERTER_LIBREOFFICE="C:/Program Files/LibreOffice/program/soffice.com"
```

```php
'temporary_directory' => 'C:/dwg-tmp',
```

## 圖元查詢 {#entity-queries}

`entities()->read()` 不套用上述三個大小上限。`timeout`、工具路徑與 `temporary_directory` 仍適用。
詳見[圖元查詢的資源限制](./performance-and-security#entity-queries)。
