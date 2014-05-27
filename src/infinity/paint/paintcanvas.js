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

    IFPaintCanvas.LineCap = {
        Butt: 0,
        Round: 1,
        Square: 2
    };

    IFPaintCanvas.LineJoin = {
        Miter: 0,
        Bevel: 1,
        Round: 2
    };

    IFPaintCanvas.CompositeOperator = {
        /**
         * Displays the source image over the destination image
         * @type {Number}
         * @version 1.0
         */
        SourceOver: 0,

        /**
         * Displays the source image on top of the destination image.
         * The part of the source image that is outside the destination image is not shown
         * @type {Number}
         * @version 1.0
         */
        SourceAtTop: 1,

        /**
         * Displays the source image in to the destination image. Only the part of the source image that is
         * INSIDE the destination image is shown, and the destination image is transparent
         * @type {Number}
         * @version 1.0
         */
        SourceIn: 2,

        /**
         * Displays the source image out of the destination image. Only the part of the source image that is
         * OUTSIDE the destination image is shown, and the destination image is transparent
         * @type {Number}
         * @version 1.0
         */
        SourceOut: 3,

        /**
         * Displays the destination image over the source image
         * @type {Number}
         * @version 1.0
         */
        DestinationOver: 10,

        /**
         * Displays the destination image on top of the source image. The part of the destination image
         * that is outside the source image is not shown
         * @type {Number}
         * @version 1.0
         */
        DestinationAtTop: 11,

        /**
         * Displays the destination image in to the source image. Only the part of the destination image that is
         * INSIDE the source image is shown, and the source image is transparent
         * @type {Number}
         * @version 1.0
         */
        DestinationIn: 12,

        /**
         * Displays the destination image out of the source image. Only the part of the destination image that is
         * OUTSIDE the source image is shown, and the source image is transparent
         * @type {Number}
         * @version 1.0
         */
        DestinationOut: 13,

        /**
         * Displays the source image + the destination image making the intersection lighter
         * @type {Number}
         * @version 1.0
         */
        Lighter: 20,

        /**
         * Displays the source image + the destination image making the intersection darker
         * @type {Number}
         * @version 1.0
         */
        Darker: 21,

        /**
         * Displays the source image. The destination image is ignored
         * @type {Number}
         * @version 1.0
         */
        Copy: 30,

        /**
         * The source image is combined by using an exclusive OR with the destination image
         * @type {Number}
         * @version 1.0
         */
        Xor: 31
    };

    /**
     * A repeat mode of patterns and gradients
     * @enum
     */
    IFPaintCanvas.RepeatMode = {
        /** Horizontal and vertical repeat */
        Both: 0,
        /** Horizontal repeat */
        Horizontal: 1,
        /** Vertical repeat */
        Vertical: 2,
        /** No repeat */
        None: 3
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
     * @type GTransform
     * @private
     */
    IFPaintCanvas.prototype._transform = null;

    /**
     * @type GPoint
     * @private
     */
    IFPaintCanvas.prototype._offset = null;

    /**
     * @type GPoint
     * @private
     */
    IFPaintCanvas.prototype._origin = null;

    /**
     * @type Number
     * @private
     */
    IFPaintCanvas.prototype._scale = null;

    /**
     * @type Array<GRect>
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
     * Resize this canvas
     * @param {Number} width the new width for the canvas
     * @param {Number} height the new height for the canvas
     * @version 1.0
     */
    IFPaintCanvas.prototype.resize = function (width, height) {
        if (width != this._width || height != this._height) {
            this._canvasContext.canvas.width = width;
            this._canvasContext.canvas.height = height;
        }
    };

    /**
     * Returns the offset of this canvas
     * @returns {GPoint}
     */
    IFPaintCanvas.prototype.getOffset = function () {
        return this._offset;
    };

    /**
     * Assigns the offset of this canvas
     * @param {GPoint} origin
     */
    IFPaintCanvas.prototype.setOffset = function (offset) {
        this._offset = offset;
    };

    /**
     * Returns the origin of this canvas
     * @returns {GPoint}
     */
    IFPaintCanvas.prototype.getOrigin = function () {
        return this._origin;
    };

    /**
     * Assigns the origin of this canvas. The origin
     * will always be premultiplied with any transformation.
     * @param {GPoint} origin
     */
    IFPaintCanvas.prototype.setOrigin = function (origin) {
        if (!GPoint.equals(origin, this._origin)) {
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
     * @param {GPoint} origin
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
     * @return {GTransform} current transform
     */
    IFPaintCanvas.prototype.getTransform = function (local) {
        var transform = this._transform;
        if (!local && (this._origin || this._scale)) {
            var tx = this._origin ? this._origin.getX() : 0;
            var ty = this._origin ? this._origin.getY() : 0;
            var s = this._scale ? this._scale : 1.0;
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
    IFPaintCanvas.prototype.setTransform = function (transform) {
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
    IFPaintCanvas.prototype.resetTransform = function () {
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
     * @version 1.0
     */
    IFPaintCanvas.prototype.prepare = function (areas) {
        // save context before anything else
        this._canvasContext.save();

        // Reset some stuff
        this._transform = new GTransform();
        this._origin = null;
        this._scale = null;
        this._areas = areas;
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
     * including the current zoom level. Note that the
     * canvas will include a transformation so that the
     * extent's x/y coordinates are equal to 0,0.
     * Make sure to call releaseCanvas as soon as you're
     * done with the canvas.
     * @param {GRect} extents the extents for the requested
     * canvas
     */
    IFPaintCanvas.prototype.createCanvas = function (extents) {
        var result = new IFPaintCanvas();

        // Resize canvas including our scalation plus a small tolerance factor
        result.resize(
            extents.getWidth() * (this._scale ? this._scale : 1),
            extents.getHeight() * (this._scale ? this._scale : 1)
        );

        // Prepare canvas with our own clipping areas but ensure to
        // transform them into the target canvas' origin, first.

        // TODO : Make sure to clip resulting canvas size and
        // correctly map and assign dirty areas below. Also make
        // sure that if resulting canvas image is clipped to assign
        // the correct offset which by then no longer is the origin

        var areas = new Array();
        if (this._areas) {
            for (var i = 0; i < this._areas.length; ++i) {
                areas.push(this._areas[i].translated(-extents.getX(), -extents.getY()));
            }
        }

        // TODO : Uncommment areas param when working
        result.prepare(null);//areas);

        // Set result's origin and scalation
        var scale = this._scale ? this._scale : 1;
        result.setOrigin(new GPoint(extents.getX() * scale, extents.getY() * scale));
        result.setOffset(new GPoint(extents.getX() * scale, extents.getY() * scale));
        result.setScale(this._scale);

        // Finally return our new canvas
        return result;
    };

    /**
     * Draw a canvas previously gathered via createCanvas.
     * Note that the canvas will be painted at it's origin.
     * @param {IFPaintCanvas} canvas
     */
    IFPaintCanvas.prototype.drawCanvas = function (canvas, dx, dy, opacity, composite) {
        if (typeof opacity == "number") {
            this._canvasContext.globalAlpha = opacity;
        } else {
            this._canvasContext.globalAlpha = 1.0;
        }

        if (typeof composite == "number") {
            this._canvasContext = this._convertComposite(composite, "source-over");
        } else {
            this._canvasContext.globalCompositeOperation = "source-over";
        }

        // Make sure to reset scale when drawing canvases + make non smooth
        var hadSmooth = this._getImageSmoothingEnabled();
        var oldScale = this._scale;
        this._setImageSmoothingEnabled(false);
        this.setScale(1);

        dx = dx | 0;
        dy = dy | 0;

        var x = canvas._offset.getX() | 0;
        var y = canvas._offset.getY() | 0;

        x+= dx;
        y+= dy;

        this._canvasContext.drawImage(canvas._canvasContext.canvas, x, y);

        this.setScale(oldScale);
        this._setImageSmoothingEnabled(hadSmooth);
    };

    /**
     * Releases a previously requested canvas
     * @param {IFPaintCanvas} canvas
     */
    IFPaintCanvas.prototype.releaseCanvas = function (canvas) {
        canvas.finish();
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
     * Use a rectangle source as clipping region (adds to the current one)
     * @param {Number} x x-position of rectangle
     * @param {Number} y y-position of rectangle
     * @param {Number} width width of rectangle
     * @param {Number} height height of rectangle
     * @version 1.0
     */
    IFPaintCanvas.prototype.clipRect = function (x, y, width, height) {
        // Too bad we need to use expensive save() / restore() on canvas for now for clipping :(
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
     * @param {Number} [composite] the composite operator to use for drawing, defaults to IFPaintCanvas.CompositeOperator.SourceOver
     * @see IFPaintCanvas.LineCap
     * @see IFPaintCanvas.LineJoin
     * @see IFPaintCanvas.StrokeAlignment
     * @see IFPaintCanvas.CompositeOperator
     */
    IFPaintCanvas.prototype.strokeVertices = function (stroke, width, cap, join, miterLimit, opacity, composite) {
        this._canvasContext.strokeStyle = this._convertStyle(stroke);

        if (typeof width == "number") {
            this._canvasContext.lineWidth = width;
        } else {
            this._canvasContext.lineWidth = 1.0;
        }

        if (typeof cap == "number") {
            switch (cap) {
                case IFPaintCanvas.LineCap.Butt:
                    this._canvasContext.lineCap = "butt";
                    break;
                case IFPaintCanvas.LineCap.Round:
                    this._canvasContext.lineCap = "round";
                    break;
                case IFPaintCanvas.LineCap.Square:
                    this._canvasContext.lineCap = "square";
                    break;
            }
        } else {
            this._canvasContext.lineCap = "butt";
        }

        if (typeof join == "number") {
            switch (join) {
                case IFPaintCanvas.LineJoin.Bevel:
                    this._canvasContext.lineJoin = "bevel";
                    break;
                case IFPaintCanvas.LineJoin.Round:
                    this._canvasContext.lineJoin = "round";
                    break;
                default:
                    this._canvasContext.lineJoin = "miter";
                    this._canvasContext.miterLimit = typeof miterLimit == 'number' ? miterLimit : 10;
                    break;
            }
        } else {
            this._canvasContext.lineJoin = "miter";
            this._canvasContext.miterLimit = 10;
        }

        if (typeof opacity == "number") {
            this._canvasContext.globalAlpha = opacity;
        } else {
            this._canvasContext.globalAlpha = 1.0;
        }

        if (typeof composite == "number") {
            this._canvasContext.globalCompositeOperation = this._convertComposite(composite, "source-over");
        } else {
            this._canvasContext.globalCompositeOperation = "source-over";
        }

        this._canvasContext.stroke();
    };

    /**
     * Fill the current vertices
     * @param {*} [fill] the fill to be used which may not be unspecified and/or null. Providing
     * a number will interpret the number as a 32-Bit RGBA Integer Value.
     * @param {Number} [opacity] the total opacity to use for painting, defaults to 1.0 (full opaque)
     * @param {Number} [composite] the composite operator to use for drawing, defaults to IFPaintCanvas.CompositeOperator.SourceOver
     * @see IFPaintCanvas.CompositeOperator
     */
    IFPaintCanvas.prototype.fillVertices = function (fill, opacity, composite) {
        // save fill to avoid expensive recalculation
        this._canvasContext.fillStyle = this._convertStyle(fill);

        if (typeof opacity == "number") {
            this._canvasContext.globalAlpha = opacity;
        } else {
            this._canvasContext.globalAlpha = 1.0;
        }

        if (typeof composite == "number") {
            this._canvasContext.globalCompositeOperation = this._convertComposite(composite, "source-over");
        } else {
            this._canvasContext.globalCompositeOperation = "source-over";
        }

        this._canvasContext.fill();
    };

    /**
     * Function to fill a rectangle with a color. This does not care about
     * any special operations like composite and the such though the rectangle
     * gets transformed into the current space.
     *
     * @param {Number} x x-position of rectangle
     * @param {Number} y y-position of rectangle
     * @param {Number} width width of rectangle
     * @param {Number} height height of rectangle
     * @param {*} [fill] the fill, defaults to full opaque black
     * @version 1.0
     */
    IFPaintCanvas.prototype.fillRect = function (x, y, width, height, fill) {
        fill = this._convertStyle(fill ? fill : gColor.build(0, 0, 0));
        this._canvasContext.fillStyle = fill;
        this._canvasContext.fillRect(x, y, width, height);
    };

    /**
     * Function to stroke a rectangle with a color. This does not care about
     * any special operations like composite and the such though the rectangle
     * gets transformed into the current space.
     *
     * @param {Number} x x-position of rectangle
     * @param {Number} y y-position of rectangle
     * @param {Number} width width of rectangle
     * @param {Number} height height of rectangle
     * @param {Number} [strokeWidth] the width of the stroke, defaults to 1.0
     * @param {Number} [fill] the stroke, defaults to full opaque black
     * @version 1.0
     */
    IFPaintCanvas.prototype.strokeRect = function (x, y, width, height, strokeWidth, stroke) {
        stroke = this._convertStyle(stroke ? stroke : gColor.build(0, 0, 0));
        strokeWidth = strokeWidth || 1.0;
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
        stroke = this._convertStyle(stroke ? stroke : gColor.build(0, 0, 0));
        strokeWidth = strokeWidth || 1.0;
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
     * @param {Number} [composite] the composite operator to use for drawing, defaults to IFPaintCanvas.CompositeOperator.SourceOver
     * @see IFPaintCanvas.CompositeOperator
     * @version 1.0
     */
    IFPaintCanvas.prototype.drawImage = function (image, x, y, noSmooth, opacity, composite) {
        x = x || 0;
        y = y || 0;

        image = this._convertImage(image);


        if (typeof opacity == "number") {
            this._canvasContext.globalAlpha = opacity;
        } else {
            this._canvasContext.globalAlpha = 1.0;
        }

        if (typeof composite == "number") {
            this._canvasContext = this._convertComposite(composite, "source-over");
        } else {
            this._canvasContext.globalCompositeOperation = "source-over";
        }

        var hadSmooth = this._getImageSmoothingEnabled();
        this._setImageSmoothingEnabled(!noSmooth);

        this._canvasContext.drawImage(image, x ? x : 0, y ? y : 0);

        this._setImageSmoothingEnabled(hadSmooth);
    };

    /**
     * Runs a filter on this canvas
     * @param {String} filterName name of the registered filter
     * @param {GRect} [extents] for the filter, if null, takes the whole canvas
     * @param {Array<*>} [args] optional arguments passed to the filter
     */
    IFPaintCanvas.prototype.runFilter = function (filterName, extents, args) {
        var filter = _.ifFilter[filterName];
        if (filter) {
            extents = extents || new GRect(0, 0, this.getWidth(), this.getHeight());

            if (extents.isEmpty()) {
                return;
            }

            // get pixels
            var imageData = this._canvasContext.getImageData(extents.getX(), extents.getY(), extents.getWidth(), extents.getHeight());
            var arguments = [imageData.data, extents.getWidth(), extents.getHeight()];

            if (args) {
                arguments = arguments.concat(args);
            }

            // run filter
            filter.apply(filter, arguments);

            // push pixels back
            this._canvasContext.putImageData(imageData, extents.getX(), extents.getY());
        }
    };

    /** @private */
    IFPaintCanvas.prototype._updateTransform = function () {
        // make sure to assign global transform matrix to canvas
        var matrix = this.getTransform(false).getMatrix();
        this._canvasContext.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
    };

    /**
     * @param {Number} composite
     * @param {String} defaultReturn
     * @returns {String}
     * @private
     */
    IFPaintCanvas.prototype._convertComposite = function (composite, defaultReturn) {
        if (typeof composite == "number") {
            switch (composite) {
                case IFPaintCanvas.CompositeOperator.SourceOver:
                    return "source-over";
                case IFPaintCanvas.CompositeOperator.SourceAtTop:
                    return "source-atop";
                case IFPaintCanvas.CompositeOperator.SourceIn:
                    return "source-in";
                case IFPaintCanvas.CompositeOperator.SourceOut:
                    return "source-out";
                case IFPaintCanvas.CompositeOperator.DestinationOver:
                    return "destination-over";
                case IFPaintCanvas.CompositeOperator.DestinationAtTop:
                    return "destination-atop";
                case IFPaintCanvas.CompositeOperator.DestinationIn:
                    return "destination-in";
                case IFPaintCanvas.CompositeOperator.DestinationOut:
                    return "destination-out";
                case IFPaintCanvas.CompositeOperator.Lighter:
                    return "lighter";
                case IFPaintCanvas.CompositeOperator.Darker:
                    return "darker";
                case IFPaintCanvas.CompositeOperator.Copy:
                    return "copy";
                case IFPaintCanvas.CompositeOperator.Xor:
                    return "xor";
                default:
                    break;
            }
        }
        return defaultReturn;
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
        } else if (typeof style === 'number') {
            return gColor.toCSS(style);
        } else {
            throw new Error('Not Supported.');
        }
    };

    /** @private */
    IFPaintCanvas.prototype._convertImage = function (image) {
        if (image instanceof Image) {
            return image;
        } else if (image instanceof IFPaintCanvas) {
            return image._canvasContext.canvas;
        } else {
            throw new Error('Not Supported.');
        }
    };

    /** @private */
    IFPaintCanvas.prototype._convertRepeat = function (repeat) {
        switch (repeat) {
            case IFPaintCanvas.RepeatMode.Both:
                return "repeat";
            case IFPaintCanvas.RepeatMode.Horizontal:
                return "repeat-x";
            case IFPaintCanvas.RepeatMode.Vertical:
                return "repeat-y";
            case IFPaintCanvas.RepeatMode.None:
                return "no-repeat";
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
})(this);