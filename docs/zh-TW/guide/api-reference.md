# API 參考

本頁列出應用程式可直接使用的 API。操作細節與安裝方式請閱讀對應指南。

## Facade 操作 {#facade-operations}

```php
Dwg::thumbnail(UploadedFile|string|DwgBinary $source): ThumbnailExtraction
Dwg::toDxf(UploadedFile|string|DwgBinary $source): DxfConversion
Dwg::toJson(UploadedFile|string|DwgBinary $source): JsonConversion
Dwg::toImage(UploadedFile|string|DwgBinary $source): ImageConversion
Dwg::layers(UploadedFile|string|DwgBinary $source): LayerReading
```

每個方法只指定來源，不會讀寫檔案或執行轉換，並回傳新的操作物件。請參考[輸入與輸出](./inputs-and-outputs)。

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
read(): Collection<int, DwgLayer>
```

回傳 `Collection<int, DwgLayer>`，可重複使用，不需要呼叫 `output()` 或 `storeAs()`。
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

`extension()` 與 `mimeType()` 可以重複讀取。每個結果只能選擇 `output()` 或 `storeAs()` 呼叫一次，
即使失敗也不能重試；需要重試時，請重新執行轉換。複製、序列化或反序列化 `DwgOutput` 都會拋出
`LogicException`。

`storeAs()` 會保留你提供的檔名，再視需要加上輸出格式的副檔名；副檔名已相同時，只會統一大小寫。
省略 `name` 時，本機檔案與上傳檔案會沿用去掉副檔名後的名稱。如果名稱不安全或沒有名稱
（例如 `DwgBinary`），就使用 `converted-` 加上 16 個小寫十六進位字元。WebP 的
`test1.webp` 維持 `test1.webp`、`test1.png` 變成 `test1.png.webp`，`test1.WEBP` 變成
`test1.webp`。

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
Dwg::entities(UploadedFile|string|DwgBinary $source): EntityReading

// EntityReading
onlyLayers(string|array $layers, string ...$additionalLayers): self
read(): DwgEntityQueryResult
```

`onlyLayers()` 接受字串或一維字串清單，後面可接其他字串。
含非字串、巢狀陣列或非連續整數索引的清單，會在讀取前拋出 `InvalidArgumentException`。
首參數必填；缺少參數或違反原生型別時，由 PHP 回報參數／型別錯誤。

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

`DwgEntityQueryResult` 與 `DwgEntityCollection` 都提供這些方法。集合方法回傳 `static`，
結果方法回傳 `DwgEntityCollection<int, DwgEntity>`。篩選保留索引、順序與原圖元物件。
每次以目前集合為準，不快取；先前取得的集合不會隨之更新。`withIssue()` 每筆符合圖元只回傳一次。

### 欄位與 enum

型別皆位於 `Mattmy\DwgConverter`。資料物件唯讀，圖元集合本身仍可增減項目。

| DTO | readonly 欄位 |
|---|---|
| `DwgEntityQueryResult` | `entities: DwgEntityCollection<int, DwgEntity>、diagnostics: list<DwgQueryDiagnostic>、drawingUnits: DwgDrawingUnits` |
| `DwgEntity` | `type: ?string、handle: ?string、layer: DwgLayerReference、owner: DwgEntityOwner、geometry: 四種幾何的 nullable union、color: DwgColor、block: ?DwgBlockReference、attributes: list<DwgAttribute> 或 null、isComplete: bool、issues: list<DwgEntityIssue>` |
| DwgLayerReference／DwgBlockReference | handle／name: ?string |
| DwgEntityOwner | kind: DwgOwnerKind、directHandle／containerHandle／containerName／layoutHandle／layoutName: ?string |
| DwgAttribute | handle／tag／value: ?string |
| DwgPoint | x／y: float、z: ?float |
| DwgDirection | x／y／z: float |
| DwgScale | x／y／z: ?float |
| DwgDrawingUnits | code: ?int、status: DwgDrawingUnitStatus |
| DwgColor | mode: DwgColorMode、aci／rgb: ?int |
| DwgEntityIssue | reason: DwgEntityIssueReason、field: ?string |
| DwgQueryDiagnostic | reason: DwgQueryDiagnosticReason、recordCount: ?int |

geometry 為 DwgLineGeometry、DwgCircleGeometry、DwgArcGeometry、DwgInsertGeometry 或 null：

| 類型 | 欄位 |
|---|---|
| LINE | start／end: ?DwgPoint、coordinateSystem: DwgCoordinateSystem |
| CIRCLE | center: ?DwgPoint、radius: ?float、extrusion: ?DwgDirection、coordinateSystem |
| ARC | center、radius、startAngle／endAngle: ?float、extrusion、coordinateSystem、angleUnit: DwgAngleUnit |
| INSERT | insertionPoint: ?DwgPoint、scale: ?DwgScale、rotation: ?float、extrusion、coordinateSystem、angleUnit |

| Enum | cases／字串值 |
|---|---|
| DwgOwnerKind | MODEL_SPACE=model_space、PAPER_SPACE=paper_space、BLOCK_DEFINITION=block_definition、UNKNOWN=unknown |
| DwgCoordinateSystem | WCS=wcs、OCS=ocs、UNKNOWN=unknown |
| DwgAngleUnit | RADIANS=radians |
| DwgDrawingUnitStatus | SPECIFIED=specified、UNSPECIFIED=unspecified、UNKNOWN=unknown |
| DwgColorMode | ACI=aci、TRUE_COLOR=true_color、BY_LAYER=by_layer、BY_BLOCK=by_block、UNKNOWN=unknown |
| DwgEntityType | LINE、CIRCLE、ARC、INSERT、MINSERT、HATCH、SPLINE、LWPOLYLINE；value 與 case 名稱相同 |

### 問題與診斷

`DwgEntityIssueReason` 的值：
`missing_value`, `invalid_value`, `duplicate_handle`, `missing_reference`, `invalid_reference`,
`target_not_found`, `ambiguous_reference`, `wrong_target_type`, `reference_cycle`,
`unsupported_geometry`, `unknown_color`, `incomplete_attributes`.

`field` 指向受影響的公開欄位，例如 `geometry.radius` 或 `owner`。
`issues` 為空時 `isComplete` 才是 `true`；同筆多個問題仍只算一筆不完整圖元。

`DwgQueryDiagnosticReason` 的值：
`non_entity_records`, `non_object_records`, `unclassifiable_records`, `unknown_drawing_units`.

前三項計算略過的紀錄，不是遺失圖元數。`recordCount` 為可確認的正整數；非筆數問題為 `null`。
問題與診斷不含原始工具輸出或私有名稱。

::: details 部分資料與異常來源的處理規則

- handle 為無 `0x`／前導零的十六進位大寫字串。缺少或無效為 `null`，重複紀錄仍保留；關聯有歧義時不任選目標。
- owner 是圖元所屬容器，`block` 是 INSERT／MINSERT 的目標。所屬未知時仍保留已知 handle；匿名圖塊名稱不還原 effective name。
- 屬性保留順序、重複 tag、空白與文字型數字。`[]` 表示確認為空；`null` 表示不適用或整份未知。部分可讀時保留已取得項目。
- 明確提供屬性 vector 時，`num_owned` 必須為符合原始長度的整數，`has_attribs=false` 也一樣。空 vector 缺少有效數量時為未知；數量為 0 時保留 `[]`。若 first／last 參照矛盾，記 `incomplete_attributes`，不追蹤該鏈。
- vector 重複參照 `[A,A,B]` 仍保留 `[A,A,B]`，並記 `incomplete_attributes`；鏈結清單的實際循環則以 `reference_cycle` 停止。
- HEADER 空間參照須直接指向唯一 BLOCK_HEADER；指向圖元時回 UNKNOWN／`wrong_target_type`，不繼續追蹤。一般直接 owner 鏈仍可經過圖元。HEADER 已解析所屬時，無效的直接參照只新增 `invalid_reference`，不抹除容器／配置；省略或 null 參照合法，有效直接 handle 則原樣保留，不額外解析目標。
- LINE 使用 WCS，CIRCLE／ARC／INSERT 使用 OCS；ARC／INSERT 角度為弧度。座標、Z、方向與倍率缺漏不補值；部分幾何仍保留，全部未知才為 `null`。MINSERT 有圖塊／屬性關聯，但未支援幾何。
- 半徑須大於零；方向須有三個有限分量且不全為零。倍率接受有限的零與負值。ACI 不轉 RGB；RGB 是 24-bit 整數，黑色 0 有效。繼承色合法，缺少 index 不猜 BYBLOCK；不解析透明度或色票。
:::
