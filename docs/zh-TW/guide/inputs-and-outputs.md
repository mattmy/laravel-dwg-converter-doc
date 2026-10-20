# 輸入與輸出

四個操作接受相同的三種來源型別，並回傳相同的一次性輸出物件。

## 上傳檔案

直接傳入有效的 Laravel `UploadedFile`：

```php
use Mattmy\DwgConverter\Facades\Dwg;

$result = Dwg::toDxf($request->file('drawing'))->convert();
```

無效或未完成的 upload 會在外部 command 啟動前失敗。

## Local absolute paths

普通 string 一律代表 local absolute path：

```php
$result = Dwg::toJson(storage_path('app/private/floor-plan.dwg'))->convert();
```

不接受 relative path、URL、stream wrapper、Storage-relative path 或 Windows UNC path。

## DWG bytes

包裝 raw bytes，避免與 path 混淆：

```php
use Mattmy\DwgConverter\DwgBinary;

$result = Dwg::toDxf(DwgBinary::from($bytes))->convert();
```

呼叫 `convert()` 或 `extract()` 時，套件才會建立來源的暫存副本。你提供的原始檔案或位元組內容都不會改變。

各格式的檢查與限制，請參考[縮圖](./thumbnails#驗證邊界)與[結構 JSON](./structural-json#巢狀深度)。

## 一次性輸出

每次成功操作都回傳 `DwgOutput`。

結果物件管理著暫存檔，請在同一個程序中使用。複製、序列化或反序列化都會拋出 `LogicException`，
原本的結果不受影響。如果要透過佇列處理，請讓佇列工作能存取來源檔案，再在工作內執行轉換。

```php
$extension = $result->extension();
$mimeType = $result->mimeType();
```

這兩項資訊可以重複讀取。接著選擇一種方式取得結果：

```php
$path = $result->storeAs('drawings', 'floor-plan.dxf', 's3');
```

或：

```php
$bytes = $result->output();
```

`storeAs()` 會以串流方式寫入 Laravel Storage。可省略檔名；若要指定，請只提供檔名，不要帶入目錄路徑。
套件會保留這個名稱，再視需要加上輸出格式的副檔名；副檔名已相同時，只會統一大小寫。
省略名稱時，本機檔案與上傳檔案會沿用去掉副檔名後的名稱。如果名稱不安全或沒有名稱
（例如 `DwgBinary`），就使用 `converted-{16 lowercase hex}`。`output()` 則會將整份檔案讀入 PHP 記憶體。

這兩種方法都只能使用一次，即使失敗也不能重試。再次使用會拋出 `LogicException`，需要重新執行轉換
才能再次交付。呼叫完成後，套件會嘗試清理暫存檔；沒有使用就結束生命週期的結果，也會嘗試清理。

清理失敗時，套件會透過 Laravel 預設 logger 記錄 `warning`。已取得的結果或原始例外不受影響，
但暫存檔可能殘留。結果使用後不會重試清理，記錄警告時發生的錯誤也不會中斷操作。
排查方式見[暫存清理警告](./errors-and-troubleshooting#暫存清理警告)。
