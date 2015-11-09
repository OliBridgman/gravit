(function (_) {
    /**
     * A canvas wrapper to paint onto
     * @class GPaintCanvas
     * @extends GObject
     * @constructor
     */
    function GPaintCanvas() {
        var canvasElement = document.createElement("canvas");
        this._canvasContext = canvasElement.getContext("2d");
    }

    GObject.inherit(GPaintCanvas, GObject);

    /**
     * @enum
     */
    GPaintCanvas.LineCap = {
        Butt: 'butt',
        Round: 'round',
        Square: 'square'
    };

    /**
     * @enum
     */
    GPaintCanvas.LineJoin = {
        Miter: 'miter',
        Bevel: 'bevel',
        Round: 'round'
    };

    /**
     * @enum
     */
    GPaintCanvas.BlendMode = {
        Normal: 'normal',
        Multiply: 'multiply',
        Screen: 'screen',
        Overlay: 'overlay',
        Darken: 'darken',
        Lighten: 'lighten',
        ColorDodge: 'color-dodge',
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
    GPaintCanvas.CompositeOperator = {
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
    GPaintCanvas.RepeatMode = {
        /** Horizontal and vertical repeat */
        Both: 'repeat',
        /** Horizontal repeat */
        Horizontal: 'repeat-x',
        /** Vertical repeat */
        Vertical: 'repeat-y',
        /** No repeat */
        None: 'no-repeat'
    };

    function createChessboardCanvas(size, backColor, foreColor) {
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

    GPaintCanvas.createChessboard = function (size, backColor, foreColor) {
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
    // GPaintCanvas Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type CanvasRenderingContext2D
     * @private
     */
    GPaintCanvas.prototype._canvasContext = null;

    /**
     * @type {GBitmap}
     * @private
     */
    GPaintCanvas.prototype._bitmap = null;

    /**
     * @type GTransform
     * @private
     */
    GPaintCanvas.prototype._transform = null;

    /**
     * @type GPoint
     * @private
     */
    GPaintCanvas.prototype._offset = null;

    /**
     * @type GPoint
     * @private
     */
    GPaintCanvas.prototype._origin = null;

    /**
     * @type Number
     * @private
     */
    GPaintCanvas.prototype._scale = null;

    /**
     * @type Array<GRect>
     * @private
     */
    GPaintCanvas.prototype._areas = null;

    /**
     * @return {Number} the width of the canvas
     * @version 1.0
     */
    GPaintCanvas.prototype.getWidth = function () {
        return this._canvasContext.canvas.width;
    };

    /**
     * @return {Number} the height of the canvas
     * @version 1.0
     */
    GPaintCanvas.prototype.getHeight = function () {
        return this._canvasContext.canvas.height;
    };

    /**
     * Returns the underlying bitmap of the canvas
     * for direct pixel manipulation. This operation
     * is cheap and doesn't allocate any memory
     * @returns {GBitmap}
     */
    GPaintCanvas.prototype.getBitmap = function () {
        if (!this._bitmap) {
            this._bitmap = new GBitmap(this);
        }
        return this._bitmap;
    };

    /**
     * Returns the contents of the canvas as a png image
     * with a resolution of 96dpi as a base64
     * encoded data url
     * @return {String}
     */
    GPaintCanvas.prototype.asPNGImage = function () {
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
    GPaintCanvas.prototype.asJPEGImage = function (quality) {
        quality = quality || 1.0;
        return this._canvasContext.canvas.toDataURL('image/jpeg', quality);
    };

    /**
     * Returns the contents of the canvas as a png image
     * with a resolution of 96dpi as an ArrayBuffer
     * @param {Function} done callback function called with the ArrayBuffer
     */
    GPaintCanvas.prototype.asPNGImageBuffer = function (done) {
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
    GPaintCanvas.prototype.asJPEGImageBuffer = function (done, quality) {
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
    GPaintCanvas.prototype.resize = function (width, height) {
        if (width != this._canvasContext.canvas.width || height != this._canvasContext.canvas.height) {
            this._canvasContext.canvas.width = width;
            this._canvasContext.canvas.height = height;
        }
    };

    /**
     * Returns the offset of this canvas
     * @returns {GPoint}
     */
    GPaintCanvas.prototype.getOffset = function () {
        return this._offset;
    };

    /**
     * Assigns the offset of this canvas
     * @param {GPoint} origin
     */
    GPaintCanvas.prototype.setOffset = function (offset) {
        this._offset = offset;
    };

    /**
     * Returns the origin of this canvas
     * @returns {GPoint}
     */
    GPaintCanvas.prototype.getOrigin = function () {
        return this._origin;
    };

    /**
     * Assigns the origin of this canvas. The origin
     * will always be premultiplied with any transformation.
     * @param {GPoint} origin
     */
    GPaintCanvas.prototype.setOrigin = function (origin) {
        if (!GPoint.equals(origin, this._origin)) {
            this._origin = origin;
            this._updateTransform();
        }
    };

    /**
     * Returns the scalation of this canvas
     * @returns {Number}
     */
    GPaintCanvas.prototype.getScale = function () {
        return this._scale;
    };

    /**
     * Assigns the scalation of this canvas. The scalation
     * will always be premultiplied with any transformation.
     * @param {GPoint} origin
     */
    GPaintCanvas.prototype.setScale = function (scale) {
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
     * @return {GTransform} current transform
     */
    GPaintCanvas.prototype.getTransform = function (local) {
        var transform = this._transform;
        if (!local) {
            var tx = this._origin.getX();
            var ty = this._origin.getY();
            var s = this._scale;
            transform = transform.multiplied(new GTransform().scaled(s, s).translated(-tx, -ty));
        }
        return transform;
    };

    /**
     * Assign a new transformation to the canvas
     * @param {GTransform} transform the new transform to assign. If this
     * is null, then the identiy transformation is used assigned instead
     * @return {GTransform} the old transform before assignment
     * @version 1.0
     */
    GPaintCanvas.prototype.setTransform = function (transform) {
        if (transform == null) {
            // Use identity transform
            transform = new GTransform();
        }
        var oldTransform = this._transform;
        this._transform = transform;
        this._updateTransform();

        return oldTransform;
    };

    /**
     * Reset the transformation to the identity transformation
     * @return {GTransform} the old transform before reset
     * @version 1.0
     */
    GPaintCanvas.prototype.resetTransform = function () {
        return this.setTransform(null);
    };

    /**
     * This needs to be called when the canvas should prepare
     * itself for painting.
     * @param {Array<GRect>} areas an array of areas to be painted.
     * those will be used for clipping any painting as well for
     * clearing those regions before anything else. Note that you need
     * to enforce to provide integer based rectangles only as internally,
     * the canvas may need to convert into integers first which may
     * result in rounding errors otherwise
     */
    GPaintCanvas.prototype.prepare = function (areas) {
        // save context before anything else
        this._canvasContext.save();

        // Reset some stuff
        this._transform = new GTransform();
        this._origin = new GPoint(0, 0);
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
    GPaintCanvas.prototype.finish = function () {
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
     * @param {GRect} extents the extents for the requested canvas
     * Defaults to false.
     * @param {Boolean} [clipDirty] whether to clip dirty areas, defaults
     * to false
     */
    GPaintCanvas.prototype.createCanvas = function (extents, clipDirty) {
        var result = new GPaintCanvas();

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

        var sceneExtents = this.getTransform(false).inverted().mapRect(new GRect(left, top, width, height));

        var finalExtents = new GRect(
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
        var topLeft = finalExtents.getSide(GRect.Side.TOP_LEFT);
        result.setOrigin(topLeft);
        result.setOffset(topLeft);
        result.setScale(this._scale);

        // Finally return our new canvas
        return result;
    };

    /**
     * Clears the whole canvas to be fully transparent
     */
    GPaintCanvas.prototype.clear = function () {
        var clearRect = this.getTransform(false).inverted().mapRect(new GRect(0, 0, this.getWidth(), this.getHeight()));
        this._canvasContext.clearRect(clearRect.getX(), clearRect.getY(), clearRect.getWidth(), clearRect.getHeight());
    };

    /**
     * Draw a canvas on this one. The canvas will be painted at it's given
     * offset position including the delta parameters. If the given canvas' scale
     * is != 100%, the canvas will draw it at 100%
     * @param {GPaintCanvas} canvas
     * @param {Number} [dx]
     * @param {Number} [dy]
     * @param {Number} [opacity]
     * @param {GPaintCanvas.CompositeOperator|GPaintCanvas.BlendMode} [cmpOrBlend]
     * @param {Boolean} [clear] if true, the underlying area the canvas will be put onto
     * will be cleared first with transparent alpha values. Defaults to false.
     */
    GPaintCanvas.prototype.drawCanvas = function (canvas, dx, dy, opacity, cmpOrBlend, clear) {
        // Make sure to reset scale when drawing canvases + make non smooth
        var hadSmooth = this._getImageSmoothingEnabled();
        var oldScale = this._scale;
        this._setImageSmoothingEnabled(oldScale < 1);
        if (canvas.getScale() !== 1.0) {
            this.setScale(1);
        }
        var oldTransform = this.resetTransform();
        var oldTranslation = oldTransform ? oldTransform.getTranslation() : new GPoint(0, 0);

        dx = dx | 0;
        dy = dy | 0;

        var offset = canvas.getOffset();
        var x = offset ? offset.getX() : 0 | 0;
        var y = offset ? offset.getY() : 0 | 0;
        var w = canvas.getWidth();
        var h = canvas.getHeight();
        var canvasScale = canvas.getScale();
        canvasScale = canvasScale ? canvasScale : 1.0;

        x += dx + oldTranslation.getX() * canvasScale;
        y += dy + oldTranslation.getY() * canvasScale;

        if (clear) {
            this._canvasContext.clearRect(x, y, w, h);
        }

        this._canvasContext.globalAlpha = typeof opacity == "number" ? opacity : 1.0;

        this._canvasContext.globalCompositeOperation = cmpOrBlend ? cmpOrBlend : GPaintCanvas.CompositeOperator.SourceOver;

        this._canvasContext.drawImage(canvas._canvasContext.canvas, 0, 0, w, h,
            x, y, w, h);

        this.setTransform(oldTransform);
        this.setScale(oldScale);
        this._setImageSmoothingEnabled(hadSmooth);
    };

    /**
     * Creates and returns a texture pattern
     *
     * @param {Image|GPaintCanvas} image the image or canvas for the texture
     * @param {GPaintCanvas.RepeatMode} [repeat] the repeat mode, defaults
     * to GPaintCanvas.RepeatMode.Both
     */
    GPaintCanvas.prototype.createTexture = function (image, repeat) {
        repeat = repeat || GPaintCanvas.RepeatMode.Both;
        image = this._convertImage(image);
        return this._canvasContext.createPattern(image, repeat);
    };

    /**
     * Creates and returns a paint for this canvas based on a pattern
     * @param {GPattern} pattern
     * @param {GRect} bbox
     * @return {{paint: *, transform: GTransform}}
     */
    GPaintCanvas.prototype.createPatternPaint = function (pattern, bbox, callback) {
        var paint = null;
        var transform = null;

        if (pattern instanceof GColor) {
            paint = pattern;
        } else if (pattern instanceof GGradient) {
            var scale = pattern.getScale();

            if (pattern instanceof GLinearGradient) {
                var angle = pattern.getAngle();
                paint = this._canvasContext.createLinearGradient(
                    0.5 - Math.cos(angle) / 2 * scale, 0.5 - Math.sin(angle) / 2 * scale,
                    0.5 + Math.cos(angle) / 2 * scale, 0.5 + Math.sin(angle) / 2 * scale);
            } else if (pattern instanceof GRadialGradient) {
                paint = this._canvasContext.createRadialGradient(0.5, 0.5, 0, 0.5, 0.5, 0.5 * scale);
            } else {
                throw new Error('Unknown pattern');
            }

            var stops = pattern.getInterpolatedStops();

            for (var i = 0; i < stops.length; ++i) {
                paint.addColorStop(stops[i].position, stops[i].color.toScreenCSS(stops[i].opacity));
            }

            if (bbox) {
                transform = new GTransform()
                    .scaled(bbox.getWidth(), bbox.getHeight())
                    .translated(bbox.getX(), bbox.getY());
            }
        } else {
            throw new Error('Unknown pattern.');
        }

        if (paint) {
            return {
                paint: paint,
                transform: transform
            };
        }
    };

    /**
     * Use a rectangle source as clipping region (adds to the current one)
     * @param {Number} x x-position of rectangle
     * @param {Number} y y-position of rectangle
     * @param {Number} width width of rectangle
     * @param {Number} height height of rectangle
     * @version 1.0
     */
    GPaintCanvas.prototype.clipRect = function (x, y, width, height) {
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
    GPaintCanvas.prototype.resetClip = function () {
        this._canvasContext.restore();
    };

    /**
     * Pushes a vertex source into this canvas overwriting any
     * previously added vertices. This will act as source for different
     * functions like clipVertices, strokeVertices and fillVertices
     * @param {GVertexSource} vertexSource the vertex source to use for clipping
     */
    GPaintCanvas.prototype.putVertices = function (vertexSource) {
        if (vertexSource.rewindVertices(0)) {
            this._canvasContext.beginPath();

            var vertex = new GVertex();
            while (vertexSource.readVertex(vertex)) {
                switch (vertex.command) {
                    case GVertex.Command.Move:
                        this._canvasContext.moveTo(vertex.x, vertex.y);
                        break;
                    case GVertex.Command.Line:
                        this._canvasContext.lineTo(vertex.x, vertex.y);
                        break;
                    case GVertex.Command.Curve:
                    {
                        var xTo = vertex.x;
                        var yTo = vertex.y;
                        if (vertexSource.readVertex(vertex)) {
                            this._canvasContext.quadraticCurveTo(vertex.x, vertex.y, xTo, yTo);
                        }
                    }
                        break;
                    case GVertex.Command.Curve2:
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
                    case GVertex.Command.Close:
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
     * @param {Number} [cap] the line cap used for stroking, defaults to GPaintCanvas.LineCap.Butt
     * @param {Number} [join] the line join used for stroking
     * @param {Number} [miterLimit] the miter limit used for stroking
     * @param {Number} [opacity] the total opacity to use for painting, defaults to 1.0 (full opaque)
     * @param {GPaintCanvas.CompositeOperator|GPaintCanvas.BlendMode} [cmpOrBlend]
     * @see GPaintCanvas.LineCap
     * @see GPaintCanvas.LineJoin
     * @see GPaintCanvas.StrokeAlignment
     * @see GPaintCanvas.CompositeOperator
     */
    GPaintCanvas.prototype.strokeVertices = function (stroke, width, cap, join, miterLimit, opacity, cmpOrBlend) {
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

        this._canvasContext.globalCompositeOperation = cmpOrBlend ? cmpOrBlend : GPaintCanvas.CompositeOperator.SourceOver;

        this._canvasContext.stroke();
    };

    /**
     * Fill the current vertices
     * @param {*} [fill] the fill to be used which may not be unspecified and/or null. Providing
     * a number will interpret the number as a 32-Bit RGBA Integer Value.
     * @param {Number} [opacity] the total opacity to use for painting, defaults to 1.0 (full opaque)
     * @param {GPaintCanvas.CompositeOperator|GPaintCanvas.BlendMode} [cmpOrBlend]
     * @param {Boolean} [evenodd] whether to use evenodd winding-rule (true) or nonzero (false, default)
     */
    GPaintCanvas.prototype.fillVertices = function (fill, opacity, cmpOrBlend, evenodd) {
        // save fill to avoid expensive recalculation
        this._canvasContext.fillStyle = this._convertStyle(fill);

        this._canvasContext.globalAlpha = typeof opacity == "number" ? opacity : 1.0;

        this._canvasContext.globalCompositeOperation = cmpOrBlend ? cmpOrBlend : GPaintCanvas.CompositeOperator.SourceOver;

        this._canvasContext.fill(!!evenodd ? 'evenodd' : 'nonzero');
    };

    /**
     * Function to fill the whole canvas with a given fill.
     * @param {*} [fill] the fill, defaults to full opaque black
     * @param {Number} [opacity] optional opacity to use for filling
     * @param {GPaintCanvas.CompositeOperator|GPaintCanvas.BlendMode} [cmpOrBlend]
     */
    GPaintCanvas.prototype.fillCanvas = function (fill, opacity, cmpOrBlend) {
        var fillRect = this.getTransform(false).inverted().mapRect(new GRect(0, 0, this.getWidth(), this.getHeight()));
        this.fillRect(fillRect.getX(), fillRect.getY(), fillRect.getWidth(), fillRect.getHeight(), fill, opacity, cmpOrBlend);
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
     * @param {GPaintCanvas.CompositeOperator|GPaintCanvas.BlendMode} [cmpOrBlend]
     */
    GPaintCanvas.prototype.fillRect = function (x, y, width, height, fill, opacity, cmpOrBlend) {
        fill = this._convertStyle(fill ? fill : GRGBColor.BLACK);
        this._canvasContext.globalCompositeOperation = cmpOrBlend ? cmpOrBlend : GPaintCanvas.CompositeOperator.SourceOver;
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
     * @param {GPaintCanvas.CompositeOperator|GPaintCanvas.BlendMode} [cmpOrBlend]
     */
    GPaintCanvas.prototype.strokeRect = function (x, y, width, height, strokeWidth, stroke, opacity, cmpOrBlend) {
        stroke = this._convertStyle(stroke ? stroke : GRGBColor.BLACK);
        strokeWidth = strokeWidth || 1.0;
        this._canvasContext.globalCompositeOperation = cmpOrBlend ? cmpOrBlend : GPaintCanvas.CompositeOperator.SourceOver;
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
    GPaintCanvas.prototype.strokeLine = function (x1, y1, x2, y2, strokeWidth, stroke) {
        stroke = this._convertStyle(stroke ? stroke : GRGBColor.BLACK);
        strokeWidth = strokeWidth || 1.0;
        this._canvasContext.globalCompositeOperation = GPaintCanvas.CompositeOperator.SourceOver;
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
     * @param {Image|GPaintCanvas} image the image or canvas to be drawn
     * @param {Number} [x] the x-position of the image, defaults to zero
     * @param {Number} [y] the y-position of the image, defaults to zero
     * @param {Boolean} [noSmooth] if set to true, will render pixelated without smoothing. Defaults to false.
     * @param {Number} [opacity] the total opacity to use for painting, defaults to 1.0 (full opaque)
     * @param {GPaintCanvas.CompositeOperator|GPaintCanvas.BlendMode} [cmpOrBlend]
     * @see GPaintCanvas.CompositeOperator
     * @version 1.0
     */
    GPaintCanvas.prototype.drawImage = function (image, x, y, noSmooth, opacity, cmpOrBlend) {
        x = x || 0;
        y = y || 0;

        image = this._convertImage(image);

        this._canvasContext.globalAlpha = typeof opacity == "number" ? opacity : 1.0;

        this._canvasContext.globalCompositeOperation = cmpOrBlend ? cmpOrBlend : GPaintCanvas.CompositeOperator.SourceOver;

        var hadSmooth = this._getImageSmoothingEnabled();
        this._setImageSmoothingEnabled(!noSmooth);

        this._canvasContext.drawImage(image, x ? x : 0, y ? y : 0);

        this._setImageSmoothingEnabled(hadSmooth);
    };

    /** @private */
    GPaintCanvas.prototype._updateTransform = function () {
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
    GPaintCanvas.prototype._convertStyle = function (style) {
        // TODO : Support color conversion using paint configuration color profiles

        if (style instanceof CanvasPattern || style instanceof CanvasGradient) {
            return style;
        } else if (style instanceof GColor) {
            return GColor.rgbToHtmlHex(style.toScreen());
        } else {
            throw new Error('Not Supported.');
        }
    };

    /** @private */
    GPaintCanvas.prototype._convertImage = function (image) {
        if (image instanceof HTMLImageElement || image instanceof Image || image instanceof HTMLCanvasElement) {
            return image;
        } else if (image instanceof GPaintCanvas) {
            return image._canvasContext.canvas;
        } else {
            throw new Error('Not Supported.');
        }
    };

    var _imageSmoothingProperties = ['imageSmoothingEnabled', 'webkitImageSmoothingEnabled', 'mozImageSmoothingEnabled'];

    /** @private */
    GPaintCanvas.prototype._getImageSmoothingEnabled = function () {
        for (var i = 0; i < _imageSmoothingProperties.length; ++i) {
            if (this._canvasContext.hasOwnProperty(_imageSmoothingProperties[i])) {
                return this._canvasContext[_imageSmoothingProperties[i]];
            }
        }
        //throw new Error('No Image-Smoothing-Enabled Setting available on Canvas.');
    };

    /** @private */
    GPaintCanvas.prototype._setImageSmoothingEnabled = function (smoothingEnabled) {
        for (var i = 0; i < _imageSmoothingProperties.length; ++i) {
            if (this._canvasContext.hasOwnProperty(_imageSmoothingProperties[i])) {
                this._canvasContext[_imageSmoothingProperties[i]] = smoothingEnabled;
                return;
            }
        }
        //throw new Error('No Image-Smoothing-Enabled Setting available on Canvas.');
    };

    _.GPaintCanvas = GPaintCanvas;
})(this);