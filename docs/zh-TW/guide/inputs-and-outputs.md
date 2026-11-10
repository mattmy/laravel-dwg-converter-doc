# 輸入與輸出

本頁說明如何把 DWG 交給套件，以及如何使用結果。產出的檔案可以存入 Laravel Storage 或直接讀取位元組。
查詢則會回傳可直接使用的資料。

## 選擇 DWG 來源 {#sources}

所有操作都接受上傳檔案（`UploadedFile`）、本機絕對路徑，或用 `DwgBinary` 包裝的 DWG 位元組內容。
`convert()`、`extract()` 和 `read()` 會使用暫存副本。`Dwg::version()` 會直接讀取來源檔頭。
這些操作都會保留原始內容。

### 上傳檔案

直接傳入有效的 Laravel `UploadedFile`。

```php
use Mattmy\DwgConverter\Facades\Dwg;

$result = Dwg::toDxf($request->file('drawing'))->convert();
```

無效或未完成的上傳會在外部命令啟動前失敗。
呼叫前請先驗證欄位確實有檔案：`$request->file('drawing')` 可能回傳 `null`，而套件不接受
`null` 作為來源。

### 本機絕對路徑 {#local-absolute-paths}

直接傳入的字串一律視為本機絕對路徑。

```php
$result = Dwg::toDxf(storage_path('app/private/floor-plan.dwg'))->convert();
```

不接受相對路徑、URL、串流包裝協定（stream wrapper）、Laravel Storage 的相對路徑或 Windows UNC 路徑。

### DWG 位元組內容 {#dwg-bytes}

用 `DwgBinary` 包裝 DWG 位元組內容，讓套件能和路徑區分。

```php
use Mattmy\DwgConverter\DwgBinary;

$result = Dwg::toDxf(DwgBinary::from($bytes))->convert();
```

## 一次性輸出

轉換與縮圖擷取會回傳 `DwgOutput`。

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

`storeAs()` 會以串流方式寫入 Laravel Storage。`path` 是相對於指定磁碟的目錄，例如
`drawings/2026`；請使用 `/` 分隔，或以空字串存到磁碟根目錄。不接受絕對路徑，也不能包含 `.` 或
`..` 路徑片段。省略 `disk` 時，會使用 Laravel 預設磁碟。回傳值是相對於該磁碟的儲存路徑，並非公開網址。

可省略檔名；若要指定，請只提供檔名，不要帶入目錄路徑。
套件會保留名稱並補上輸出格式的副檔名。副檔名已相同時，只會統一大小寫。以 WebP 輸出為例，
`plan.WEBP` 會存成 `plan.webp`，`plan.png` 會存成 `plan.png.webp`。
省略檔名時，會沿用本機檔案或上傳檔案去掉副檔名後的名稱。若名稱不安全或來源沒有檔名（例如 `DwgBinary`），
則使用 `converted-` 加上 16 個小寫十六進位字元。`output()` 會將整份檔案讀入 PHP 記憶體。

每個 `DwgOutput` 只能從 `storeAs()` 和 `output()` 選一個呼叫一次。即使第一次失敗，再次呼叫也會拋出
`LogicException`。要重試，請重新執行原本的操作以取得新的結果。呼叫結束後，套件會嘗試清理暫存檔。
未使用的結果物件銷毀時，也會嘗試清理。

若發現殘留的暫存檔，請見[暫存清理警告](./errors-and-troubleshooting#暫存清理警告)。

## 圖層查詢結果

`layers()->read()` 回傳一般的 `Collection<int, DwgLayer>`，可以重複篩選與計數，不受一次性輸出限制。
使用範例見[圖層資料查詢](./layers)。

## 圖元查詢 {#entity-queries}

`entities()->read()` 回傳 `DwgEntityQueryResult`，其 `entities` 是可重複篩選的 `DwgEntityCollection`。
範例見[圖元資料查詢](./entities)。

## 圖面資訊

`version()` 立即回傳 `DwgFileVersion`，`info()->read()` 完成查詢後回傳 `DwgInfo`。
兩種結果都可重複使用。詳見[讀取圖面資訊](./drawing-info)。
