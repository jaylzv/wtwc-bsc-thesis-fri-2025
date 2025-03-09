import { __module as canvas } from '../../../virtual/canvas2.js';
import { __require as requireCanvasShim } from './canvas-shim.js';

/* c8 ignore start */

var hasRequiredCanvas;

function requireCanvas () {
	if (hasRequiredCanvas) return canvas.exports;
	hasRequiredCanvas = 1;
	try {
	  canvas.exports = require('canvas');
	} catch (fallback) {
	  canvas.exports = requireCanvasShim();
	}
	/* c8 ignore stop */
	return canvas.exports;
}

export { requireCanvas as __require };
