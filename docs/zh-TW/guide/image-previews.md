# 建立圖片預覽

`toImage()` 會為整個模型空間（model space）建立點陣預覽，並移除外圍白邊。支援 PNG、JPEG、WebP 與三種
預設輸出解析度。

> **必要命令：** LibreDWG `dwg2dxf`、LibreOffice 7.4+ `soffice`、ImageMagick 7 `magick`。
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

| 選項 | 副檔名 | MIME 類型 | 說明 |
|---|---|---|---|
| `ImageFormat::PNG` | `png` | `image/png` | 預設 |
| `ImageFormat::JPEG` | `jpg` | `image/jpeg` | 裁切後以白底重新編碼 |
| `ImageFormat::WEBP` | `webp` | `image/webp` | 需要 LibreOffice 7.4+ |

本套件不支援 SVG。

## 解析度選項 {#解析度-preset}

| 選項 | 輸出畫布 |
|---|---:|
| `ImageResolution::HIGH` | 4096 × 5792 |
| `ImageResolution::MEDIUM` | 2048 × 2896 |
| `ImageResolution::LOW` | 1024 × 1448 |

這些尺寸是移除外圍白邊前的畫布大小。最終尺寸取決於圖面內容；解析度選項不會調整壓縮品質。

## 輸出限制

套件會盡力產生整個模型空間的預覽，但不會將多張圖拆開輸出，也不保證圖紙空間（paper space）或
視埠（viewport）的呈現與原圖一致。不會補齊缺少的字型或外部參考（xref），也不保證與 AutoCAD 產物完全相同。
