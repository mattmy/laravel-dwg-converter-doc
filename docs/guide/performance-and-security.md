# Performance and security

Treat uploaded DWGs and their generated files as untrusted.

## Run conversions in controlled workers

Operations are synchronous. For larger files or user uploads, call them from queue workers or containers with
explicit limits for memory, CPU, process count, writable storage, and network access. Set a concurrency limit
for conversion jobs.

Use operating-system isolation alongside the package's timeouts and byte limits.

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

`onlyOn()` reduces layer output and PHP parsing work. LibreDWG still decodes the whole DWG.

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

The package uses the numbers it receives from LibreDWG. A writer using `%.14f` can turn `1e-15` into `0`
or `1.000000000000001` into `1` before PHP reads the JSON. The original precision is unavailable after export.
