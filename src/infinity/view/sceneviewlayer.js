(function (_) {
    /**
     * A layer within a scene view
     * @param {GXPaintConfiguration} configuration
     * @class GXSceneViewLayer
     * @extends GUIWidget
     * @constructor
     */
    function GXSceneViewLayer(configuration) {
        // create our internal stuff before anything else
        this._canvas = new GXSceneViewCanvas();
        this._paintContext = new GXPaintContext();
        this._paintContext.configuration = configuration ? configuration : new GXPaintConfiguration();
        this._paintContext.canvas = this._canvas;
        this._dirtyList = new GXDirtyList();
        // call widget constructor now
        GUIWidget.apply(this, Array.prototype.splice.call(arguments, 1));

        // setup a default size
        this.resize(300, 300);
    }

    GObject.inherit(GXSceneViewLayer, GUIWidget);

    /**
     * @type {GXPaintCanvas}
     * @private
     */
    GXSceneViewLayer.prototype._canvas = null;

    /**
     * @type {GXPaintContext}
     * @private
     */
    GXSceneViewLayer.prototype._paintContext = null;

    /**
     * @type GXDirtyList
     * @private
     */
    GXSceneViewLayer.prototype._dirtyList = null;

    /**
     * Id of next frame for repainting
     * @type {Number}
     * @private
     */
    GXSceneViewLayer.prototype._repaintRequestFrameId = null;

    /**
     * Called to invalidate this paint widget or only a part of it
     * @param {GRect} [area] the area to invalidate. If null (default),
     * then this clears the whole dirty areas and requests a full repaint
     * @return {Boolean} true if an invalidation ocurred, false if not
     * @version 1.0
     */
    GXSceneViewLayer.prototype.invalidate = function (area) {
        if (!area || area.isEmpty()) {
            // reset any previous dirty areas and add the whole view area
            this._dirtyList.reset();
            area = this._dirtyList.getArea();
        }

        if (this._dirtyList.dirty(area.getX(), area.getY(), area.getWidth(), area.getHeight())) {
            // Request a repaint for the next frame
            if (this._repaintRequestFrameId == null) {
                this._repaintRequestFrameId = gPlatform.scheduleFrame(this._repaint.bind(this));
            }

            return true;
        }

        return false;
    };

    /**
     * Called whenever this widget should paint itself. Note that the canvas'
     * prepare / finish methods are automatically called and the clipping
     * region of the canvas is already set correctly.
     * @param {GXPaintContext} context the paint context to paint into
     * @private
     */
    GXSceneViewLayer.prototype.paint = function (context) {
        // NO-OP by default
    };

    /** override */
    GXSceneViewLayer.prototype.resize = function (width, height) {
        if (width != this.getWidth() || height != this.getHeight()) {
            GUIWidget.prototype.resize.call(this, width, height);
            this._canvas.resize(width, height);
            this._updateViewArea();
        }
    };

    /** @override */
    GXSceneViewLayer.prototype.focus = function () {
        if (this.isDisplayed()) {
            this._htmlElement.focus();
            return true;
        }
        return false;
    };

    /**
     * Called to update the view area
     * @version 1.0
     */
    GXSceneViewLayer.prototype._updateViewArea = function () {
        var viewArea = new GRect(0, 0, this.getWidth(), this.getHeight());
        if (!GRect.equals(this._dirtyList.getArea(), viewArea)) {
            this._dirtyList.setArea(viewArea);
            this.invalidate();
        }
    };

    /**
     * Called to repaint all dirty regions
     * @private
     */
    GXSceneViewLayer.prototype._repaint = function () {
        // Get and flush existing dirty areas
        var dirtyListMatcher = this._dirtyList.flush();
        if (dirtyListMatcher != null) {
            // Prepare our canvas with the dirty rectangles
            this._canvas.prepare(dirtyListMatcher.getDirtyRectangles());

            // Prepare our paint context
            this._paintContext.dirtyMatcher = dirtyListMatcher;

            // Call our paint routine if any
            if (this.paint) {
                this.paint.call(this, this._paintContext);
            }

            // Finish canvas
            this._canvas.finish();
        }

        // Reset any repaint request id to free for the next call
        this._repaintRequestFrameId = null;
    };

    /** @override */
    GXSceneViewLayer.prototype._createHTMLElement = function () {
        var result = this._canvas._canvasContext.canvas;
        result.style.display = "block";

        // Canvas needs manual tabindex attribute to be focusable
        result.setAttribute('tabindex', '0');

        return result;
    };

    /** @override */
    GXSceneViewLayer.prototype.toString = function () {
        return "[Object GXSceneViewLayer]";
    };

    _.GXSceneViewLayer = GXSceneViewLayer;
})(this);