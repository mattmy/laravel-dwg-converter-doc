# 轉換為 DXF

`toDxf()` 將一個 DWG 輸出為 ASCII DXF。你可以沿用 LibreDWG 預設 target，或選擇套件核准的
DXF 版本。

> **必要 command：** LibreDWG `dwg2dxf`。請參考[外部工具](./external-tools#libredwg)。

## 使用預設 target

```php
use Mattmy\DwgConverter\Facades\Dwg;

$dxf = Dwg::toDxf(storage_path('app/private/floor-plan.dwg'))->convert();

$path = $dxf->storeAs('drawings', 'floor-plan.dxf', 's3');
```

沒有呼叫 `toVersion()` 時不會傳入 target flag。

## 選擇 target version

```php
use Mattmy\DwgConverter\DxfVersion;

$dxf = Dwg::toDxf($request->file('drawing'))
    ->toVersion(DxfVersion::R2018)
    ->convert();
```

支援 `R12`、`R14`、`R2000`、`R2004`、`R2007`、`R2010`、`R2013`、`R2018`。
`toVersion()` 會回傳新的操作，因此不會影響後續轉換。

## 結果契約

結果副檔名為 `dxf`，MIME type 為 `application/dxf`。套件會確認產物是非空的 ASCII DXF，並具有
必要 section 與結尾標記，但無法保證所有 DWG objects 都被保留，或每個 CAD 應用顯示完全相同。
