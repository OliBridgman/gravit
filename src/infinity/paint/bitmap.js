(function (_) {
    /**
     * A class representing a bitmap
     * @param {Number|Image|HTMLImageElement|IFPaintCanvas|HtmlCanvasElement|CanvasRenderingContext2D} sourceOrWidth
     * @param {Number} height
     * @class IFBitmap
     * @constructor
     */
    function IFBitmap(sourceOrWidth, height) {
        var bitmapWidth = 0;
        var bitmapHeight = 0;
        var canvas = null;
        var content = null;

        if (typeof sourceOrWidth === 'number') {
            bitmapWidth = sourceOrWidth;
            bitmapHeight = height;
        } else if (sourceOrWidth instanceof Image || sourceOrWidth instanceof HTMLImageElement) {
            bitmapWidth = sourceOrWidth.naturalWidth;
            bitmapHeight = sourceOrWidth.naturalHeight;
            content = sourceOrWidth;
        } else if (sourceOrWidth instanceof IFPaintCanvas) {
            canvas = sourceOrWidth._canvasContext.canvas;
        } else if (sourceOrWidth instanceof HTMLCanvasElement) {
            canvas = sourceOrWidth;
        } else if (sourceOrWidth instanceof CanvasRenderingContext2D) {
            canvas = sourceOrWidth.canvas;
        }

        if (!canvas) {
            if (bitmapWidth <= 0 || bitmapHeight <= 0) {
                throw new Error('Invalid bitmap size');
            }

            this._canvas = document.createElement('canvas');
            this._canvas.width = bitmapWidth;
            this._canvas.height = bitmapHeight;
        } else {
            this._canvas = canvas;
        }

        this._canvasContext = this._canvas.getContext('2d');

        if (content) {
            this._canvasContext.drawImage(content);
        }
    };

    IFBitmap.COLOR_MATRIX_IDENTITY = [
        1, 0, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 0, 1, 0
    ];

    IFBitmap.COLOR_MATRIX_INVERT = [
        -1, 0, 0, 0, 255,
        0, -1, 0, 0, 255,
        0, 0, -1, 0, 255,
        0, 0, 0, 1, 0
    ];

    IFBitmap.COLOR_MATRIX_GRAYSCALE = [
        0.33, 0.33, 0.33, 0, 0,
        0.33, 0.33, 0.33, 0, 0,
        0.33, 0.33, 0.33, 0, 0,
        0, 0, 0, 1, 0
    ];

    /**
     * @enum
     */
    IFBitmap.ImageType = {
        // args: none
        PNG: 'image/png',

        // args: quality 0..1.0
        JPEG: 'image/jpeg'
    };

    /**
     * The underlying canvas
     * @type {HtmlCanvasElement}
     * @private
     */
    IFBitmap.prototype._canvas = null;

    /**
     * The underlying, 2d canvas context
     * @type {CanvasRenderingContext2D}
     */
    IFBitmap.prototype._canvasContext = null;

    /**
     * Returns the width of this bitmap
     * @return {Number}
     */
    IFBitmap.prototype.getWidth = function () {
        return this._canvas.width;
    };

    /**
     * Returns the height of this bitmap
     * @return {Number}
     */
    IFBitmap.prototype.getHeight = function () {
        return this._canvas.height;
    };

    /**
     * Converts and returns the underlying bitmap into an image
     * returned as a base64 encoded data-url
     * @param {IFBitmap.ImageType} imageType the image type you want
     * @param {*} args optional arguments, see image-type
     * @return {String}
     */
    IFBitmap.prototype.toImageDataUrl = function (imageType, args) {
        var params = [imageType];

        if (args) {
            params = params.concat(args);
        }

        return this._canvas.toDataURL.apply(this._canvas, params);
    };

    /**
     * Converts and returns the underlying bitmap into an image
     * returned as an ArrayBuffer
     * @param {IFBitmap.ImageType} imageType the image type you want
     * @param {Function} available the callback function called with
     * the ArrayBuffer as parameter when available
     * @param {*} args optional arguments, see image-type
     */
    IFBitmap.prototype.toImageBuffer = function (imageType, available, args) {
        var params = [
            function (blob) {
                var reader = new FileReader();
                reader.onload = function (event) {
                    available(event.target.result);
                };
                reader.readAsArrayBuffer(blob);
            },
            imageType
        ];

        if (args) {
            params = params.concat(args);
        }

        this._canvas.toBlob.apply(this._canvas, params);
    };

    /**
     * Returns an exact copy of this bitmap that can be manipulated
     * independantly from the source bitmap
     * @param {IFRect} [area] optional area defining the cloned bitmap data,
     * if not provided or null, takes the whole bitmap by default
     * @return {IFBitmap}
     */
    IFBitmap.prototype.clone = function (area) {
        area = area || new IFRect(0, 0, this.getWidth(), this.getHeight());

        if (area.isEmpty()) {
            return null;
        }

        var clone = new IFBitmap(area.getWidth(), area.getHeight());
        var imageData = this._canvasContext.getImageData(area.getX(), area.getY(), area.getWidth(), area.getHeight());
        clone._canvasContext.putImageData(imageData, 0, 0);

        return clone;
    };

    /**
     * Resize the bitmap making it smaller or larger as will without
     * touching the original bitmap pixels
     * @param {Number} width the new width, set to null or zero to leave
     * the width untouched
     * @param {Number} height the new height, set to null or zero to leave
     * the width untouched
     * @param {IFRect.Side} [pivot] the pivot to resize from. Defaults to top-left
     * and thus expands in right-bottom direction.
     */
    IFBitmap.prototype.resize = function (width, height, pivot) {
        width = width || 0;
        height = height || 0;
        pivot = pivot || IFRect.Side.TOP_LEFT;

        if (width || height) {
            var dw = width - this.getWidth();
            var dh = height - this.getHeight();

            var left = 0;
            var top = 0;
            var right = 0;
            var bottom = 0;

            if (dw !== this.getWidth()) {
                switch (pivot) {
                    case IFRect.Side.TOP_LEFT:
                    case IFRect.Side.LEFT_CENTER:
                    case IFRect.Side.BOTTOM_LEFT:
                        right = dw;
                        break;
                    case IFRect.Side.TOP_CENTER:
                    case IFRect.Side.CENTER:
                    case IFRect.Side.BOTTOM_CENTER:
                        left = -dw / 2;
                        right = dw / 2;
                        break;
                    case IFRect.Side.TOP_RIGHT:
                    case IFRect.Side.RIGHT_CENTER:
                    case IFRect.Side.BOTTOM_RIGHT:
                        left = -dw;
                        break;
                }
            }

            if (dh !== this.getHeight()) {
                switch (pivot) {
                    case IFRect.Side.TOP_LEFT:
                    case IFRect.Side.TOP_CENTER:
                    case IFRect.Side.TOP_RIGHT:
                        bottom = dh;
                        break;

                    case IFRect.Side.LEFT_CENTER:
                    case IFRect.Side.CENTER:
                    case IFRect.Side.RIGHT_CENTER:
                        top = -dh / 2;
                        bottom = dh / 2;
                        break;

                    case IFRect.Side.BOTTOM_LEFT:
                    case IFRect.Side.BOTTOM_CENTER:
                    case IFRect.Side.BOTTOM_RIGHT:
                        top = -dh;
                        break;
                }
            }

            var imageData = this._canvasContext.getImageData(0, 0, this.getWidth(), this.getHeight());
            this._canvas.width = this.getWidth() - left + right;
            this._canvas.height = this.getHeight() - top + bottom;
            this._canvasContext.clearRect(0, 0, this.getWidth(), this.getHeight());
            this._canvasContext.putImageData(imageData, -left, -top);
        }
    };

    /**
     * Crops this bitmap's sides
     * @param {Number} left delta from left-side
     * @param {Number} top delta from top-side
     * @param {Number} right delta from right-side
     * @param {Number} bottom delta from bottom-side
     */
    IFBitmap.prototype.crop = function (left, top, right, bottom) {
        left = left || 0;
        top = top || 0;
        right = right || 0;
        bottom = bottom || 0;

        var newWidth = this.getWidth() - right;
        var newHeight = this.getHeight() - bottom;
        var imageData = this._canvasContext.getImageData(left, top, newWidth, newHeight);
        this._canvas.width = newWidth;
        this._canvas.height = newHeight;
        this._canvasContext.clearRect(0, 0, newWidth, newHeight);
        this._canvasContext.putImageData(imageData, 0, 0);
    };

    /**
     * Trims this bitmap by removing all surrounding transparent pixels
     */
    IFBitmap.prototype.trim = function () {
        var imageData = this._canvasContext.getImageData(0, 0, this.getWidth(), this.getHeight());
        var dataLength = imageData.data.length;
        var bounds = {top: null, left: null, right: null, bottom: null};
        var width = this.getWidth();
        var height = this.getHeight();
        var x, y = null;

        for (var i = 0; i < dataLength; i += 4) {
            if (imageData.data[i + 3] !== 0) {
                x = (i / 4) % width;
                y = ~~((i / 4) / width);

                if (bounds.top === null) {
                    bounds.top = y;
                }

                if (bounds.left === null) {
                    bounds.left = x;
                } else if (x < bounds.left) {
                    bounds.left = x;
                }

                if (bounds.right === null) {
                    bounds.right = x;
                } else if (bounds.right < x) {
                    bounds.right = x;
                }

                if (bounds.bottom === null) {
                    bounds.bottom = y;
                } else if (bounds.bottom < y) {
                    bounds.bottom = y;
                }
            }
        }

        this.crop(bounds.left, bounds.top, width - (bounds.right - bounds.left), height - (bounds.bottom - bounds.top));
    };

    /**
     * This is called to modify the underlying bitmap data
     * @param {Function} modifier the modifier function retrieving the bitmap data (32BPP RGBA), the width and the height
     * @param {IFRect} [area] optional area defining the bitmap data to be manipulated,
     * if not provided or null, takes the whole bitmap by default
     */
    IFBitmap.prototype.modifyPixels = function (modifier, area) {
        area = area || new IFRect(0, 0, this.getWidth(), this.getHeight());

        if (area.isEmpty()) {
            return;
        }

        // get pixels
        var imageData = this._canvasContext.getImageData(area.getX(), area.getY(), area.getWidth(), area.getHeight());

        // run modifier
        modifier(imageData.data, area.getWidth(), area.getHeight());

        // push pixels back
        this._canvasContext.putImageData(imageData, area.getX(), area.getY());
    };

    /**
     * Apply a color transformation on this bitmap
     * @param {Array<Number>} multiplier the rgba multipliers
     * @param {Array<Number>} offsets the rgba offsets
     * @param {IFRect} [extents] optional extents, if not provided or null,
     * takes the whole bitmap by default
     */
    IFBitmap.prototype.colorTransform = function (multiplier, offsets, extents) {
        this.modifyPixels(function (pixels, width, height) {
            for (var y = 0; y < height; ++y) {
                for (var x = 0; x < width; ++x) {
                    var index = (y * width + x) * 4;
                    pixels[index] = pixels[index] * multiplier[0] + offsets[0];
                    pixels[index + 1] = pixels[index + 1] * multiplier[1] + offsets[1];
                    pixels[index + 2] = pixels[index + 2] * multiplier[2] + offsets[2];
                    pixels[index + 3] = pixels[index + 3] * multiplier[3] + offsets[3];
                }
            }
        }, extents);
    };

    /**
     * Apply a color matrix on this bitmap whereas the
     * color-identity-matrix looks like this:
     *
     * |---|-R-|-G-|-B-|-A-|-Offset-|
     * |-R-| 1 | 0 | 0 | 0 |    0   |
     * |-G-| 0 | 1 | 0 | 0 |    0   |
     * |-B-| 0 | 0 | 1 | 0 |    0   |
     * |-A-| 0 | 0 | 0 | 1 |    0   |
     *
     * @param {Array<Number>} matrix the color matrix to be applied (4x5)
     * @param {IFRect} [extents] optional extents, if not provided or null,
     * takes the whole bitmap by default
     */
    IFBitmap.prototype.colorMatrix = function (matrix, extents) {
        this.modifyPixels(function (pixels, width, height) {
            for (var y = 0; y < height; ++y) {
                for (var x = 0; x < width; ++x) {
                    var index = (y * width + x) * 4;

                    var oR = pixels[index];
                    var oG = pixels[index + 1];
                    var oB = pixels[index + 2];
                    var oA = pixels[index + 3];

                    pixels[index] = (matrix[0] * oR) + (matrix[1] * oG) + (matrix[2] * oB) + (matrix[3] * oA) + matrix[4];
                    pixels[index + 1] = (matrix[5] * oR) + (matrix[6] * oG) + (matrix[7] * oB) + (matrix[8] * oA) + matrix[9];
                    pixels[index + 2] = (matrix[10] * oR) + (matrix[11] * oG) + (matrix[12] * oB) + (matrix[13] * oA) + matrix[14];
                    pixels[index + 3] = (matrix[15] * oR) + (matrix[16] * oG) + (matrix[17] * oB) + (matrix[18] * oA) + matrix[19];
                }
            }
        }, extents);
    };

    /**
     * Blur the bitmap or parts of it
     * @param {Number} radius the blur radius to be used
     * @param {IFRect} [extents] optional extents, if not provided or null,
     * takes the whole bitmap by default
     */
    IFBitmap.prototype.blur = function (radius, extents) {
        this.modifyPixels(function (pixels, width, height) {
            if (isNaN(radius) || radius < 1) return;
            radius |= 0;

            var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum,
                r_out_sum, g_out_sum, b_out_sum, a_out_sum,
                r_in_sum, g_in_sum, b_in_sum, a_in_sum,
                pr, pg, pb, pa, rbs;

            var div = radius + radius + 1;
            var widthMinus1 = width - 1;
            var heightMinus1 = height - 1;
            var radiusPlus1 = radius + 1;
            var sumFactor = radiusPlus1 * ( radiusPlus1 + 1 ) / 2;

            var stackStart = new BlurStack();
            var stack = stackStart;
            for (i = 1; i < div; i++) {
                stack = stack.next = new BlurStack();
                if (i == radiusPlus1) var stackEnd = stack;
            }
            stack.next = stackStart;
            var stackIn = null;
            var stackOut = null;

            yw = yi = 0;

            var mul_sum = mul_table[radius];
            var shg_sum = shg_table[radius];

            for (y = 0; y < height; y++) {
                r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;

                r_out_sum = radiusPlus1 * ( pr = pixels[yi] );
                g_out_sum = radiusPlus1 * ( pg = pixels[yi + 1] );
                b_out_sum = radiusPlus1 * ( pb = pixels[yi + 2] );
                a_out_sum = radiusPlus1 * ( pa = pixels[yi + 3] );

                r_sum += sumFactor * pr;
                g_sum += sumFactor * pg;
                b_sum += sumFactor * pb;
                a_sum += sumFactor * pa;

                stack = stackStart;

                for (i = 0; i < radiusPlus1; i++) {
                    stack.r = pr;
                    stack.g = pg;
                    stack.b = pb;
                    stack.a = pa;
                    stack = stack.next;
                }

                for (i = 1; i < radiusPlus1; i++) {
                    p = yi + (( widthMinus1 < i ? widthMinus1 : i ) << 2 );
                    r_sum += ( stack.r = ( pr = pixels[p])) * ( rbs = radiusPlus1 - i );
                    g_sum += ( stack.g = ( pg = pixels[p + 1])) * rbs;
                    b_sum += ( stack.b = ( pb = pixels[p + 2])) * rbs;
                    a_sum += ( stack.a = ( pa = pixels[p + 3])) * rbs;

                    r_in_sum += pr;
                    g_in_sum += pg;
                    b_in_sum += pb;
                    a_in_sum += pa;

                    stack = stack.next;
                }


                stackIn = stackStart;
                stackOut = stackEnd;
                for (x = 0; x < width; x++) {
                    pixels[yi] = (r_sum * mul_sum) >> shg_sum;
                    pixels[yi + 1] = (g_sum * mul_sum) >> shg_sum;
                    pixels[yi + 2] = (b_sum * mul_sum) >> shg_sum;
                    pixels[yi + 3] = (a_sum * mul_sum) >> shg_sum;

                    r_sum -= r_out_sum;
                    g_sum -= g_out_sum;
                    b_sum -= b_out_sum;
                    a_sum -= a_out_sum;

                    r_out_sum -= stackIn.r;
                    g_out_sum -= stackIn.g;
                    b_out_sum -= stackIn.b;
                    a_out_sum -= stackIn.a;

                    p = ( yw + ( ( p = x + radius + 1 ) < widthMinus1 ? p : widthMinus1 ) ) << 2;

                    r_in_sum += ( stackIn.r = pixels[p]);
                    g_in_sum += ( stackIn.g = pixels[p + 1]);
                    b_in_sum += ( stackIn.b = pixels[p + 2]);
                    a_in_sum += ( stackIn.a = pixels[p + 3]);

                    r_sum += r_in_sum;
                    g_sum += g_in_sum;
                    b_sum += b_in_sum;
                    a_sum += a_in_sum;

                    stackIn = stackIn.next;

                    r_out_sum += ( pr = stackOut.r );
                    g_out_sum += ( pg = stackOut.g );
                    b_out_sum += ( pb = stackOut.b );
                    a_out_sum += ( pa = stackOut.a );

                    r_in_sum -= pr;
                    g_in_sum -= pg;
                    b_in_sum -= pb;
                    a_in_sum -= pa;

                    stackOut = stackOut.next;

                    yi += 4;
                }
                yw += width;
            }


            for (x = 0; x < width; x++) {
                g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;

                yi = x << 2;
                r_out_sum = radiusPlus1 * ( pr = pixels[yi]);
                g_out_sum = radiusPlus1 * ( pg = pixels[yi + 1]);
                b_out_sum = radiusPlus1 * ( pb = pixels[yi + 2]);
                a_out_sum = radiusPlus1 * ( pa = pixels[yi + 3]);

                r_sum += sumFactor * pr;
                g_sum += sumFactor * pg;
                b_sum += sumFactor * pb;
                a_sum += sumFactor * pa;

                stack = stackStart;

                for (i = 0; i < radiusPlus1; i++) {
                    stack.r = pr;
                    stack.g = pg;
                    stack.b = pb;
                    stack.a = pa;
                    stack = stack.next;
                }

                yp = width;

                for (i = 1; i <= radius; i++) {
                    yi = ( yp + x ) << 2;

                    r_sum += ( stack.r = ( pr = pixels[yi])) * ( rbs = radiusPlus1 - i );
                    g_sum += ( stack.g = ( pg = pixels[yi + 1])) * rbs;
                    b_sum += ( stack.b = ( pb = pixels[yi + 2])) * rbs;
                    a_sum += ( stack.a = ( pa = pixels[yi + 3])) * rbs;

                    r_in_sum += pr;
                    g_in_sum += pg;
                    b_in_sum += pb;
                    a_in_sum += pa;

                    stack = stack.next;

                    if (i < heightMinus1) {
                        yp += width;
                    }
                }

                yi = x;
                stackIn = stackStart;
                stackOut = stackEnd;
                for (y = 0; y < height; y++) {
                    p = yi << 2;
                    pixels[p + 3] = pa = (a_sum * mul_sum) >> shg_sum;
                    if (pa > 0) {
                        pa = 255 / pa;
                        pixels[p] = ((r_sum * mul_sum) >> shg_sum ) * pa;
                        pixels[p + 1] = ((g_sum * mul_sum) >> shg_sum ) * pa;
                        pixels[p + 2] = ((b_sum * mul_sum) >> shg_sum ) * pa;
                    } else {
                        pixels[p] = pixels[p + 1] = pixels[p + 2] = 0;
                    }

                    r_sum -= r_out_sum;
                    g_sum -= g_out_sum;
                    b_sum -= b_out_sum;
                    a_sum -= a_out_sum;

                    r_out_sum -= stackIn.r;
                    g_out_sum -= stackIn.g;
                    b_out_sum -= stackIn.b;
                    a_out_sum -= stackIn.a;

                    p = ( x + (( ( p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1 ) * width )) << 2;

                    r_sum += ( r_in_sum += ( stackIn.r = pixels[p]));
                    g_sum += ( g_in_sum += ( stackIn.g = pixels[p + 1]));
                    b_sum += ( b_in_sum += ( stackIn.b = pixels[p + 2]));
                    a_sum += ( a_in_sum += ( stackIn.a = pixels[p + 3]));

                    stackIn = stackIn.next;

                    r_out_sum += ( pr = stackOut.r );
                    g_out_sum += ( pg = stackOut.g );
                    b_out_sum += ( pb = stackOut.b );
                    a_out_sum += ( pa = stackOut.a );

                    r_in_sum -= pr;
                    g_in_sum -= pg;
                    b_in_sum -= pb;
                    a_in_sum -= pa;

                    stackOut = stackOut.next;

                    yi += width;
                }
            }
        }, extents);
    };

    /** @override */
    IFBitmap.prototype.toString = function () {
        return "[Object IFBitmap]";
    };

    /*
     StackBlur - a fast almost Gaussian Blur For Canvas

     Version: 	0.6
     Author:		Mario Klingemann
     Contact: 	mario@quasimondo.com
     Website:	http://www.quasimondo.com/StackBlurForCanvas
     Twitter:	@quasimondo

     In case you find this class useful - especially in commercial projects -
     I am not totally unhappy for a small donation to my PayPal account
     mario@quasimondo.de

     Or support me on flattr:
     https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript

     Copyright (c) 2010 Mario Klingemann

     Permission is hereby granted, free of charge, to any person
     obtaining a copy of this software and associated documentation
     files (the "Software"), to deal in the Software without
     restriction, including without limitation the rights to use,
     copy, modify, merge, publish, distribute, sublicense, and/or sell
     copies of the Software, and to permit persons to whom the
     Software is furnished to do so, subject to the following
     conditions:

     The above copyright notice and this permission notice shall be
     included in all copies or substantial portions of the Software.

     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
     EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
     OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
     NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
     HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
     WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
     FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
     OTHER DEALINGS IN THE SOFTWARE.
     */
    var mul_table = [
        512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512,
        454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512,
        482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456,
        437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512,
        497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328,
        320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456,
        446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335,
        329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512,
        505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405,
        399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328,
        324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271,
        268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456,
        451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388,
        385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335,
        332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292,
        289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259];


    var shg_table = [
        9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17,
        17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19,
        19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
        20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,
        21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
        21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22,
        22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
        22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23,
        23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
        23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
        23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
        23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
        24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
        24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
        24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
        24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24 ];

    function BlurStack() {
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 0;
        this.next = null;
    }

    _.IFBitmap = IFBitmap;
})(this);