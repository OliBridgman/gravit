(function (_) {
    /**
     * A layer within a scene view
     * @param {GXView} view
     * @class GXViewLayer
     * @constructor
     */
    function GXViewLayer(view) {
        this._view = view;
        this._canvas = new GXPaintCanvas();
        this._paintContext = new GXPaintContext();
        this._paintContext.configuration = view.getViewConfiguration() ?
            view.getViewConfiguration() : new GXPaintConfiguration();
        this._paintContext.canvas = this._canvas;
        this._dirtyList = new GXDirtyList();
    }

    /**
     * @type {GXView}
     * @private
     */
    GXViewLayer.prototype._view = null;

    /**
     * @type {GXPaintCanvas}
     * @private
     */
    GXViewLayer.prototype._canvas = null;

    /**
     * @type {GXPaintContext}
     * @private
     */
    GXViewLayer.prototype._paintContext = null;

    /**
     * @type GXDirtyList
     * @private
     */
    GXViewLayer.prototype._dirtyList = null;

    /**
     * Id of next frame for repainting
     * @type {Number}
     * @private
     */
    GXViewLayer.prototype._repaintRequestFrameId = null;

    /**
     * Called to invalidate this paint widget or only a part of it
     * @param {GRect} [area] the area to invalidate. If null (default),
     * then this clears the whole dirty areas and requests a full repaint
     * @return {Boolean} true if an invalidation ocurred, false if not
     * @version 1.0
     */
    GXViewLayer.prototype.invalidate = function (area) {
        if (!area || area.isEmpty()) {
            // reset any previous dirty areas and add the whole view area
            this._dirtyList.reset();
            area = this._dirtyList.getArea();
        }

        if (area && this._dirtyList.dirty(area.getX(), area.getY(), area.getWidth(), area.getHeight())) {
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
    GXViewLayer.prototype.paint = function (context) {
        // NO-OP by default
    };

    /**
     * Called to resize this layer
     * @param {Number} width
     * @param {Number} height
     */
    GXViewLayer.prototype.resize = function (width, height) {
        this._canvas.resize(width, height);
        this.updateViewArea();
    };

    /**
     * Called to update the view area
     */
    GXViewLayer.prototype.updateViewArea = function () {
        var viewArea = this._view.getViewBox(true);
        if (!GRect.equals(this._dirtyList.getArea(), viewArea)) {
            this._dirtyList.setArea(viewArea);
            this.invalidate();
        }
    };

    /**
     * Called to repaint all dirty regions
     * @private
     */
    GXViewLayer.prototype._repaint = function () {
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
    GXViewLayer.prototype.toString = function () {
        return "[Object GXViewLayer]";
    };

    _.GXViewLayer = GXViewLayer;
})(this);