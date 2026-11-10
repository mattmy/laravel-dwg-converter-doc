# Performance and security

Use this guide to plan memory, disk space, and worker limits for large or untrusted DWG files.
Treat uploaded DWGs and their generated files as untrusted.

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
- `toJson()->convert()` and `info()->read()` load and decode the full JSON, which can be much larger than
  the DWG. `version()` reads only the header.
- Image conversion creates intermediate artifacts and can run up to three conversion processes.
- Layer queries hold both tool output and a Collection in memory; `max_output_bytes` does not cap PHP memory use.

`onlyOn()` reduces returned layer data and PHP parsing work, but the tool still decodes the whole DWG; no fixed speedup is guaranteed.

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

The [temporary cleanup warning](./errors-and-troubleshooting#temporary-cleanup-warning) excludes paths,
filenames, file contents, raw exception messages, and stack traces.

Avoid adding source bytes, complete JSON, user filenames, or server paths to application log messages.
Public exceptions expose sanitized context, but full exception reports may include paths in previous exceptions
or stack traces. Restrict log access and follow your data-retention policies.

Process failure context for layer, entity, and drawing information queries omits raw stderr.

## Entity queries {#entity-queries}

Entity queries generate, read, and decode the full JSON before building relationship indices and result data.
`onlyLayers()` skips detailed parsing of excluded entities; it cannot avoid the full JSON and indexing costs.
The three byte limits do not apply. Use deployment controls for worker memory and disk usage.
Process timeout and PHP's native JSON depth of `512` still apply; results are not truncated to fit memory.
Out-of-memory termination or an OS kill may prevent exceptions and temporary cleanup.

Numbers come from LibreDWG's JSON. The checked writer uses `%.14f`: `1e-15` can become `0`, and
`1.000000000000001` can become `1` before PHP receives them. The package adds no rounding and cannot detect
or restore that upstream precision loss. Valid zero values are still retained.
