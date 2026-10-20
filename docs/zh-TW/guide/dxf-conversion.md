# 轉換為 DXF

`toDxf()` 將一個 DWG 輸出為 ASCII DXF。你可以沿用 LibreDWG 預設的目標版本，或選擇套件支援的
DXF 版本。

> **必要命令：** LibreDWG `dwg2dxf`。請參考[外部工具](./external-tools#libredwg)。

## 使用預設目標版本 {#使用預設-target}

```php
use Mattmy\DwgConverter\Facades\Dwg;

$dxf = Dwg::toDxf(storage_path('app/private/floor-plan.dwg'))->convert();

$path = $dxf->storeAs('drawings', 'floor-plan.dxf', 's3');
```

沒有呼叫 `toVersion()` 時，會使用 LibreDWG 的預設目標版本。

## 選擇目標版本 {#選擇-target-version}

```php
use Mattmy\DwgConverter\DxfVersion;

$dxf = Dwg::toDxf($request->file('drawing'))
    ->toVersion(DxfVersion::R2018)
    ->convert();
```

支援 `R12`、`R14`、`R2000`、`R2004`、`R2007`、`R2010`、`R2013`、`R2018`。
`toVersion()` 會回傳新的操作，因此不會影響後續轉換。

## 結果契約

結果副檔名為 `dxf`，MIME 類型為 `image/vnd.dxf`。套件會確認產物是非空的 ASCII DXF，並具有
必要區段與結尾標記，但無法保證所有 DWG 物件都被保留，或每個 CAD 應用顯示完全相同。
