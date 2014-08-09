(function (_) {
    /**
     * A canvas wrapper to paint onto
     * @class IFPaintCanvas
     * @extends IFObject
     * @constructor
     */
    function IFPaintCanvas() {
        var canvasElement = document.createElement("canvas");
        this._canvasContext = canvasElement.getContext("2d");
    }

    IFObject.inherit(IFPaintCanvas, IFObject);

    /**
     * @enum
     */
    IFPaintCanvas.LineCap = {
        Butt: 'butt',
        Round: 'round',
        Square: 'square'
    };

    /**
     * @enum
     */
    IFPaintCanvas.LineJoin = {
        Miter: 'miter',
        Bevel: 'bevel',
        Round: 'round'
    };

    /**
     * @enum
     */
    IFPaintCanvas.BlendMode = {
        Normal: 'normal',
        Multiply: 'multiply',
        Screen: 'screen',
        Overlay: 'overlay',
        Darken: 'darken',
        Lighten: 'lighten',
        ColorDoge: 'color-doge',
        ColorBurn: 'color-burn',
        HardLight: 'hard-light',
        SoftLight: 'soft-light',
        Difference: 'difference',
        Exclusion: 'exclusion',
        Hue: 'hue',
        Saturation: 'saturation',
        Color: 'color',
        Luminosity: 'luminosity'
    };

    /**
     * @enum
     */
    IFPaintCanvas.CompositeOperator = {
        /**
         * Displays the source image over the destination image
         * @type {Number}
         * @version 1.0
         */
        SourceOver: 'source-over',

        /**
         * Displays the source image on top of the destination image.
         * The part of the source image that is outside the destination image is not shown
         * @type {Number}
         * @version 1.0
         */
        SourceAtTop: 'source-atop',

        /**
         * Displays the source image in to the destination image. Only the part of the source image that is
         * INSIDE the destination image is shown, and the destination image is transparent
         * @type {Number}
         * @version 1.0
         */
        SourceIn: 'source-in',

        /**
         * Displays the source image out of the destination image. Only the part of the source image that is
         * OUTSIDE the destination image is shown, and the destination image is transparent
         * @type {Number}
         * @version 1.0
         */
        SourceOut: 'source-out',

        /**
         * Displays the destination image over the source image
         * @type {Number}
         * @version 1.0
         */
        DestinationOver: 'destination-over',

        /**
         * Displays the destination image on top of the source image. The part of the destination image
         * that is outside the source image is not shown
         * @type {Number}
         * @version 1.0
         */
        DestinationAtTop: 'destination-atop',

        /**
         * Displays the destination image in to the source image. Only the part of the destination image that is
         * INSIDE the source image is shown, and the source image is transparent
         * @type {Number}
         * @version 1.0
         */
        DestinationIn: 'destination-in',

        /**
         * Displays the destination image out of the source image. Only the part of the destination image that is
         * OUTSIDE the source image is shown, and the source image is transparent
         * @type {Number}
         * @version 1.0
         */
        DestinationOut: 'destination-out',

        /**
         * Displays the source image. The destination image is ignored
         * @type {Number}
         * @version 1.0
         */
        Copy: 'copy',

        /**
         * The source image is combined by using an exclusive OR with the destination image
         * @type {Number}
         * @version 1.0
         */
        Xor: 'xor',

        /**
         * Displays the source image + the destination image making the intersection lighter
         * @type {Number}
         * @version 1.0
         */
        Lighter: 'lighter',

        /**
         * Displays the source image + the destination image making the intersection darker
         * @type {Number}
         * @version 1.0
         */
        Darker: 'darker'
    };

    /**
     * A repeat mode of patterns and gradients
     * @enum
     */
    IFPaintCanvas.RepeatMode = {
        /** Horizontal and vertical repeat */
        Both: 'repeat',
        /** Horizontal repeat */
        Horizontal: 'repeat-x',
        /** Vertical repeat */
        Vertical: 'repeat-y',
        /** No repeat */
        None: 'no-repeat'
    };

    function createChessboardCanvas (size, backColor, foreColor) {
        var result = document.createElement('canvas');
        result.width = size * 2;
        result.height = size * 2;
        var context = result.getContext('2d');
        context.fillStyle = backColor;
        context.fillRect(0, 0, result.width, result.height);
        context.fillStyle = foreColor;
        context.fillRect(0, 0, size, size);
        context.fillRect(size, size, size, size);
        return result;
    };

    IFPaintCanvas.COLOR_MATRIX_IDENTITY = [
        1, 0, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 0, 1, 0
    ];

    IFPaintCanvas.COLOR_MATRIX_INVERT = [
        -1, 0, 0, 0, 255,
        0, -1, 0, 0, 255,
        0, 0, -1, 0, 255,
        0, 0, 0, 1, 0
    ];

    IFPaintCanvas.COLOR_MATRIX_GRAYSCALE = [
        0.33, 0.33, 0.33, 0, 0,
        0.33, 0.33, 0.33, 0, 0,
        0.33, 0.33, 0.33, 0, 0,
        0, 0, 0, 1, 0
    ];

    IFPaintCanvas.createChessboard = function (size, backColor, foreColor) {
        var result = document.createElement('canvas');
        result.width = size * 2;
        result.height = size * 2;
        var context = result.getContext('2d');
        context.fillStyle = backColor;
        context.fillRect(0, 0, result.width, result.height);
        context.fillStyle = foreColor;
        context.fillRect(0, 0, size, size);
        context.fillRect(size, size, size, size);
        return result;
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFPaintCanvas Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type CanvasRenderingContext2D
     * @private
     */
    IFPaintCanvas.prototype._canvasContext = null;

    /**
     * @type IFTransform
     * @private
     */
    IFPaintCanvas.prototype._transform = null;

    /**
     * @type IFPoint
     * @private
     */
    IFPaintCanvas.prototype._offset = null;

    /**
     * @type IFPoint
     * @private
     */
    IFPaintCanvas.prototype._origin = null;

    /**
     * @type Number
     * @private
     */
    IFPaintCanvas.prototype._scale = null;

    /**
     * @type Array<IFRect>
     * @private
     */
    IFPaintCanvas.prototype._areas = null;

    /**
     * @return {Number} the width of the canvas
     * @version 1.0
     */
    IFPaintCanvas.prototype.getWidth = function () {
        return this._canvasContext.canvas.width;
    };

    /**
     * @return {Number} the height of the canvas
     * @version 1.0
     */
    IFPaintCanvas.prototype.getHeight = function () {
        return this._canvasContext.canvas.height;
    };

    /**
     * Returns the contents of the canvas as a png image
     * with a resolution of 96dpi as a base64
     * encoded data url
     * @return {String}
     */
    IFPaintCanvas.prototype.asPNGImage = function () {
        return this._canvasContext.canvas.toDataURL('image/png');
    };

    /**
     * Returns the contents of the canvas as a jpeg image
     * with a resolution of 96dpi as a base64
     * encoded data url
     * @param {Number} [quality] the quality of the image from
     * 0.0 to 1.0, defaults to 1.0
     * @return {String}
     */
    IFPaintCanvas.prototype.asJPEGImage = function (quality) {
        quality = quality || 1.0;
        return this._canvasContext.canvas.toDataURL('image/jpeg', quality);
    };

    /**
     * Returns the contents of the canvas as a png image
     * with a resolution of 96dpi as an ArrayBuffer
     * @param {Function} done callback function called with the ArrayBuffer
     */
    IFPaintCanvas.prototype.asPNGImageBuffer = function (done) {
        this._canvasContext.canvas.toBlob(function (blob) {
            var reader = new FileReader();
            reader.onload = function (event) {
                done(event.target.result);
            };
            reader.readAsArrayBuffer(blob);
        }, 'image/png');
    };

    /**
     * Returns the contents of the canvas as a jpeg image
     * with a resolution of 96dpi as an ArrayBuffer
     * @param {Function} done callback function called with the ArrayBuffer
     * @param {Number} [quality] the quality of the image from
     * 0.0 to 1.0, defaults to 1.0
     */
    IFPaintCanvas.prototype.asJPEGImageBuffer = function (done, quality) {
        quality = quality || 1.0;
        this._canvasContext.canvas.toBlob(function (blob) {
            var reader = new FileReader();
            reader.onload = function (event) {
                done(event.target.result);
            };
            reader.readAsArrayBuffer(blob);
        }, 'image/jpeg', quality);
    };

    /**
     * Resize this canvas
     * @param {Number} width the new width for the canvas
     * @param {Number} height the new height for the canvas
     * @version 1.0
     */
    IFPaintCanvas.prototype.resize = function (width, height) {
        if (width != this._canvasContext.canvas.width || height != this._canvasContext.canvas.height) {
            this._canvasContext.canvas.width = width;
            this._canvasContext.canvas.height = height;
        }
    };

    /**
     * Returns the offset of this canvas
     * @returns {IFPoint}
     */
    IFPaintCanvas.prototype.getOffset = function () {
        return this._offset;
    };

    /**
     * Assigns the offset of this canvas
     * @param {IFPoint} origin
     */
    IFPaintCanvas.prototype.setOffset = function (offset) {
        this._offset = offset;
    };

    /**
     * Returns the origin of this canvas
     * @returns {IFPoint}
     */
    IFPaintCanvas.prototype.getOrigin = function () {
        return this._origin;
    };

    /**
     * Assigns the origin of this canvas. The origin
     * will always be premultiplied with any transformation.
     * @param {IFPoint} origin
     */
    IFPaintCanvas.prototype.setOrigin = function (origin) {
        if (!IFPoint.equals(origin, this._origin)) {
            this._origin = origin;
            this._updateTransform();
        }
    };

    /**
     * Returns the scalation of this canvas
     * @returns {Number}
     */
    IFPaintCanvas.prototype.getScale = function () {
        return this._scale;
    };

    /**
     * Assigns the scalation of this canvas. The scalation
     * will always be premultiplied with any transformation.
     * @param {IFPoint} origin
     */
    IFPaintCanvas.prototype.setScale = function (scale) {
        if (scale !== this._scale) {
            this._scale = scale;
            this._updateTransform();
        }
    };

    /**
     * Return the current transform of the canvas, may never be null
     * @param {Boolean} [local] if provided, returns only the local
     * transformation which excludes the canvas' origin and scalation.
     * This parameter defaults to false, thus returns the global transform.
     * @return {IFTransform} current transform
     */
    IFPaintCanvas.prototype.getTransform = function (local) {
        var transform = this._transform;
        if (!local) {
            var tx = this._origin.getX();
            var ty = this._origin.getY();
            var s = this._scale;
            transform = transform.multiplied(new IFTransform().scaled(s, s).translated(-tx, -ty));
        }
        return transform;
    };

    /**
     * Assign a new transformation to the canvas
     * @param {IFTransform} transform the new transform to assign. If this
     * is null, then the identiy transformation is used assigned instead
     * @return {IFTransform} the old transform before assignment
     * @version 1.0
     */
    IFPaintCanvas.prototype.setTransform = function (transform) {
        if (transform == null) {
            // Use identity transform
            transform = new IFTransform();
        }
        var oldTransform = this._transform;
        this._transform = transform;
        this._updateTransform();

        return oldTransform;
    };

    /**
     * Reset the transformation to the identity transformation
     * @return {IFTransform} the old transform before reset
     * @version 1.0
     */
    IFPaintCanvas.prototype.resetTransform = function () {
        return this.setTransform(null);
    };

    /**
     * This needs to be called when the canvas should prepare
     * itself for painting.
     * @param {Array<IFRect>} areas an array of areas to be painted.
     * those will be used for clipping any painting as well for
     * clearing those regions before anything else. Note that you need
     * to enforce to provide integer based rectangles only as internally,
     * the canvas may need to convert into integers first which may
     * result in rounding errors otherwise
     */
    IFPaintCanvas.prototype.prepare = function (areas) {
        // save context before anything else
        this._canvasContext.save();

        // Reset some stuff
        this._transform = new IFTransform();
        this._origin = new IFPoint(0, 0);
        this._scale = 1.0;
        this._areas = areas ? areas.slice() : null;
        this._updateTransform();

        // Clip and clear our areas if any
        if (areas && areas.length > 0) {
            this._canvasContext.beginPath();
            for (var i = 0; i < areas.length; ++i) {
                var rect = areas[i];

                var xMin = rect.getX();
                var xMax = xMin + rect.getWidth();
                var yMin = rect.getY();
                var yMax = yMin + rect.getHeight();

                // Clip to our own extents
                xMin = Math.max(0, xMin);
                xMax = Math.min(this.getWidth(), xMax);
                yMin = Math.max(0, yMin);
                yMax = Math.min(this.getHeight(), yMax);

                // Add path
                this._canvasContext.moveTo(xMin, yMin);
                this._canvasContext.lineTo(xMax, yMin);
                this._canvasContext.lineTo(xMax, yMax);
                this._canvasContext.lineTo(xMin, yMax);
                this._canvasContext.lineTo(xMin, yMin);
                this._canvasContext.clearRect(xMin, yMin, xMax - xMin, yMax - yMin);
            }
            this._canvasContext.clip();
        } else {
            this._canvasContext.clearRect(0, 0, this.getWidth(), this.getHeight());
        }
    };

    /**
     * This needs to be called when the canvas is finished
     * and should restore.
     * @version 1.0
     */
    IFPaintCanvas.prototype.finish = function () {
        this._canvasContext.restore();
        this._transform = null;
        this._origin = null;
        this._scale = null;
        this._areas = null;
    };

    /**
     * Creates a temporary canvas with the given extents.
     * The returned canvas will be compatible to this canvas
     * and thus, will prepared in the same way as this one
     * including the current zoom level and dirty areas. Note that the
     * canvas will include a transformation so that the
     * extent's x/y coordinates are equal to 0,0. Temporary canvases
     * should never be used i.e. for effects as they might be cut off.
     * @param {IFRect} extents the extents for the requested canvas
     * Defaults to false.
     */
    IFPaintCanvas.prototype.createCanvas = function (extents, clipDirty) {
        var result = new IFPaintCanvas();

        // Convert extents into this canvas' coordinates and clip accordingly
        var paintExtents = this.getTransform(false).mapRect(extents);
        var left = paintExtents.getX();
        var top = paintExtents.getY();
        var width = paintExtents.getWidth();
        var height = paintExtents.getHeight();

        if (top < 0) {
            height += top;
            top = 0;
        }

        if (left < 0) {
            width += left;
            left = 0;
        }

        if (left + width > this.getWidth()) {
            width = this.getWidth() - left;
        }

        if (top + height > this.getHeight()) {
            height = this.getHeight() - top;
        }

        var sceneExtents = this.getTransform(false).inverted().mapRect(new IFRect(left, top, width, height));

        var finalExtents = new IFRect(
            sceneExtents.getX() * this._scale,
            sceneExtents.getY() * this._scale,
            sceneExtents.getWidth() * this._scale,
            sceneExtents.getHeight() * this._scale
        );

        // Resize canvas including our scalation plus a small tolerance factor
        result.resize(finalExtents.getWidth(), finalExtents.getHeight());

        var areas = null;
        if (clipDirty && this._areas) {
            areas = [];
            for (var i = 0; i < this._areas.length; ++i) {
                areas.push(this._areas[i].translated(-left, -top));
            }
        }

        // Let canvas prepare itself
        result.prepare(areas);

        // Set result's origin and scalation
        var topLeft = finalExtents.getSide(IFRect.Side.TOP_LEFT);
        result.setOrigin(topLeft);
        result.setOffset(topLeft);
        result.setScale(this._scale);

        // Finally return our new canvas
        return result;
    };

    /**
     * Clears the whole canvas to be fully transparent
     */
    IFPaintCanvas.prototype.clear = function () {
        var clearRect = this.getTransform(false).inverted().mapRect(new IFRect(0, 0, this.getWidth(), this.getHeight()));
        this._canvasContext.clearRect(clearRect.getX(), clearRect.getY(), clearRect.getWidth(), clearRect.getHeight());
    };

    /**
     * Draw a canvas on this one. The canvas will be painted at it's given
     * offset position including the delta parameters. If the given canvas' scale
     * is != 100%, the canvas will draw it at 100%
     * @param {IFPaintCanvas} canvas
     * @param {Number} [dx]
     * @param {Number} [dy]
     * @param {Number} [opacity]
     * @param {IFPaintCanvas.CompositeOperator|IFPaintCanvas.BlendMode} [cmpOrBlend]
     * @param {Boolean} [clear] if true, the underlying area the canvas will be put onto
     * will be cleared first with transparent alpha values. Defaults to false.
     */
    IFPaintCanvas.prototype.drawCanvas = function (canvas, dx, dy, opacity, cmpOrBlend, clear) {
        // Make sure to reset scale when drawing canvases + make non smooth
        var hadSmooth = this._getImageSmoothingEnabled();
        var oldScale = this._scale;
        this._setImageSmoothingEnabled(oldScale < 1);
        if (canvas.getScale() !== 1.0) {
            this.setScale(1);
        }
        var oldTransform = this.resetTransform();
        var oldTranslation = oldTransform.getTranslation();

        dx = dx | 0;
        dy = dy | 0;

        var offset = canvas.getOffset();
        var x = offset ? offset.getX() : 0 | 0;
        var y = offset ? offset.getY() : 0 | 0;
        var w = canvas.getWidth();
        var h = canvas.getHeight();

        x += dx + oldTranslation.getX() * oldScale;
        y += dy + oldTranslation.getY() * oldScale;

        if (clear) {
            this._canvasContext.clearRect(x, y, w, h);
        }

        this._canvasContext.globalAlpha = typeof opacity == "number" ? opacity : 1.0;

        this._canvasContext.globalCompositeOperation = cmpOrBlend ? cmpOrBlend : IFPaintCanvas.CompositeOperator.SourceOver;

        this._canvasContext.drawImage(canvas._canvasContext.canvas, 0, 0, w, h,
            x, y, w, h);

        this.setTransform(oldTransform);
        this.setScale(oldScale);
        this._setImageSmoothingEnabled(hadSmooth);
    };

    /**
     * Creates and returns a texture pattern
     *
     * @param {Image|IFPaintCanvas} image the image or canvas for the texture
     * @param {IFPaintCanvas.RepeatMode} [repeat] the repeat mode, defaults
     * to IFPaintCanvas.RepeatMode.Both
     */
    IFPaintCanvas.prototype.createTexture = function (image, repeat) {
        repeat = repeat || IFPaintCanvas.RepeatMode.Both;
        image = this._convertImage(image);
        return this._canvasContext.createPattern(image, repeat);
    };

    /**
     * Creates and returns a linear gradient pattern
     * @param {Number} x1 horizontal start position
     * @param {Number} y1 vertical start position
     * @param {Number} x2 horizontal end position
     * @param {Number} y2 vertical end position
     * @param {IFGradient} gradient the gradient to be used
     * @return {*} a pattern specific to this canvas-type
     */
    IFPaintCanvas.prototype.createLinearGradient = function (x1, y1, x2, y2, gradient) {
        var result = this._canvasContext.createLinearGradient(x1, y1, x2, y2);
        var stops = gradient.getStops();

        for (var i = 0; i < stops.length; ++i) {
            result.addColorStop(stops[i].position / 100.0, stops[i].color.asCSSString());
        }

        return result;
    };

    /**
     * Creates and returns a radial gradient pattern
     * @param {Number} cx the radial gradient's horizontal center position
     * @param {Number} cy the radial gradient's vertical center position
     * @param {Number} radius the radial gradient's radius
     * @param {IFGradient} gradient the gradient to be used
     * @return {*} a pattern specific to this canvas-type
     */
    IFPaintCanvas.prototype.createRadialGradient = function (cx, cy, radius, gradient) {
        var result = this._canvasContext.createRadialGradient(cx, cy, 0, cx, cy, radius);
        var stops = gradient.getStops();

        for (var i = 0; i < stops.length; ++i) {
            result.addColorStop(stops[i].position / 100.0, stops[i].color.asCSSString());
        }

        return result;
    };

    /**
     * Use a rectangle source as clipping region (adds to the current one)
     * @param {Number} x x-position of rectangle
     * @param {Number} y y-position of rectangle
     * @param {Number} width width of rectangle
     * @param {Number} height height of rectangle
     * @version 1.0
     */
    IFPaintCanvas.prototype.clipRect = function (x, y, width, height) {
        // Too bad we need to use expensive save() / restore() on canvas for now for clipping :(
        this._canvasContext.save();

        this._canvasContext.beginPath();
        this._canvasContext.moveTo(x, y);
        this._canvasContext.lineTo(x + width, y);
        this._canvasContext.lineTo(x + width, y + height);
        this._canvasContext.lineTo(x, y + height);
        this._canvasContext.lineTo(x, y);
        this._canvasContext.clip();
    };

    /**
     * Reset the last assigned clipping region
     * @version 1.0
     */
    IFPaintCanvas.prototype.resetClip = function () {
        this._canvasContext.restore();
    };

    /**
     * Pushes a vertex source into this canvas overwriting any
     * previously added vertices. This will act as source for different
     * functions like clipVertices, strokeVertices and fillVertices
     * @param {IFVertexSource} vertexSource the vertex source to use for clipping
     */
    IFPaintCanvas.prototype.putVertices = function (vertexSource) {
        if (vertexSource.rewindVertices(0)) {
            this._canvasContext.beginPath();

            var vertex = new IFVertex();
            while (vertexSource.readVertex(vertex)) {
                switch (vertex.command) {
                    case IFVertex.Command.Move:
                        this._canvasContext.moveTo(vertex.x, vertex.y);
                        break;
                    case IFVertex.Command.Line:
                        this._canvasContext.lineTo(vertex.x, vertex.y);
                        break;
                    case IFVertex.Command.Curve:
                    {
                        var xTo = vertex.x;
                        var yTo = vertex.y;
                        if (vertexSource.readVertex(vertex)) {
                            this._canvasContext.quadraticCurveTo(vertex.x, vertex.y, xTo, yTo);
                        }
                    }
                        break;
                    case IFVertex.Command.Curve2:
                    {
                        var xTo = vertex.x;
                        var yTo = vertex.y;
                        if (vertexSource.readVertex(vertex)) {
                            var cx1 = vertex.x;
                            var cy1 = vertex.y;
                            if (vertexSource.readVertex(vertex)) {
                                this._canvasContext.bezierCurveTo(cx1, cy1, vertex.x, vertex.y, xTo, yTo);
                            }
                        }
                    }
                        break;
                    case IFVertex.Command.Close:
                        this._canvasContext.closePath();
                        break;
                    default:
                        throw new Error("Unknown Command Type - " + vertex.command);
                }
            }
        }
    };

    /**
     * Stroke the current vertices
     * @param {*} stroke the stroke to be used which may not be unspecified and/or null. Providing
     * a number will interpret the number as a 32-Bit RGBA Integer Value.
     * @param {Number} [width] the width of the stroke in pixelMode. If not provided, defaults to 1.0 pixelMode
     * @param {Number} [cap] the line cap used for stroking, defaults to IFPaintCanvas.LineCap.Butt
     * @param {Number} [join] the line join used for stroking
     * @param {Number} [miterLimit] the miter limit used for stroking
     * @param {Number} [opacity] the total opacity to use for painting, defaults to 1.0 (full opaque)
     * @param {IFPaintCanvas.CompositeOperator|IFPaintCanvas.BlendMode} [cmpOrBlend]
     * @see IFPaintCanvas.LineCap
     * @see IFPaintCanvas.LineJoin
     * @see IFPaintCanvas.StrokeAlignment
     * @see IFPaintCanvas.CompositeOperator
     */
    IFPaintCanvas.prototype.strokeVertices = function (stroke, width, cap, join, miterLimit, opacity, cmpOrBlend) {
        this._canvasContext.strokeStyle = this._convertStyle(stroke);

        if (typeof width == "number") {
            this._canvasContext.lineWidth = width;
        } else {
            this._canvasContext.lineWidth = 1.0;
        }


        this._canvasContext.lineCap = cap ? cap : "butt";
        this._canvasContext.lineJoin = join ? join : "miter";
        this._canvasContext.miterLimit = typeof miterLimit == 'number' ? miterLimit : 10;

        this._canvasContext.globalAlpha = typeof opacity == "number" ? opacity : 1.0;

        this._canvasContext.globalCompositeOperation = cmpOrBlend ? cmpOrBlend : IFPaintCanvas.CompositeOperator.SourceOver;

        this._canvasContext.stroke();
    };

    /**
     * Fill the current vertices
     * @param {*} [fill] the fill to be used which may not be unspecified and/or null. Providing
     * a number will interpret the number as a 32-Bit RGBA Integer Value.
     * @param {Number} [opacity] the total opacity to use for painting, defaults to 1.0 (full opaque)
     * @param {IFPaintCanvas.CompositeOperator|IFPaintCanvas.BlendMode} [cmpOrBlend]
     */
    IFPaintCanvas.prototype.fillVertices = function (fill, opacity, cmpOrBlend) {
        // save fill to avoid expensive recalculation
        this._canvasContext.fillStyle = this._convertStyle(fill);

        this._canvasContext.globalAlpha = typeof opacity == "number" ? opacity : 1.0;

        this._canvasContext.globalCompositeOperation = cmpOrBlend ? cmpOrBlend : IFPaintCanvas.CompositeOperator.SourceOver;

        this._canvasContext.fill();
    };

    /**
     * Function to fill the whole canvas with a given fill.
     * @param {*} [fill] the fill, defaults to full opaque black
     */
    IFPaintCanvas.prototype.fillCanvas = function (fill) {
        var fillRect = this.getTransform(false).inverted().mapRect(new IFRect(0, 0, this.getWidth(), this.getHeight()));
        this.fillRect(fillRect.getX(), fillRect.getY(), fillRect.getWidth(), fillRect.getHeight(), fill);
    };

    /**
     * Function to fill a rectangle with fill. This does not care about
     * any special operations like composite and the such though the rectangle
     * gets transformed into the current space.
     *
     * @param {Number} x x-position of rectangle
     * @param {Number} y y-position of rectangle
     * @param {Number} width width of rectangle
     * @param {Number} height height of rectangle
     * @param {*} [fill] the fill, defaults to full opaque black
     * @param {Number} [opacity] optional opacity to use for filling
     */
    IFPaintCanvas.prototype.fillRect = function (x, y, width, height, fill, opacity) {
        fill = this._convertStyle(fill ? fill : IFColor.BLACK);
        this._canvasContext.globalCompositeOperation = IFPaintCanvas.CompositeOperator.SourceOver;
        this._canvasContext.globalAlpha = typeof opacity == "number" ? opacity : 1.0;
        this._canvasContext.fillStyle = fill;
        this._canvasContext.fillRect(x, y, width, height);
    };

    /**
     * Function to stroke a rectangle with a stroke. This does not care about
     * any special operations like composite and the such though the rectangle
     * gets transformed into the current space.
     *
     * @param {Number} x x-position of rectangle
     * @param {Number} y y-position of rectangle
     * @param {Number} width width of rectangle
     * @param {Number} height height of rectangle
     * @param {Number} [strokeWidth] the width of the stroke, defaults to 1.0
     * @param {Number} [stroke] the stroke, defaults to full opaque black
     * @param {Number} [opacity] optional opacity to use for stroking
     */
    IFPaintCanvas.prototype.strokeRect = function (x, y, width, height, strokeWidth, stroke, opacity) {
        stroke = this._convertStyle(stroke ? stroke : IFColor.BLACK);
        strokeWidth = strokeWidth || 1.0;
        this._canvasContext.globalCompositeOperation = IFPaintCanvas.CompositeOperator.SourceOver;
        this._canvasContext.globalAlpha = typeof opacity == "number" ? opacity : 1.0;
        this._canvasContext.strokeStyle = stroke;
        this._canvasContext.lineWidth = strokeWidth;
        this._canvasContext.strokeRect(x, y, width, height);
    };

    /**
     * Function to stroke a line with a color. This does not care about
     * any special operations like composite and the such though the line
     * gets transformed into the current space.
     *
     * @param {Number} x1 first x-position of line
     * @param {Number} y1 first y-position of line
     * @param {Number} x2 second x-position of line
     * @param {Number} y2 second y-position of line
     * @param {Number} [strokeWidth] the width of the stroke, defaults to 1.0
     * @param {Number} [stroke] the stroke, defaults to full opaque black
     * @version 1.0
     */
    IFPaintCanvas.prototype.strokeLine = function (x1, y1, x2, y2, strokeWidth, stroke) {
        stroke = this._convertStyle(stroke ? stroke : IFColor.BLACK);
        strokeWidth = strokeWidth || 1.0;
        this._canvasContext.globalCompositeOperation = IFPaintCanvas.CompositeOperator.SourceOver;
        this._canvasContext.globalAlpha = 1.0;
        this._canvasContext.strokeStyle = stroke;
        this._canvasContext.lineWidth = strokeWidth;
        this._canvasContext.beginPath();
        this._canvasContext.moveTo(x1, y1);
        this._canvasContext.lineTo(x2, y2);
        this._canvasContext.stroke();
    };

    /**
     * Draw an image or canvas
     * @param {Image|IFPaintCanvas} image the image or canvas to be drawn
     * @param {Number} [x] the x-position of the image, defaults to zero
     * @param {Number} [y] the y-position of the image, defaults to zero
     * @param {Boolean} [noSmooth] if set to true, will render pixelated without smoothing. Defaults to false.
     * @param {Number} [opacity] the total opacity to use for painting, defaults to 1.0 (full opaque)
     * @param {IFPaintCanvas.CompositeOperator|IFPaintCanvas.BlendMode} [cmpOrBlend]
     * @see IFPaintCanvas.CompositeOperator
     * @version 1.0
     */
    IFPaintCanvas.prototype.drawImage = function (image, x, y, noSmooth, opacity, cmpOrBlend) {
        x = x || 0;
        y = y || 0;

        image = this._convertImage(image);

        this._canvasContext.globalAlpha = typeof opacity == "number" ? opacity : 1.0;

        this._canvasContext.globalCompositeOperation = cmpOrBlend ? cmpOrBlend : IFPaintCanvas.CompositeOperator.SourceOver;

        var hadSmooth = this._getImageSmoothingEnabled();
        this._setImageSmoothingEnabled(!noSmooth);

        this._canvasContext.drawImage(image, x ? x : 0, y ? y : 0);

        this._setImageSmoothingEnabled(hadSmooth);
    };

    /**
     * This is called to modify the image data
     * @param {Function} modifier the modifier function retrieving the image data, the width and the height
     * @param {IFRect} [extents] optional extents, if not provided or null,
     * takes the whole canvas by default
     */
    IFPaintCanvas.prototype.modifyPixels = function (modifier, extents) {
        extents = extents || new IFRect(0, 0, this.getWidth(), this.getHeight());

        if (extents.isEmpty()) {
            return;
        }

        // get pixels
        var imageData = this._canvasContext.getImageData(extents.getX(), extents.getY(), extents.getWidth(), extents.getHeight());

        // run modifier
        modifier(imageData.data, extents.getWidth(), extents.getHeight());

        // push pixels back
        this._canvasContext.putImageData(imageData, extents.getX(), extents.getY());
    };

    /**
     * Blur the canvas or parts of it
     * @param {Number} radius the blur radius to be used
     * @param {IFRect} [extents] optional extents, if not provided or null,
     * takes the whole canvas by default
     */
    IFPaintCanvas.prototype.blur = function (radius, extents) {
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

    /**
     * Apply a color transformation on this canvas
     * @param {Array<Number>} multiplier the rgba multipliers
     * @param {Array<Number>} offsets the rgba offsets
     * @param {IFRect} [extents] optional extents, if not provided or null,
     * takes the whole canvas by default
     */
    IFPaintCanvas.prototype.colorTransform = function (multiplier, offsets, extents) {
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
     * Apply a color matrix on this canvas whereas the
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
     * takes the whole canvas by default
     */
    IFPaintCanvas.prototype.colorMatrix = function (matrix, extents) {
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

    /** @private */
    IFPaintCanvas.prototype._updateTransform = function () {
        // make sure to assign global transform matrix to canvas
        var matrix = this.getTransform(false).getMatrix();
        this._canvasContext.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
    };

    /**
     * @param {*} style
     * @param {*} defaultReturn
     * @returns {*}
     * @private
     */
    IFPaintCanvas.prototype._convertStyle = function (style) {
        // TODO : Support color conversion using paint configuration color profiles

        if (style instanceof CanvasPattern || style instanceof CanvasGradient) {
            return style;
        } else if (style instanceof IFColor) {
            return style.asCSSString();
        } else {
            throw new Error('Not Supported.');
        }
    };

    /** @private */
    IFPaintCanvas.prototype._convertImage = function (image) {
        if (image instanceof HTMLImageElement || image instanceof Image || image instanceof HTMLCanvasElement) {
            return image;
        } else if (image instanceof IFPaintCanvas) {
            return image._canvasContext.canvas;
        } else {
            throw new Error('Not Supported.');
        }
    };

    var _imageSmoothingProperties = ['imageSmoothingEnabled', 'webkitImageSmoothingEnabled', 'mozImageSmoothingEnabled'];

    /** @private */
    IFPaintCanvas.prototype._getImageSmoothingEnabled = function () {
        for (var i = 0; i < _imageSmoothingProperties.length; ++i) {
            if (this._canvasContext.hasOwnProperty(_imageSmoothingProperties[i])) {
                return this._canvasContext[_imageSmoothingProperties[i]];
            }
        }
        //throw new Error('No Image-Smoothing-Enabled Setting available on Canvas.');
    };

    /** @private */
    IFPaintCanvas.prototype._setImageSmoothingEnabled = function (smoothingEnabled) {
        for (var i = 0; i < _imageSmoothingProperties.length; ++i) {
            if (this._canvasContext.hasOwnProperty(_imageSmoothingProperties[i])) {
                this._canvasContext[_imageSmoothingProperties[i]] = smoothingEnabled;
                return;
            }
        }
        //throw new Error('No Image-Smoothing-Enabled Setting available on Canvas.');
    };

    _.IFPaintCanvas = IFPaintCanvas;

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
})(this);