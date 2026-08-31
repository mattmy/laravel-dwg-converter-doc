# 開始使用

Laravel DWG Converter 讓 Laravel 應用擷取 DWG 內嵌縮圖，或將檔案輸出為 DXF、結構 JSON、PNG、
JPEG 或 WebP。你只需安裝實際會呼叫之操作所需的外部 commands。

## 系統需求

| 需求 | 支援範圍 |
|---|---|
| PHP | 8.3 或更新版本 |
| Laravel | 12 或 13 |
| CI 實測 | PHP 8.3–8.5 搭配 Laravel 12–13，包含 PHP 8.3／Laravel 12 lowest boundary |

每個操作有不同的外部需求：

| 操作 | 必要 commands |
|---|---|
| 內嵌縮圖 | `dwgbmp` |
| DXF | `dwg2dxf` |
| 結構 JSON | 具 JSON output 能力的 `dwgread` |
| PNG、JPEG 或 WebP 預覽 | `dwg2dxf`、LibreOffice 7.4+ `soffice`、ImageMagick 7 `magick` |

安裝前請閱讀[外部工具](./external-tools)。縮圖、DXF 與 JSON 操作不需要 LibreOffice 或
ImageMagick。

## 安裝

透過 Composer 安裝套件：

```bash
composer require mattmy/laravel-dwg-converter
```

接著安裝所選操作需要的 commands。LibreDWG 安裝方式請參考
[LibreDWG 官方 repository](https://github.com/libredwg/libredwg)。本套件不會下載或附帶任何外部工具。

## 設定

commands 位於 `PATH` 時可以直接使用預設設定。否則請發布 config 並填入絕對路徑：

```bash
php artisan vendor:publish --tag=dwg-converter-config
```

```dotenv
LIBREDWG_DWGBMP=/opt/libredwg/bin/dwgbmp
LIBREDWG_DWG2DXF=/opt/libredwg/bin/dwg2dxf
LIBREDWG_DWGREAD=/opt/libredwg/bin/dwgread
DWG_CONVERTER_LIBREOFFICE=/usr/bin/soffice
DWG_CONVERTER_IMAGEMAGICK=/usr/local/bin/magick
```

已位於 `PATH` 的 commands 不必設定變數。Timeout、byte limits 與暫存空間請參考[設定參考](./configuration)。

## 快速開始

下方範例接收有效的 Laravel upload、擷取內嵌預覽，再串流至預設 Storage disk：

```php
use Mattmy\DwgConverter\Facades\Dwg;

$thumbnail = Dwg::thumbnail($request->file('drawing'))->extract();

$path = $thumbnail->storeAs(
    path: 'drawing-thumbnails',
    name: 'floor-plan.'.$thumbnail->extension(),
);
```

副檔名依預覽 bytes 判定，可能是 `bmp`、`png` 或 `wmf`。有效 DWG 也可能沒有內嵌預覽；若這是
預期情況，請處理 `DwgOperationFailed`。

## 下一步

- [安裝與驗證外部工具](./external-tools)
- [將 DWG 轉換為 DXF](./dxf-conversion)
- [建立圖片預覽](./image-previews)
- [選擇輸入並交付輸出](./inputs-and-outputs)
- [處理錯誤](./errors-and-troubleshooting)
