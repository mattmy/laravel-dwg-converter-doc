# 圖層資料查詢

用 `Dwg::layers($source)->read()` 讀取 DWG 的圖層名稱，並查看各圖層是否關閉、凍結或鎖定。

> 需要支援 `--flags` 的 LibreDWG `dwglayers`。詳見[外部工具](./external-tools#libredwg)。

## 讀取與篩選圖層

```php
use Mattmy\DwgConverter\Facades\Dwg;

$layers = Dwg::layers(storage_path('app/private/floor-plan.dwg'))->read();
$unfrozen = $layers->where('isFrozen', false);
$frozen = $layers->where('isFrozen', true);
$total = $layers->count();
$names = $layers->pluck('name');
```

結果是 Laravel 的 `Collection<int, DwgLayer>`，可直接用來篩選圖層、計數或取得名稱。要重新查詢來源時，再呼叫 `read()`。
若要讀取這些圖層上的圖元，可將整份集合或單一圖層傳給
[`entities()->onlyLayers()`](./entities#只讀取指定圖層)。

## 只讀取開啟的圖層

```php
$on = Dwg::layers($source)->onlyOn()->read();
```

`onlyOn()` 回傳新操作，選取未關閉且未凍結的圖層，其中可以包含鎖定的圖層。
選取條件只看圖層狀態，選到的圖層上仍可能有隱藏的圖元。

此選項需要工具支援 `--on`，安裝檢查見[外部工具](./external-tools#libredwg)。

## 圖層欄位

| 欄位 | 型別 | 說明 |
|---|---|---|
| `name` | `string` | 圖層名稱 |
| `isFrozen` | `bool` | 是否凍結 |
| `isOff` | `bool` | 是否關閉 |
| `isLocked` | `bool` | 是否鎖定 |

未凍結不等於開啟：`isFrozen` 為 `false` 的圖層，`isOff` 仍可能為 `true`。

結果保留工具回傳的順序、重複項目，以及名稱的大小寫與空白。集合可增減項目，每筆 `DwgLayer` 則是唯讀的。
篩選會保留原有索引，需要連續索引時可呼叫 `values()`。

## 來源與結果

支援的輸入類型請見[選擇 DWG 來源](./inputs-and-outputs#sources)。
呼叫 `read()` 時才會執行查詢。

## 錯誤與限制

空的 Collection 表示工具沒有回傳符合查詢條件的圖層資料。

如果回傳資料含無效的 UTF-8 或紀錄格式不符，查詢會中止並拋出 `DwgOperationFailed`，原因為
`layers_invalid`。詳見[圖層查詢失敗](./errors-and-troubleshooting#圖層查詢失敗)。

查詢沿用 `timeout`、`max_input_bytes` 與 `max_output_bytes`，詳見[設定參考](./configuration#runtime-設定)。
