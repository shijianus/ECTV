/**
 * Optional player integrations for libbitsub.
 *
 * Prefer deep imports (`libbitsub/videojs`, `libbitsub/shaka`, `libbitsub/hlsjs`,
 * `libbitsub/react`) so unused peer dependencies stay out of your bundle.
 *
 * @module
 */
/** Shared attach/create helpers used by every player adapter. */
export { attachBitSub, createBitSubRenderer } from './shared.js';
/** Video.js plugin and player typings. */
export { registerBitSubPlugin } from './videojs.js';
/** Shaka Player adapter. */
export { attachBitSubToShaka } from './shaka.js';
/** hls.js adapter. */
export { attachBitSubToHls } from './hlsjs.js';
/** React hook and overlay component. */
export { BitSubOverlay, useBitSub } from './react.js';
//# sourceMappingURL=index.js.map