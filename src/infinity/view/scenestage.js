(function (_) {
    /**
     * The scene stage
     * @param {GUIView} view
     * @class GSceneStage
     * @extends GStage
     * @constructor
     */
    function GSceneStage(view) {
        GStage.call(this, view);
        view.getScene().addEventListener(GScene.InvalidationRequestEvent, this._sceneInvalidationRequest, this);
    }
    GObject.inherit(GSceneStage, GStage);

    /**
     * @type {GPaintCanvas}
     * @private
     */
    GSceneStage.prototype._pixelContentCanvas = null;

    /** @override */
    GSceneStage.prototype.release = function () {
        this._view.getScene().removeEventListener(GScene.InvalidationRequestEvent, this._sceneInvalidationRequest, this);
    };

    /** @override */
    GSceneStage.prototype.resize = function (width, height) {
        GStage.prototype.resize.call(this, width, height);

        // Resize pixel content canvas if any
        if (this._pixelContentCanvas) {
            this._pixelContentCanvas.resize(width, height);
        }
    };

    /** @override */
    GSceneStage.prototype.paint = function (context) {
        if (context.dirtyMatcher) {
            context.dirtyMatcher.transform(this._view.getViewTransform());
        }

        // Handle painting in pixel mode but only if we're not at 100%
        if (this._view.getViewConfiguration().pixelMode && !GMath.isEqualEps(this._view.getZoom(), 1.0)) {
            // Create and size our pixel content canvas
            if (!this._pixelContentCanvas) {
                this._pixelContentCanvas = new GPaintCanvas();
                this._pixelContentCanvas.resize(context.canvas.getWidth(), context.canvas.getHeight());
            }

            // Pixel content canvas always paints at scale = 100%
            var elemsBBox = this._view.getScene().getChildrenPaintBBox();
            this._pixelContentCanvas.prepare([elemsBBox]);
            var tl = elemsBBox.getSide(GRect.Side.TOP_LEFT);
            var width = elemsBBox.getWidth();
            var height = elemsBBox.getHeight();
            this._pixelContentCanvas.setTransform(new GTransform(1, 0, 0, 1, -tl.getX(), -tl.getY()));
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
            context.canvas.setOrigin(new GPoint(this._view._scrollX, this._view._scrollY));
            context.canvas.setScale(this._view._zoom);
            this._view.getScene().paint(context);
        }
    };

    /**
     * Event listener for scene's repaintRequest
     * @param {GScene.InvalidationRequestEvent} event the invalidation request event
     * @private
     */
    GSceneStage.prototype._sceneInvalidationRequest = function (event) {
        var area = event.area;
        if (area) {
            // Ensure to map the scene area into view coordinates, first
            // TODO : How to handle view margins!?
            area = this._view.getWorldTransform().mapRect(area);
        }
        this.invalidate(area);
    };

    /** @override */
    GSceneStage.prototype.toString = function () {
        return "[Object GSceneStage]";
    };

    _.GSceneStage = GSceneStage;
})(this);