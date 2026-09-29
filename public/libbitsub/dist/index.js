/**
 * High-performance WASM renderer for graphical subtitles (PGS, VobSub, and DVB).
 *
 * High-level video overlay renderers, low-level parsers, capability probes,
 * and frame-export helpers.
 *
 * @module
 */
// High-level video-integrated renderers (compatible with old libpgs-js API)
export { PgsRenderer, DvbRenderer, VobSubRenderer, createAutoSubtitleRenderer } from './wrapper.js';
// Low-level parsers for programmatic use
export { PgsParser, DvbParser, VobSubParserLowLevel, UnifiedSubtitleParser, openSubtitles } from './wrapper.js';
// Utility exports
export { initWasm, isWasmInitialized, isWebGPUSupported, isWorkerAvailable, isWorkerReady, warmup, ready, getRuntimeCapabilities, canUseWorkerOffscreenRender, isOffscreenCanvasSupported, isOffscreenCanvas2DSupported, isTransferControlToOffscreenSupported, isCanvas2DSupported, detectSubtitleFormat, fetchSubtitleAsset, fetchSubtitleText, probeRangeSupport, renderFrameData, toBlob, toCanvas, toImageBitmap, createSubtitleDiagnosticError, normalizeSubtitleError, SubtitleDiagnosticError } from './wrapper.js';
// Legacy aliases
export { PGSRenderer, VobsubRenderer, UnifiedSubtitleRenderer } from './wrapper.js';
//# sourceMappingURL=index.js.map