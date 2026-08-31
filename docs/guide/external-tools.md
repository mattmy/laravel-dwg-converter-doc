# External tools

Laravel DWG Converter runs locally installed command-line tools. They are not remote services and are not
downloaded or bundled by the package. Install only the commands required by the operation you use.

## Requirements by operation

| Public operation | Result | Required commands |
|---|---|---|
| `Dwg::thumbnail(...)->extract()` | Embedded BMP, PNG, or WMF preview | LibreDWG `dwgbmp` |
| `Dwg::toDxf(...)->convert()` | ASCII DXF | LibreDWG `dwg2dxf` |
| `Dwg::toJson(...)->convert()` | LibreDWG structural JSON | LibreDWG `dwgread` with JSON output |
| `Dwg::toImage(...)->convert()` | PNG, JPEG, or WebP preview | LibreDWG `dwg2dxf`, LibreOffice 7.4+ `soffice`, ImageMagick 7 `magick` |

Calling `toDxf()`, `toJson()`, or `thumbnail()` does not require LibreOffice or ImageMagick.

## LibreDWG

For installation, follow the [official LibreDWG repository](https://github.com/libredwg/libredwg). Use a
maintained, security-patched build that provides the command required by your operation.

Verify the commands you plan to use:

```bash
dwgbmp --version
dwg2dxf --version
dwgread --version
```

If they are not on `PATH`, set their absolute paths:

```dotenv
LIBREDWG_DWGBMP=/absolute/path/to/dwgbmp
LIBREDWG_DWG2DXF=/absolute/path/to/dwg2dxf
LIBREDWG_DWGREAD=/absolute/path/to/dwgread
```

A version string such as `0.14` does not identify its patch level. Confirm the build's provenance and security
fixes instead of treating the abbreviated string as proof.

## LibreOffice

LibreOffice is required only by `toImage()`. Version 7.4 or later is required because image output includes
WebP.

### Ubuntu and Debian

```bash
sudo apt update
sudo apt install libreoffice
soffice --version
```

Confirm that the installed version is 7.4 or later.

### RHEL and Fedora

First check whether your enabled repositories provide LibreOffice 7.4 or later. If they do, install the
distribution package and verify it:

```bash
sudo dnf install libreoffice
soffice --version
```

RHEL installations do not all expose the same package set. If that command is unavailable, download the
Red Hat-family RPM archive from the [official LibreOffice download page](https://www.libreoffice.org/download/download-libreoffice/),
extract it, install the RPMs from its `RPMS` directory, and configure the resulting `soffice` absolute path.

### Windows

Install LibreOffice from the [official download page](https://www.libreoffice.org/download/download-libreoffice/).
Point the package to the console launcher, normally:

```dotenv
DWG_CONVERTER_LIBREOFFICE=C:/Program Files/LibreOffice/program/soffice.com
```

Use `soffice.com`, not `soffice.exe`: the GUI launcher can report success without producing headless output.
Also configure a short absolute `temporary_directory` to avoid Windows path-length failures.

## ImageMagick

ImageMagick is required only by `toImage()`. The package requires ImageMagick 7 and its `magick` command;
PHP `ext-imagick` and an ImageMagick 6-only `convert` command do not satisfy this requirement.

### Ubuntu and Debian

Check your distribution's package version before installing. Ubuntu 24.04's `imagemagick` package provides
ImageMagick 6, so `sudo apt install imagemagick` there does **not** provide the required ImageMagick 7
`magick` command.

When your repository provides ImageMagick 7, install it and verify the result:

```bash
sudo apt install imagemagick
magick --version
```

Otherwise use the ImageMagick 7 AppImage from the
[official download page](https://imagemagick.org/download/) or follow the
[official source installation guide](https://imagemagick.org/install-source/). Configure the downloaded or
installed executable's absolute path if it is not on `PATH`.

### RHEL and Fedora

Likewise, verify the repository's major version before relying on its package:

```bash
sudo dnf install ImageMagick
magick --version
```

If the repository installs ImageMagick 6 or does not provide `magick`, use the official ImageMagick 7
AppImage or source installation linked above.

### Windows

Use the [official ImageMagick installer](https://imagemagick.org/download/), then verify `magick.exe`:

```powershell
magick --version
```

If it is not on `PATH`, set:

```dotenv
DWG_CONVERTER_IMAGEMAGICK=C:/Program Files/ImageMagick-7.x.x-Q16-HDRI/magick.exe
```

In every environment, `magick --version` must report ImageMagick 7. Review ImageMagick's security policy
before processing untrusted files.

## Installation checklist

```text
Thumbnail only   → dwgbmp
DXF only         → dwg2dxf
JSON only        → dwgread with JSON output
Image previews   → dwg2dxf + soffice 7.4+ + magick 7
All features     → all commands above
```
