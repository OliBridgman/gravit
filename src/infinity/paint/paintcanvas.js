(function (_) {
    /**
     * A canvas is an abstract class representing a canvas to paint on
     * @class GXPaintCanvas
     * @extends GObject
     * @constructor
     * @version 1.0
     */
    function GXPaintCanvas() {
    }

    GObject.inherit(GXPaintCanvas, GObject);

    GXPaintCanvas.LineCap = {
        Butt: 0,
        Round: 1,
        Square: 2
    };

    GXPaintCanvas.LineJoin = {
        Miter: 0,
        Bevel: 1,
        Round: 2
    };

    GXPaintCanvas.CompositeOperator = {
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
    GXPaintCanvas.RepeatMode = {
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
    // GXPaintCanvas Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type Number
     * @private
     */
    GXPaintCanvas.prototype._width = 0;

    /**
     * @type Number
     * @private
     */
    GXPaintCanvas.prototype._height = 0;

    /**
     * @return {Number} the width of the canvas
     * @version 1.0
     */
    GXPaintCanvas.prototype.getWidth = function () {
        return this._width;
    };

    /**
     * @return {Number} the height of the canvas
     * @version 1.0
     */
    GXPaintCanvas.prototype.getHeight = function () {
        return this._height;
    };

    /**
     * Resize this canvas
     * @param {Number} width the new width for the canvas
     * @param {Number} height the new height for the canvas
     * @version 1.0
     */
    GXPaintCanvas.prototype.resize = function (width, height) {
        this._width = width;
        this._height = height;
    };

    /**
     * Return the current transform of the canvas, may never be null
     * @return {GTransform} current transform
     * @version 1.0
     */
    GXPaintCanvas.prototype.getTransform = function () {
        throw new Error("Not Supported");
    };

    /**
     * Assign a new transformation to the canvas
     * @param {GTransform} transform the new transform to assign. If this
     * is null, then the identiy transformation is used assigned instead
     * @return {GTransform} the old transform before assignment
     * @version 1.0
     */
    GXPaintCanvas.prototype.setTransform = function (transform) {
        throw new Error("Not Supported");
    };

    /**
     * Reset the transformation to the identity transformation
     * @return {GTransform} the old transform before reset
     * @version 1.0
     */
    GXPaintCanvas.prototype.resetTransform = function () {
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
    GXPaintCanvas.prototype.prepare = function (areas) {
        throw new Error("Not Supported");
    };

    /**
     * This needs to be called when the canvas is finished
     * and should restore.
     * @version 1.0
     */
    GXPaintCanvas.prototype.finish = function () {
        throw new Error("Not Supported");
    };

    /**
     * Create a new canvas of this type
     * @return {GXPaintCanvas} a new canvas of this type
     */
    GXPaintCanvas.prototype.createCanvas = function () {
        throw new Error("Not Supported");
    };

    /**
     * Create a pattern out of an image or canvas
     * @param {Image|GXPaintCanvas} image the image or canvas to be used as pattern
     * @param {GXPaintCanvas.RepeatMode} repeat the repeat mode to be used
     * @return {*} a pattern specific to this canvas-type
     */
    GXPaintCanvas.prototype.createPattern = function (image, repeat) {
        throw new Error("Not Supported");
    };

    /**
     * Creates and returns a linear gradient pattern
     * @param {Number} x1 horizontal start position
     * @param {Number} y1 vertical start position
     * @param {Number} x2 horizontal end position
     * @param {Number} y2 vertical end position
     * @param {GXGradient} gradient the gradient to be used
     * @return {*} a pattern specific to this canvas-type
     */
    GXPaintCanvas.prototype.createLinearGradient = function (x1, y1, x2, y2, gradient) {
        throw new Error("Not Supported");
    };

    /**
     * Pushes a vertex source into this canvas overwriting any
     * previously added vertices. This will act as source for different
     * functions like clipVertices, strokeVertices and fillVertices
     * @param {GXVertexSource} vertexSource the vertex source to use for clipping
     */
    GXPaintCanvas.prototype.putVertices = function (vertexSource) {
        throw new Error("Not Supported");
    };

    /**
     * Use current vertices as clipping region (adds to the current clipping region)
     */
    GXPaintCanvas.prototype.clipVertices = function () {
        throw new Error("Not Supported");
    };

    /**
     * Use a rectangle source as clipping region (adds to the current one)
     * @param {Number} x x-position of rectangle
     * @param {Number} y y-position of rectangle
     * @param {Number} width width of rectangle
     * @param {Number} height height of rectangle
     * @version 1.0
     */
    GXPaintCanvas.prototype.clipRect = function (x, y, width, height) {
        throw new Error("Not Supported");
    };

    /**
     * Reset the last assigned clipping region
     * @version 1.0
     */
    GXPaintCanvas.prototype.resetClip = function () {
        throw new Error("Not Supported");
    };

    /**
     * Stroke the current vertices
     * @param {*} stroke the stroke to be used which may not be unspecified and/or null. Providing
     * a number will interpret the number as a 32-Bit RGBA Integer Value.
     * @param {Number} [width] the width of the stroke in pixelMode. If not provided, defaults to 1.0 pixelMode
     * @param {Number} [cap] the line cap used for stroking, defaults to GXPaintCanvas.LineCap.Butt
     * @param {Number} [join] the line join used for stroking
     * @param {Number} [miterLimit] the miter limit used for stroking
     * @param {Number} [opacity] the total opacity to use for painting, defaults to 1.0 (full opaque)
     * @param {Number} [composite] the composite operator to use for drawing, defaults to GXPaintCanvas.CompositeOperator.SourceOver
     * @see GXPaintCanvas.LineCap
     * @see GXPaintCanvas.LineJoin
     * @see GXPaintCanvas.StrokeAlignment
     * @see GXPaintCanvas.CompositeOperator
     */
    GXPaintCanvas.prototype.strokeVertices = function (stroke, width, cap, join, miterLimit, opacity, composite) {
        throw new Error("Not Supported");
    };

    /**
     * Fill the current vertices
     * @param {*} [fill] the fill to be used which may not be unspecified and/or null. Providing
     * a number will interpret the number as a 32-Bit RGBA Integer Value.
     * @param {Number} [opacity] the total opacity to use for painting, defaults to 1.0 (full opaque)
     * @param {Number} [composite] the composite operator to use for drawing, defaults to GXPaintCanvas.CompositeOperator.SourceOver
     * @see GXPaintCanvas.CompositeOperator
     */
    GXPaintCanvas.prototype.fillVertices = function (fill, opacity, composite) {
        throw new Error("Not Supported");
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
    GXPaintCanvas.prototype.fillRect = function (x, y, width, height, fill) {
        throw new Error("Not Supported");
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
    GXPaintCanvas.prototype.strokeRect = function (x, y, width, height, strokeWidth, stroke) {
        throw new Error("Not Supported");
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
    GXPaintCanvas.prototype.strokeLine = function (x1, y1, x2, y2, strokeWidth, stroke) {
        throw new Error("Not Supported");
    };

    /**
     * Draw an image or canvas
     * @param {Image|GXPaintCanvas} image the image or canvas to be drawn
     * @param {Number} [x] the x-position of the image, defaults to zero
     * @param {Number} [y] the y-position of the image, defaults to zero
     * @param {Boolean} [noSmooth] if set to true, will render pixelated without smoothing. Defaults to false.
     * @param {Number} [opacity] the total opacity to use for painting, defaults to 1.0 (full opaque)
     * @param {Number} [composite] the composite operator to use for drawing, defaults to GXPaintCanvas.CompositeOperator.SourceOver
     * @see GXPaintCanvas.CompositeOperator
     * @version 1.0
     */
    GXPaintCanvas.prototype.drawImage = function (image, x, y, noSmooth, opacity, composite) {
        throw new Error("Not Supported");
    };

    _.GXPaintCanvas = GXPaintCanvas;
})(this);