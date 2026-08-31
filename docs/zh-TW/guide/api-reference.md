# API 參考

本頁只列出 application-facing API。操作細節與安裝方式請閱讀對應指南。

## Facade operations

```php
Dwg::thumbnail(UploadedFile|string|DwgBinary $source): ThumbnailExtraction
Dwg::toDxf(UploadedFile|string|DwgBinary $source): DxfConversion
Dwg::toJson(UploadedFile|string|DwgBinary $source): JsonConversion
Dwg::toImage(UploadedFile|string|DwgBinary $source): ImageConversion
```

每個方法只綁定來源、不執行 I/O，並回傳新操作。請參考[輸入與輸出](./inputs-and-outputs)。

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

`toVersion()` 回傳具有指定 target 的新操作；`convert()` 建立 ASCII DXF。請參考
[轉換為 DXF](./dxf-conversion)。

`DxfVersion` cases：`R12`、`R14`、`R2000`、`R2004`、`R2007`、`R2010`、`R2013`、`R2018`。

## JsonConversion

```php
convert(): DwgOutput
```

建立 LibreDWG 結構 JSON，沒有 target-version 或 format 選項。請參考[輸出結構 JSON](./structural-json)。

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

## DwgBinary

```php
DwgBinary::from(string $contents): DwgBinary
$binary->contents(): string
```

包裝 raw bytes，避免 string 被誤認為 local path。

## DwgOutput

```php
extension(): string
mimeType(): string
output(): string
storeAs(string $path, string $name, ?string $disk = null): string
```

`extension()` 與 `mimeType()` 不會消費結果。`output()` 與 `storeAs()` 只能選擇一個呼叫一次。

## Exceptions

`LibreDwgUnavailable`、`InvalidDwg`、`DwgOperationFailed` 都提供：

```php
reason(): string
context(): array
```

請參考[錯誤與疑難排解](./errors-and-troubleshooting)。
