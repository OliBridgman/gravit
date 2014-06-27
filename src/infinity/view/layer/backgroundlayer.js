(function (_) {
    var PAGE_CHESSBOARD_FILL = null;

    /**
     * A layer for rendering the background
     * @param {IFView} view
     * @class IFBackgroundLayer
     * @extends IFViewLayer
     * @constructor
     */
    function IFBackgroundLayer(view) {
        IFViewLayer.call(this, view);
        view.getScene().addEventListener(IFScene.InvalidationRequestEvent, this._sceneInvalidationRequest, this);
    }

    IFObject.inherit(IFBackgroundLayer, IFViewLayer);


    /** @override */
    IFBackgroundLayer.prototype.paint = function (context) {
        if (context.dirtyMatcher) {
            context.dirtyMatcher.transform(this._view.getViewTransform());
        }

        // We'll leave our canvas in view coordinates for the background
        var transform = this._view.getWorldTransform();
        for (var node = this._view.getScene().getFirstChild(); node !== null; node = node.getNext()) {
            if (node instanceof IFPage && node.isRenderable(context)) {
                this._renderPage(context, transform, node);
            }
        }
    };

    /**
     * Event listener for scene's repaintRequest
     * @param {IFScene.InvalidationRequestEvent} event the invalidation request event
     * @private
     */
    IFBackgroundLayer.prototype._sceneInvalidationRequest = function (event) {
        var area = event.area;
        if (area) {
            // Ensure to map the scene area into view coordinates, first
            // TODO : How to handle view margins!?
            area = this._view.getWorldTransform().mapRect(area);
        }
        this.invalidate(area);
    };

    IFBackgroundLayer.prototype._renderPage = function (context, transform, page) {
        // Get page rectangle and transform it into world space
        var pageRect = new GRect(page.getProperty('x'), page.getProperty('y'), page.getProperty('w'), page.getProperty('h'));
        var transformedPageRect = transform.mapRect(pageRect).toAlignedRect();
        var x = transformedPageRect.getX(), y = transformedPageRect.getY(), w = transformedPageRect.getWidth(), h = transformedPageRect.getHeight();

        // Paint page color or chessboard if transparent
        var pageColor = page.getProperty('cls');
        var fill = pageColor;

        if (!fill) {
            if (!PAGE_CHESSBOARD_FILL) {
                PAGE_CHESSBOARD_FILL = IFPaintCanvas.createChessboard(8, 'white', 'rgb(205, 205, 205)');
            }
            fill = context.canvas.createTexture(PAGE_CHESSBOARD_FILL);
        }

        context.canvas.setTransform(new GTransform(1, 0, 0, 1, x, y));
        context.canvas.fillRect(0, 0, w, h, fill);
        context.canvas.resetTransform();
    };

    /** @override */
    IFBackgroundLayer.prototype.toString = function () {
        return "[Object IFBackgroundLayer]";
    };

    _.IFBackgroundLayer = IFBackgroundLayer;
})(this);