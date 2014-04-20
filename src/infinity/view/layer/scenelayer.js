(function (_) {
    /**
     * A layer for rendering a scene
     * @param {GXView} view
     * @class GXSceneLayer
     * @extends GXViewLayer
     * @constructor
     */
    function GXSceneLayer(view) {
        GXViewLayer.call(this, view);
        view.getScene().addEventListener(GXScene.InvalidationRequestEvent, this._sceneInvalidationRequest, this);
    }
    GObject.inherit(GXSceneLayer, GXViewLayer);

    /**
     * @type {GXPaintCanvas}
     * @private
     */
    GXSceneLayer.prototype._pixelContentCanvas = null;

    /** @override */
    GXSceneLayer.prototype.resize = function (width, height) {
        GXViewLayer.prototype.resize.call(this, width, height);

        // Resize pixel content canvas if any
        if (this._pixelContentCanvas) {
            this._pixelContentCanvas.resize(width, height);
        }
    };

    /** @override */
    GXSceneLayer.prototype.paint = function (context) {
        var scene = this._view.getScene();
        // Before any painting we need to convert our dirty matcher's
        // dirty regions back into scene coordinates in any case
        if (context.dirtyMatcher) {
            context.dirtyMatcher.transform(this._view.getViewTransform());
        }

        // Fill Canvas with pasteboard color in either single page mode or output paint mode
        //if (this._viewConfiguration.paintMode === GXScenePaintConfiguration.PaintMode.Output || targetPage) {
        //    context.canvas.fillRect(0, 0, context.canvas.getWidth(), context.canvas.getHeight(), this._viewConfiguration.pasteboardColor);
        //}

        // Paint either target page and/or pageSet before anything else
        //var oldCanvasTransform = context.canvas.setTransform(this._worldToViewTransform);
        //this._scene.getPageSet().paint(context);
        //context.canvas.setTransform(oldCanvasTransform);

        // Handle rendering in pixel mode but only if we're not at 100%
        if (this._view.getViewConfiguration().pixelMode && !gMath.isEqualEps(this._view.getZoom(), 1.0)) {
            // Create and size our pixel content canvas
            if (!this._pixelContentCanvas) {
                this._pixelContentCanvas = new GXPaintCanvas();
                this._pixelContentCanvas.resize(context.canvas.getWidth(), context.canvas.getHeight());
            }

            // Pixel content canvas always renders at scale = 100%
            var elemsBBox = this._view.getScene().getChildrenPaintBBox();
            this._pixelContentCanvas.prepare([elemsBBox]);
            var tl = elemsBBox.getSide(GRect.Side.TOP_LEFT);
            var width = elemsBBox.getWidth();
            var height = elemsBBox.getHeight();
            this._pixelContentCanvas.setTransform(new GTransform(1, 0, 0, 1, -tl.getX(), -tl.getY()));
            this._pixelContentCanvas.resize(width, height);

            // Save source canvas, exchange it with pixel content canvas and paint the scene
            var sourceCanvas = context.canvas;
            context.canvas = this._pixelContentCanvas;
            this._view.getScene().paint(context);
            this._pixelContentCanvas.finish();

            // Now render our pixel content canvas at the given scale on our source canvas
            sourceCanvas.setTransform(this._view.getWorldTransform());
            sourceCanvas.drawImage(this._pixelContentCanvas, tl.getX(), tl.getY(), true);

            // Finally reset our source canvas
            context.canvas = sourceCanvas;
        } else {
            // Render regular vectors
            this._pixelContentCanvas = null;
            // Make sure to round scrolling to avoid floating point errors
            context.canvas.setOrigin(new GPoint(Math.round(this._view._scrollX), Math.round(this._view._scrollY)));
            context.canvas.setScale(this._view._zoom);
            //context.canvas.setTransform(this._view.getWorldTransform());
            this._view.getScene().paint(context);
        }
    };

    /**
     * Event listener for scene's repaintRequest
     * @param {GXScene.InvalidationRequestEvent} event the invalidation request event
     * @private
     */
    GXSceneLayer.prototype._sceneInvalidationRequest = function (event) {
        var area = event.area;
        if (area) {
            // Ensure to map the scene area into view coordinates, first
            // TODO : How to handle view margins!?
            area = this._view.getWorldTransform().mapRect(area);
        }
        this.invalidate(area);
    };

    /** @override */
    GXSceneLayer.prototype.toString = function () {
        return "[Object GXSceneLayer]";
    };

    _.GXSceneLayer = GXSceneLayer;
})(this);