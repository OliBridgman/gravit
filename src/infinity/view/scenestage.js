(function (_) {
    /**
     * The scene stage
     * @param {IFView} view
     * @class IFSceneStage
     * @extends IFStage
     * @constructor
     */
    function IFSceneStage(view) {
        IFStage.call(this, view);
        view.getScene().addEventListener(IFScene.InvalidationRequestEvent, this._sceneInvalidationRequest, this);
    }
    IFObject.inherit(IFSceneStage, IFStage);

    /**
     * @type {IFPaintCanvas}
     * @private
     */
    IFSceneStage.prototype._pixelContentCanvas = null;

    /** @override */
    IFSceneStage.prototype.release = function () {
        this._view.getScene().removeEventListener(IFScene.InvalidationRequestEvent, this._sceneInvalidationRequest, this);
    };

    /** @override */
    IFSceneStage.prototype.resize = function (width, height) {
        IFStage.prototype.resize.call(this, width, height);

        // Resize pixel content canvas if any
        if (this._pixelContentCanvas) {
            this._pixelContentCanvas.resize(width, height);
        }
    };

    /** @override */
    IFSceneStage.prototype.paint = function (context) {
        if (context.dirtyMatcher) {
            context.dirtyMatcher.transform(this._view.getViewTransform());
        }

        // Handle painting in pixel mode but only if we're not at 100%
        if (this._view.getViewConfiguration().pixelMode && !IFMath.isEqualEps(this._view.getZoom(), 1.0)) {
            // Create and size our pixel content canvas
            if (!this._pixelContentCanvas) {
                this._pixelContentCanvas = new IFPaintCanvas();
                this._pixelContentCanvas.resize(context.canvas.getWidth(), context.canvas.getHeight());
            }

            // Pixel content canvas always paints at scale = 100%
            var elemsBBox = this._view.getScene().getChildrenPaintBBox();
            this._pixelContentCanvas.prepare([elemsBBox]);
            var tl = elemsBBox.getSide(IFRect.Side.TOP_LEFT);
            var width = elemsBBox.getWidth();
            var height = elemsBBox.getHeight();
            this._pixelContentCanvas.setTransform(new IFTransform(1, 0, 0, 1, -tl.getX(), -tl.getY()));
            this._pixelContentCanvas.resize(width, height);

            // Save source canvas, exchange it with pixel content canvas and paint the scene
            var sourceCanvas = context.pushCanvas(this._pixelContentCanvas);
            this._view.getScene().paint(context);

            // Now paint our pixel content canvas at the given scale on our source canvas
            sourceCanvas.setTransform(this._view.getWorldTransform());
            sourceCanvas.drawImage(this._pixelContentCanvas, tl.getX(), tl.getY(), true);

            // Finally reset our source canvas
            this._pixelContentCanvas.finish();
            context.popCanvas();
        } else {
            // Paint regular vectors
            this._pixelContentCanvas = null;
            context.canvas.setOrigin(new IFPoint(this._view._scrollX, this._view._scrollY));
            context.canvas.setScale(this._view._zoom);
            this._view.getScene().paint(context);
        }
    };

    /**
     * Event listener for scene's repaintRequest
     * @param {IFScene.InvalidationRequestEvent} event the invalidation request event
     * @private
     */
    IFSceneStage.prototype._sceneInvalidationRequest = function (event) {
        var area = event.area;
        if (area) {
            // Ensure to map the scene area into view coordinates, first
            // TODO : How to handle view margins!?
            area = this._view.getWorldTransform().mapRect(area);
        }
        this.invalidate(area);
    };

    /** @override */
    IFSceneStage.prototype.toString = function () {
        return "[Object IFSceneStage]";
    };

    _.IFSceneStage = IFSceneStage;
})(this);