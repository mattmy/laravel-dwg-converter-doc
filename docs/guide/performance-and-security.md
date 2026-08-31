# Performance and security

DWG parsing and image conversion execute native command-line tools on complex binary input. Treat uploads and
all generated artifacts as untrusted.

## Run conversions in controlled workers

Operations are synchronous. For larger files or user uploads, call them from queue workers or containers with
explicit limits for memory, CPU, process count, writable storage, and network access. Control application
concurrency rather than starting an unlimited number of external conversions.

Package timeouts and byte limits are useful boundaries, but they are not an operating-system sandbox.

## Keep external tools patched

Use maintained, security-patched builds of LibreDWG, LibreOffice, and ImageMagick. A short LibreDWG version
string may omit its patch level, so retain build provenance. Review ImageMagick's security policy for the
formats and delegates enabled in your environment.

## Memory and disk

- Source files are copied into a private temporary workspace before a command runs.
- `storeAs()` streams a completed result to Laravel Storage.
- `output()` loads the complete artifact into PHP memory.
- JSON validation reads the complete JSON artifact and JSON may be much larger than the source DWG.
- Image conversion creates intermediate artifacts and can run up to three conversion processes.

Keep positive input/output limits for untrusted sources. If limits are disabled, enforce equivalent worker
memory and disk quotas.

## What successful output means

The package verifies command completion and minimum format structure. Success does not prove that:

- the source is safe or contains no parser exploit;
- every DWG object was understood or preserved;
- fonts, xrefs, or other external resources were available;
- a DXF opens identically in every CAD application;
- an image matches AutoCAD output pixel for pixel.

Build a representative corpus for your application's drawing versions, languages, entities, and downstream
consumers before making compatibility or performance promises.

## Logging and privacy

Do not log source bytes, complete JSON, user filenames, or server paths. Public exceptions expose sanitized
context, but application logs should still follow your data-retention and access policies.
