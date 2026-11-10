# API 參考

本頁列出公開方法的參數、回傳型別與選項。使用範例與工具需求請見各操作指南。

## Facade 操作 {#facade-operations}

```php
Dwg::thumbnail(UploadedFile|string|DwgBinary $source): ThumbnailExtraction
Dwg::toDxf(UploadedFile|string|DwgBinary $source): DxfConversion
Dwg::toJson(UploadedFile|string|DwgBinary $source): JsonConversion
Dwg::toImage(UploadedFile|string|DwgBinary $source): ImageConversion
Dwg::layers(UploadedFile|string|DwgBinary $source): LayerReading
Dwg::entities(UploadedFile|string|DwgBinary $source): EntityReading
Dwg::version(UploadedFile|string|DwgBinary $source): DwgFileVersion
Dwg::info(UploadedFile|string|DwgBinary $source): InfoReading
```

`version()` 立即讀取檔頭。其他方法只綁定來源並回傳新的操作物件，綁定時沒有 I/O。
請參考[輸入與輸出](./inputs-and-outputs)。

## 圖面資訊 {#drawing-information}

```php
InfoReading::read(): DwgInfo
```

`DwgFileVersion` 提供 `code: string` 和 `format: ?string`。`DwgInfo` 包含 `version`、
`drawingUnits`、`summary` 和 `timestamps`。請參考[讀取圖面資訊](./drawing-info)。

## ThumbnailExtraction

```php
extract(): DwgOutput
```

擷取內嵌 BMP、PNG 或 WMF 預覽。請參考[擷取縮圖](./thumbnails)。

## DxfConversion

```php
toVersion(DxfVersion $version): self
convert(): DwgOutput
```

`toVersion()` 回傳已指定目標版本的新操作；`convert()` 建立 ASCII DXF。請參考
[轉換為 DXF](./dxf-conversion)。

`DxfVersion` 可選值：`R12`、`R14`、`R2000`、`R2004`、`R2007`、`R2010`、`R2013`、`R2018`。

## JsonConversion

```php
convert(): DwgOutput
```

建立 LibreDWG 結構 JSON，沒有目標版本或格式選項。請參考[輸出結構 JSON](./structural-json)。

## ImageConversion

```php
format(ImageFormat $format): self
usingDxfVersion(DxfVersion $version): self
atResolution(ImageResolution $resolution): self
convert(): DwgOutput
```

每個選項都回傳新操作並保留其他選擇。請參考[建立圖片預覽](./image-previews)。

- `ImageFormat`：`PNG`、`JPEG`、`WEBP`。
- `ImageResolution`：`HIGH`、`MEDIUM`、`LOW`。

## LayerReading

```php
onlyOn(): self
read(): Collection<int, DwgLayer>
```

`onlyOn()` 回傳新的讀取操作，只選取未關閉且未凍結的圖層；鎖定圖層仍可包含。
`read()` 回傳 `Collection<int, DwgLayer>`，可重複使用，不需要呼叫 `output()` 或 `storeAs()`。
`DwgLayer` 提供唯讀欄位：`name: string`、`isFrozen: bool`、`isOff: bool`、`isLocked: bool`。
篩選方式與狀態說明見[圖層資料查詢](./layers)。

## DwgBinary

```php
DwgBinary::from(string $contents): DwgBinary
$binary->contents(): string
```

包裝原始位元組內容，避免直接傳入字串時被當成本機路徑。

## DwgOutput

```php
extension(): string
mimeType(): string
output(): string
storeAs(string $path, ?string $name = null, ?string $disk = null): string
```

`extension()` 與 `mimeType()` 可以重複讀取。每個 `DwgOutput` 只能從 `storeAs()` 和 `output()` 選一個呼叫一次。
若呼叫失敗，請重新執行原本的操作以取得新的結果。複製、序列化或反序列化 `DwgOutput` 都會拋出 `LogicException`。

儲存路徑與檔名規則請見[一次性輸出](./inputs-and-outputs#一次性輸出)。

## 例外 {#exceptions}

`LibreDwgUnavailable`、`InvalidDwg`、`DwgOperationFailed` 都提供：

```php
reason(): string
context(): array
```

請參考[錯誤與疑難排解](./errors-and-troubleshooting)。

版本之間的變更請參考 [Changelog](https://github.com/mattmy/laravel-dwg-converter/blob/main/CHANGELOG.md)。

## 圖元查詢 {#entity-queries}

使用方式見[圖元資料查詢](./entities)。

```php
// EntityReading
onlyLayers(string|array $layers, string ...$additionalLayers): self
read(): DwgEntityQueryResult
```

`onlyLayers()` 接受一個或多個圖層名稱，也可傳入字串清單。陣列必須是一維、連續索引的字串清單，否則拋出 `InvalidArgumentException`。

### 篩選方法

```php
complete(): DwgEntityCollection
incomplete(): DwgEntityCollection
withColorMode(DwgColorMode $mode): DwgEntityCollection
ofType(DwgEntityType|string $type): DwgEntityCollection
onLayer(string $name): DwgEntityCollection
withOwnerKind(DwgOwnerKind $kind): DwgEntityCollection
referencingBlock(string $name): DwgEntityCollection
withIssue(DwgEntityIssueReason $reason): DwgEntityCollection
```

這些方法可從查詢結果或圖元集合呼叫，並繼續串接。每次篩選都保留索引、順序與圖元物件，
不修改來源集合；先前取得的結果也不會隨來源更新。集合方法回傳 `static`。

選項型別皆位於 `Mattmy\DwgConverter`：

- `ofType()`：可用 `DwgEntityType::LINE` 等 enum，或直接傳入 `'LINE'` 等原始類型字串。
- `withOwnerKind()`：`DwgOwnerKind::MODEL_SPACE`、`PAPER_SPACE`、`BLOCK_DEFINITION`、`UNKNOWN`。
- `withColorMode()`：`DwgColorMode::ACI`、`TRUE_COLOR`、`BY_LAYER`、`BY_BLOCK`、`UNKNOWN`。
- `withIssue()`：傳入 `DwgEntityIssueReason`，例如 `DwgEntityIssueReason::TARGET_NOT_FOUND`。

### 查詢結果

`DwgEntityQueryResult` 提供 `entities`、`drawingUnits` 與 `diagnostics`。
各筆圖元的 `issues` 描述單筆解析問題；`diagnostics` 描述整次查詢的資訊，有內容不一定表示失敗。
常用欄位的取值方式與問題判讀，請參考[看懂查詢結果](./entities#看懂查詢結果)。
