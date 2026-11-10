# 開始使用

Laravel DWG Converter 可擷取 DWG 的內嵌縮圖，輸出 DXF、結構 JSON 與圖片預覽，也能讀取圖面資訊、圖層和圖元。

## 系統需求

| 需求 | 支援範圍 |
|---|---|
| PHP | 8.2 或更新版本 |
| Laravel | 12 或 13 |
| CI 實測 | PHP 8.2 搭配 Laravel 12；PHP 8.3–8.5 搭配 Laravel 12–13，包含 PHP 8.2／Laravel 12 的最低與目前相容相依版本 |

Laravel 13 需要 PHP 8.3 或更新版本。

只讀取 [DWG 格式版本](./drawing-info)時，不需要外部命令。其他操作所需的命令請見[外部工具](./external-tools)。

## 安裝

使用 Composer 安裝套件。

```bash
composer require mattmy/laravel-dwg-converter
```

接著安裝會用到的[外部工具](./external-tools)。

## 設定

命令在 `PATH` 裡就能直接使用。若要自訂命令路徑、逾時、檔案大小上限或暫存位置，請見[設定參考](./configuration)。

## 快速開始

將驗證過的 Laravel 上傳檔案交給套件，就能擷取內嵌預覽並存入預設的 Storage 磁碟。

```php
use Mattmy\DwgConverter\Facades\Dwg;

$thumbnail = Dwg::thumbnail($request->file('drawing'))->extract();

$path = $thumbnail->storeAs(
    path: 'drawing-thumbnails',
    name: 'floor-plan',
);
```

套件會加上偵測到的副檔名（`bmp`、`png` 或 `wmf`）。DWG 若沒有內嵌預覽，會回報 `thumbnail_not_found`。
詳見[擷取縮圖](./thumbnails)。

## 下一步

- 輸出 [DXF](./dxf-conversion)、[結構 JSON](./structural-json)或[圖片預覽](./image-previews)。
- 讀取[圖面資訊](./drawing-info)、[圖層](./layers)或[圖元](./entities)。
