(function (_) {
    /**
     * A class representing a bitmap
     * @param {Number|Image|HTMLImageElement|GPaintCanvas|HtmlCanvasElement|CanvasRenderingContext2D} sourceOrWidth
     * @param {Number} height
     * @class GBitmap
     * @constructor
     */
    function GBitmap(sourceOrWidth, height) {
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
        } else if (sourceOrWidth instanceof GPaintCanvas) {
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

    /**
     * @enum
     */
    GBitmap.ImageType = {
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
    GBitmap.prototype._canvas = null;

    /**
     * The underlying, 2d canvas context
     * @type {CanvasRenderingContext2D}
     */
    GBitmap.prototype._canvasContext = null;

    /**
     * Returns the width of this bitmap
     * @return {Number}
     */
    GBitmap.prototype.getWidth = function () {
        return this._canvas.width;
    };

    /**
     * Returns the height of this bitmap
     * @return {Number}
     */
    GBitmap.prototype.getHeight = function () {
        return this._canvas.height;
    };

    /**
     * Converts and returns the underlying bitmap into an image
     * returned as a base64 encoded data-url
     * @param {GBitmap.ImageType} imageType the image type you want
     * @param {*} args optional arguments, see image-type
     * @return {String}
     */
    GBitmap.prototype.toImageDataUrl = function (imageType, args) {
        var params = [imageType];

        if (args) {
            params = params.concat(args);
        }

        return this._canvas.toDataURL.apply(this._canvas, params);
    };

    /**
     * Converts and returns the underlying bitmap into an image
     * returned as an ArrayBuffer
     * @param {GBitmap.ImageType} imageType the image type you want
     * @param {Function} available the callback function called with
     * the ArrayBuffer as parameter when available
     * @param {*} args optional arguments, see image-type
     */
    GBitmap.prototype.toImageBuffer = function (imageType, available, args) {
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
     * @param {GRect} [area] optional area defining the cloned bitmap data,
     * if not provided or null, takes the whole bitmap by default
     * @return {GBitmap}
     */
    GBitmap.prototype.clone = function (area) {
        area = area || new GRect(0, 0, this.getWidth(), this.getHeight());

        if (area.isEmpty()) {
            return null;
        }

        var clone = new GBitmap(area.getWidth(), area.getHeight());
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
     * @param {GRect.Side} [pivot] the pivot to resize from. Defaults to top-left
     * and thus expands in right-bottom direction.
     */
    GBitmap.prototype.resize = function (width, height, pivot) {
        width = width || 0;
        height = height || 0;
        pivot = pivot || GRect.Side.TOP_LEFT;

        if (width || height) {
            var dw = width - this.getWidth();
            var dh = height - this.getHeight();

            var left = 0;
            var top = 0;
            var right = 0;
            var bottom = 0;

            if (dw !== this.getWidth()) {
                switch (pivot) {
                    case GRect.Side.TOP_LEFT:
                    case GRect.Side.LEFT_CENTER:
                    case GRect.Side.BOTTOM_LEFT:
                        right = dw;
                        break;
                    case GRect.Side.TOP_CENTER:
                    case GRect.Side.CENTER:
                    case GRect.Side.BOTTOM_CENTER:
                        left = -dw / 2;
                        right = dw / 2;
                        break;
                    case GRect.Side.TOP_RIGHT:
                    case GRect.Side.RIGHT_CENTER:
                    case GRect.Side.BOTTOM_RIGHT:
                        left = -dw;
                        break;
                }
            }

            if (dh !== this.getHeight()) {
                switch (pivot) {
                    case GRect.Side.TOP_LEFT:
                    case GRect.Side.TOP_CENTER:
                    case GRect.Side.TOP_RIGHT:
                        bottom = dh;
                        break;

                    case GRect.Side.LEFT_CENTER:
                    case GRect.Side.CENTER:
                    case GRect.Side.RIGHT_CENTER:
                        top = -dh / 2;
                        bottom = dh / 2;
                        break;

                    case GRect.Side.BOTTOM_LEFT:
                    case GRect.Side.BOTTOM_CENTER:
                    case GRect.Side.BOTTOM_RIGHT:
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
    GBitmap.prototype.crop = function (left, top, right, bottom) {
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
    GBitmap.prototype.trim = function () {
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
     * @param {*} [modifierArgs] optional modifier args supplied to the modifier as last argument
     * @param {GRect} [area] optional area defining the bitmap data to be manipulated,
     * if not provided or null, takes the whole bitmap by default
     */
    GBitmap.prototype.modifyPixels = function (modifier, modifierArgs, area) {
        area = area || new GRect(0, 0, this.getWidth(), this.getHeight());

        if (area.isEmpty()) {
            return;
        }

        // get pixels
        var imageData = this._canvasContext.getImageData(area.getX(), area.getY(), area.getWidth(), area.getHeight());

        // run modifier
        modifier(imageData.data, area.getWidth(), area.getHeight(), modifierArgs);

        // push pixels back
        this._canvasContext.putImageData(imageData, area.getX(), area.getY());
    };

    /**
     * Apply a filter to this bitmap
     * @param {*} filter the filter class to be applied
     * @param {*} [filterArgs] additional arguments supplied to the filter
     * @param {GRect} [extents] optional extents, if not provided or null,
     * takes the whole bitmap by default
     */
    GBitmap.prototype.applyFilter = function (filter, filterArgs, extents) {
        this.modifyPixels(filter.apply, filterArgs, extents);
    };

    /** @override */
    GBitmap.prototype.toString = function () {
        return "[Object GBitmap]";
    };

    _.GBitmap = GBitmap;
})(this);