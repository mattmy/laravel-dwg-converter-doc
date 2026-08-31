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

呼叫 `convert()` 或 `extract()` 時才會建立來源 snapshot。套件不會取得 upload、path 或原始 byte
string 的 ownership，也不會刪除它們。

## 一次性輸出

每次成功操作都回傳 `DwgOutput`。

```php
$extension = $result->extension();
$mimeType = $result->mimeType();
```

這兩個 metadata 方法不會消費結果。接著只能選擇一個 terminal method：

```php
$path = $result->storeAs('drawings', 'floor-plan.dxf', 's3');
```

或：

```php
$bytes = $result->output();
```

`storeAs()` 會串流至 Laravel Storage。目的檔名必須是 basename，而且副檔名需符合 `extension()`。
`output()` 會將完整產物載入 PHP 記憶體。無論交付成功或失敗，terminal method 都會清理暫存產物；
再次使用同一結果會拋出 `LogicException`。
