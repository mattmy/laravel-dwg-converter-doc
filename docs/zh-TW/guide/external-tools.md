# 外部工具

Laravel DWG Converter 會執行安裝於本機環境的命令列工具。它們不是遠端服務，也不會由套件下載或
附帶。你只需安裝實際使用的操作所需的命令。

## 各操作的需求

| 公開操作 | 結果 | 必要命令 |
|---|---|---|
| `Dwg::thumbnail(...)->extract()` | 內嵌 BMP、PNG 或 WMF 預覽 | LibreDWG `dwgbmp` |
| `Dwg::toDxf(...)->convert()` | ASCII DXF | LibreDWG `dwg2dxf` |
| `Dwg::toJson(...)->convert()` | LibreDWG 結構 JSON | 支援 JSON 輸出的 LibreDWG `dwgread` |
| `Dwg::toImage(...)->convert()` | PNG、JPEG 或 WebP 預覽 | LibreDWG `dwg2dxf`、LibreOffice 7.4+ `soffice`、ImageMagick 7 `magick` |

呼叫 `toDxf()`、`toJson()` 或 `thumbnail()` 不需要 LibreOffice 或 ImageMagick。

## LibreDWG

安裝方式請參考 [LibreDWG 官方儲存庫](https://github.com/libredwg/libredwg)。請使用仍維護、包含
安全修補，並提供操作所需命令的版本。

驗證你預計使用的命令：

```bash
dwgbmp --version
dwg2dxf --version
dwgread --version
```

不在 `PATH` 時請設定絕對路徑：

```dotenv
LIBREDWG_DWGBMP=/absolute/path/to/dwgbmp
LIBREDWG_DWG2DXF=/absolute/path/to/dwg2dxf
LIBREDWG_DWGREAD=/absolute/path/to/dwgread
```

`0.14` 之類的版本字串無法辨識修補版本。請確認安裝來源與安全修補，不要把簡短版本字串當成
已包含修補的證明。

## LibreOffice

只有 `toImage()` 需要 LibreOffice。由於圖片輸出包含 WebP，因此需要 7.4 或更新版本。

### Ubuntu 與 Debian

```bash
sudo apt update
sudo apt install libreoffice
soffice --version
```

請確認安裝版本為 7.4 或更新版本。

### RHEL 與 Fedora

先確認已啟用的套件庫是否提供 LibreOffice 7.4 或更新版本。如果有，可安裝發行版套件並驗證：

```bash
sudo dnf install libreoffice
soffice --version
```

並非所有 RHEL 環境都提供相同套件。命令無法使用或版本不符時，請由
[LibreOffice 官方下載頁](https://www.libreoffice.org/download/download-libreoffice/)取得 Red Hat 系列
RPM 壓縮檔，解壓並安裝 `RPMS` 資料夾內的 RPM，再設定產生的 `soffice` 絕對路徑。

### Windows

由 [LibreOffice 官方下載頁](https://www.libreoffice.org/download/download-libreoffice/)安裝，並將套件
指向命令列啟動程式，通常是：

```dotenv
DWG_CONVERTER_LIBREOFFICE="C:/Program Files/LibreOffice/program/soffice.com"
```

請使用 `soffice.com`，不要使用可能回報成功但未產生無圖形介面模式的輸出的 `soffice.exe`。另外請將
`temporary_directory` 設為較短的絕對路徑，避免 Windows 路徑過長造成失敗。

## ImageMagick

只有 `toImage()` 需要 ImageMagick。套件要求 ImageMagick 7 的 `magick` 命令；PHP
`ext-imagick` 或只有 ImageMagick 6 `convert` 的環境並不符合需求。

### Ubuntu 與 Debian

安裝前先確認發行版套件的版本。Ubuntu 24.04 的 `imagemagick` 套件提供 ImageMagick 6，
因此在該版本只執行 `sudo apt install imagemagick` **不會**取得本套件要求的 ImageMagick 7
`magick`。

如果套件庫已提供 ImageMagick 7，可安裝並驗證：

```bash
sudo apt install imagemagick
magick --version
```

否則請使用 [ImageMagick 官方下載頁](https://imagemagick.org/download/)提供的 ImageMagick 7
AppImage，或依[官方原始碼安裝指南](https://imagemagick.org/install-source/)安裝。不在 `PATH` 時，
請設定下載或安裝後執行檔的絕對路徑。

### RHEL 與 Fedora

同樣需要先確認套件庫提供的主要版本：

```bash
sudo dnf install ImageMagick
magick --version
```

如果安裝的是 ImageMagick 6 或沒有 `magick`，請改用上述官方 ImageMagick 7 AppImage 或原始碼
安裝方式。

### Windows

使用 [ImageMagick 官方安裝程式](https://imagemagick.org/download/)，再驗證 `magick.exe`：

```powershell
magick --version
```

若不在 `PATH`，請設定：

```dotenv
DWG_CONVERTER_IMAGEMAGICK="C:/Program Files/ImageMagick-7.x.x-Q16-HDRI/magick.exe"
```

每個環境的 `magick --version` 都必須顯示 ImageMagick 7。處理不可信檔案前，也請檢查 ImageMagick
安全政策。

## 安裝組合速查

```text
只擷取縮圖       → dwgbmp
只輸出 DXF       → dwg2dxf
只輸出 JSON      → 支援 JSON 輸出的 dwgread
輸出圖片預覽     → dwg2dxf + soffice 7.4+ + magick 7
使用全部功能     → 上述全部命令
```
