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
     * @param {*} [modifierArgs] optional modifier args supplied to the modifier as last argument
     * @param {IFRect} [area] optional area defining the bitmap data to be manipulated,
     * if not provided or null, takes the whole bitmap by default
     */
    IFBitmap.prototype.modifyPixels = function (modifier, modifierArgs, area) {
        area = area || new IFRect(0, 0, this.getWidth(), this.getHeight());

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
     * @param {IFRect} [extents] optional extents, if not provided or null,
     * takes the whole bitmap by default
     */
    IFBitmap.prototype.applyFilter = function (filter, filterArgs, extents) {
        this.modifyPixels(filter.apply, filterArgs, extents);
    };

    /** @override */
    IFBitmap.prototype.toString = function () {
        return "[Object IFBitmap]";
    };

    _.IFBitmap = IFBitmap;
})(this);