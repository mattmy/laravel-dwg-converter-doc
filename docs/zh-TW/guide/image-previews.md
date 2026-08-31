# 建立圖片預覽

`toImage()` 會建立移除外圍白邊的全 model-space raster 預覽，支援 PNG、JPEG、WebP 與三種
預設輸出解析度。

> **必要 commands：** LibreDWG `dwg2dxf`、LibreOffice 7.4+ `soffice`、ImageMagick 7 `magick`。
> 請參考[外部工具](./external-tools)。

## 建立預設 PNG

```php
use Mattmy\DwgConverter\Facades\Dwg;

$image = Dwg::toImage(storage_path('app/private/floor-plan.dwg'))->convert();

$path = $image->storeAs('drawing-previews', 'floor-plan.png');
```

預設為 PNG、不指定中介 DXF 版本，解析度為 `ImageResolution::HIGH`。

## 選擇格式、DXF 版本與解析度

```php
use Mattmy\DwgConverter\DxfVersion;
use Mattmy\DwgConverter\ImageFormat;
use Mattmy\DwgConverter\ImageResolution;

$image = Dwg::toImage($request->file('drawing'))
    ->format(ImageFormat::WEBP)
    ->usingDxfVersion(DxfVersion::R2018)
    ->atResolution(ImageResolution::MEDIUM)
    ->convert();
```

`usingDxfVersion()` 只控制中介 DXF，不會替圖片指定版本。三個選項方法都會回傳新操作、保留其他
選項，而且直到呼叫 `convert()` 才執行轉換。

## 格式

| Case | 副檔名 | MIME type | 說明 |
|---|---|---|---|
| `ImageFormat::PNG` | `png` | `image/png` | 預設 |
| `ImageFormat::JPEG` | `jpg` | `image/jpeg` | 裁切後以白底重新編碼 |
| `ImageFormat::WEBP` | `webp` | `image/webp` | 需要 LibreOffice 7.4+ |

本套件不支援 SVG。

## 解析度 preset

| Case | 輸出 canvas |
|---|---:|
| `ImageResolution::HIGH` | 4096 × 5792 |
| `ImageResolution::MEDIUM` | 2048 × 2896 |
| `ImageResolution::LOW` | 1024 × 1448 |

這些尺寸是移除外圍白邊前的 canvas。最終尺寸取決於圖面內容；preset 不是壓縮品質設定。

## 輸出限制

結果是整個 model space 的 best-effort 預覽。不會拆分多張圖、不承諾 paper space／viewport 保真、
不補齊缺少的字型或 xrefs，也不保證與 AutoCAD 產物完全相同。
