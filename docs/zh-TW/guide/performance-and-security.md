# 效能與安全

DWG 解析與圖片轉換會讓 native command-line tools 處理複雜 binary input。請將上傳內容與所有產物都
視為不可信資料。

## 在受控 worker 執行

所有操作都是同步執行。處理較大檔案或使用者 upload 時，應放在 queue worker 或 container，並明確
限制記憶體、CPU、process 數量、可寫空間與網路。應由 application 控制 concurrency，避免同時啟動無上限
數量的外部轉換。

套件的 timeout 與 byte limits 是有用的邊界，但不是作業系統 sandbox。

## 持續更新外部工具

使用仍維護且包含安全修補的 LibreDWG、LibreOffice 與 ImageMagick build。簡短的 LibreDWG 版本字串
可能省略 patch level，因此請保留 build provenance。另請檢查 ImageMagick security policy 是否符合
環境所啟用的格式與 delegates。

## 記憶體與磁碟

- command 執行前，來源會複製到 private temporary workspace。
- `storeAs()` 會將完成結果串流至 Laravel Storage。
- `output()` 會將完整產物載入 PHP 記憶體。
- JSON 驗證會讀取完整 JSON，而且 JSON 可能遠大於來源 DWG。
- 圖片轉換會建立中介產物，最多執行三個 conversion processes。

處理不可信來源時應保留正整數輸入／輸出上限。停用上限時，請在 worker 設定對應的記憶體與磁碟 quota。

## 成功輸出代表的範圍

套件會驗證 command 完成與最低格式結構，但成功不代表：

- 來源安全或不含 parser exploit；
- 每個 DWG object 都被理解或保留；
- 字型、xref 或其他外部資源都存在；
- DXF 在每個 CAD 應用顯示完全相同；
- 圖片與 AutoCAD 產物 pixel-perfect。

對外承諾相容性或效能前，請以應用實際會遇到的 DWG 版本、語言、entities 與下游軟體建立 corpus。

## Logging 與隱私

不要記錄來源 bytes、完整 JSON、使用者檔名或 server paths。公開例外雖提供去敏 context，application
log 仍應符合你的資料保留與存取政策。
