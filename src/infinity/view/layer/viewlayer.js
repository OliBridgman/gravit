(function (_) {
    /**
     * A layer within a scene view
     * @param {IFView} view
     * @class IFViewLayer
     * @constructor
     */
    function IFViewLayer(view) {
        this._view = view;
        this._canvas = new IFPaintCanvas();
        this._paintContext = new IFPaintContext();
        this._paintContext.configuration = view.getViewConfiguration() ?
            view.getViewConfiguration() : new IFPaintConfiguration();
        this._paintContext.canvas = this._canvas;
        this._dirtyList = new IFDirtyList();
    }

    /**
     * @type {IFView}
     * @private
     */
    IFViewLayer.prototype._view = null;

    /**
     * @type {IFPaintCanvas}
     * @private
     */
    IFViewLayer.prototype._canvas = null;

    /**
     * @type {IFPaintContext}
     * @private
     */
    IFViewLayer.prototype._paintContext = null;

    /**
     * @type IFDirtyList
     * @private
     */
    IFViewLayer.prototype._dirtyList = null;

    /**
     * Id of next frame for repainting
     * @type {Number}
     * @private
     */
    IFViewLayer.prototype._repaintRequestFrameId = null;

    IFViewLayer.prototype.show = function () {
        this._canvas._canvasContext.canvas.style.visibility = '';
    };

    IFViewLayer.prototype.hide = function () {
        this._canvas._canvasContext.canvas.style.visibility = 'hidden';
    };

    /**
     * Called to invalidate this paint widget or only a part of it
     * @param {IFRect} [area] the area to invalidate. If null (default),
     * then this clears the whole dirty areas and requests a full repaint
     * @return {Boolean} true if an invalidation ocurred, false if not
     * @version 1.0
     */
    IFViewLayer.prototype.invalidate = function (area) {
        if (!area || area.isEmpty()) {
            // reset any previous dirty areas and add the whole view area
            this._dirtyList.reset();
            area = this._dirtyList.getArea();
        }

        if (area && this._dirtyList.dirty(area.getX(), area.getY(), area.getWidth(), area.getHeight())) {
            // Request a repaint for the next frame
            if (this._repaintRequestFrameId == null) {
                this._repaintRequestFrameId = ifPlatform.scheduleFrame(this._repaint.bind(this));
            }

            return true;
        }

        return false;
    };

    /**
     * Called whenever this widget should paint itself. Note that the canvas'
     * prepare / finish methods are automatically called and the clipping
     * region of the canvas is already set correctly.
     * @param {IFPaintContext} context the paint context to paint into
     * @private
     */
    IFViewLayer.prototype.paint = function (context) {
        // NO-OP by default
    };

    /**
     * Called to resize this layer
     * @param {Number} width
     * @param {Number} height
     */
    IFViewLayer.prototype.resize = function (width, height) {
        this._canvas.resize(width, height);
        this.updateViewArea();
    };

    /**
     * Called to update the view area
     */
    IFViewLayer.prototype.updateViewArea = function () {
        var viewArea = new IFRect(0, 0, this._view.getWidth(), this._view.getHeight());
        if (!IFRect.equals(this._dirtyList.getArea(), viewArea)) {
            this._dirtyList.setArea(viewArea);
            this.invalidate();
        }
    };

    /**
     * Called to repaint all dirty regions
     * @private
     */
    IFViewLayer.prototype._repaint = function () {
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
    IFViewLayer.prototype.toString = function () {
        return "[Object IFViewLayer]";
    };

    _.IFViewLayer = IFViewLayer;
})(this);