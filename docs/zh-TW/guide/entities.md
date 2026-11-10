# 圖元資料查詢

用 `Dwg::entities($source)->read()` 讀取 DWG 中儲存的圖元。取得結果後，可用 Laravel 集合依類型或圖層篩選，
並計算符合條件的筆數。

> 需要支援 JSON 輸出的 LibreDWG `dwgread`。詳見[外部工具](./external-tools#libredwg)。

## 讀取圖元

```php
use Mattmy\DwgConverter\DwgEntityType;
use Mattmy\DwgConverter\Facades\Dwg;

$result = Dwg::entities(storage_path('app/private/drawing.dwg'))->read();
$lines = $result->ofType(DwgEntityType::LINE);
$count = $lines->count();

foreach ($lines as $line) {
    $layerName = $line->layer->name;
    $start = $line->geometry?->start;
    $end = $line->geometry?->end;
}
```

支援的輸入類型請見[選擇 DWG 來源](./inputs-and-outputs#sources)。
每次 `read()` 都會重新查詢；取得結果後可重複使用，不需要呼叫 `output()` 或 `storeAs()`。

## 只讀取指定圖層

只需要部分圖層時，在 `read()` 前指定名稱：

```php
$result = Dwg::entities($source)
    ->onlyLayers('牆面', '門窗')
    ->read();

// 也可以傳入名稱清單。
$result = Dwg::entities($source)->onlyLayers(['牆面', '門窗'])->read();
```

名稱必須完全相同，包含大小寫與空白。指定多個名稱表示「任一圖層符合即可」。
`onlyLayers([])` 會選零筆；無法解析所屬圖層名稱的圖元也不會選入。不呼叫 `onlyLayers()` 才會讀取全部圖元。

每次呼叫 `onlyLayers()` 都會回傳套用這次條件的新操作。查詢仍會解碼完整 JSON，也能讀取其他圖層上的關聯屬性。
只有選入的圖元會進一步解析。

## 篩選與計數

查詢結果與 `$result->entities` 都提供以下篩選方法，可串接縮小範圍：

```php
use Mattmy\DwgConverter\DwgOwnerKind;

$inserts = $result->withOwnerKind(DwgOwnerKind::MODEL_SPACE)
    ->ofType('INSERT')
    ->referencingBlock('DOOR-A');

$count = $inserts->count();
$byLayer = $result->entities->groupBy('layer.name');
```

| 方法 | 選取內容 |
|---|---|
| `ofType($type)` | 原始類型，接受 `DwgEntityType` 或字串 |
| `onLayer($name)` | 讀取後，依完整圖層名稱篩選 |
| `withOwnerKind($kind)` | 模型空間、配置空間、圖塊定義或未知所屬 |
| `referencingBlock($name)` | INSERT／MINSERT 參照的目標圖塊名稱 |
| `withColorMode($mode)` | 儲存的顏色模式，使用 `DwgColorMode` |
| `complete()`／`incomplete()` | 沒有／有解析問題的圖元 |
| `withIssue($reason)` | 含指定 `DwgEntityIssueReason` 的圖元 |

名稱與類型區分大小寫，不會裁掉空白，也不支援萬用字元。enum 未列出的類型仍可用字串查詢。
每次篩選都回傳新集合，不會重跑工具或修改原集合；索引與順序會保留，需要連續索引時使用 `values()`。
其他操作沿用 Laravel 集合方法。

## 看懂查詢結果

- `entities`：圖元紀錄，包含類型、handle、圖層、所屬、幾何、顏色、目標圖塊、屬性與單筆問題。
- `drawingUnits`：來源的單位代碼，以及已指定、未指定或未知的狀態；不會換算長度。
- `diagnostics`：整次查詢的資訊，例如略過紀錄數或無法判定的圖面單位。篩選後不會重算；
  即使使用 `onlyLayers()`，仍描述整份來源。

套件提供 **LINE、CIRCLE、ARC、INSERT** 的幾何資料。其他可辨識類型仍會保留共同資料，
但 `geometry = null`，並記錄問題。無法讀取的值會保留為未知，其他可用資料不會一起丟掉。
`null` 也可能表示欄位不適用，不能只看它就判定錯誤，請搭配 `issues`。

```php
foreach ($result->incomplete() as $entity) {
    foreach ($entity->issues as $issue) {
        // enum 原因與受影響欄位，例如 geometry.radius。
        $reason = $issue->reason->value;
        $field = $issue->field;
    }
}
```

`complete()` 只表示支援欄位沒有解析問題，不代表所有 CAD 資料都已讀取。
`diagnostics` 可能只是正常的非圖元紀錄統計，有內容不一定是失敗。
空結果也可能成功；診斷為空則不保證上游沒有漏掉資料。

## 筆數代表什麼

筆數包含模型空間、配置空間與圖塊定義中儲存的圖元。隱藏圖元以及關閉或凍結圖層上的圖元也會計入。
同一圖塊插入十次，不會將定義內的圖元複製十份；MINSERT 不按行列展開，也不載入外部參考。
因此 `count()` 不是畫面上的實例數，也不能直接當成門窗數量。

座標保留原本的 WCS／OCS 脈絡，不套用 INSERT 變換；角度使用弧度。
顏色表示儲存值或繼承方式，不是最終顯示色。匿名圖塊名稱也會原樣保留。

方法簽章與篩選選項見[圖元 API 參考](./api-reference#entity-queries)。
圖元查詢不套用三個檔案大小上限。詳見[資源與精度限制](./performance-and-security#entity-queries)。
來源、工具或整體查詢失敗時會拋出例外，詳見[錯誤處理](./errors-and-troubleshooting#entity-queries)。
