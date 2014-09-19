(function (_) {
    var PAGE_CHESSBOARD_FILL = null;

    /**
     * A stage for rendering the editor background
     * @param {IFView} view
     * @class IFEditorBackStage
     * @extends IFStage
     * @constructor
     */
    function IFEditorBackStage(view) {
        IFStage.call(this, view);
        view.getScene().addEventListener(IFScene.InvalidationRequestEvent, this._sceneInvalidationRequest, this);
    }

    IFObject.inherit(IFEditorBackStage, IFStage);

    /** @override */
    IFEditorBackStage.prototype.release = function () {
        this._view.getScene().removeEventListener(IFScene.InvalidationRequestEvent, this._sceneInvalidationRequest, this);
    };

    /** @override */
    IFEditorBackStage.prototype.paint = function (context) {
        // View painting

        //
        // Scene painting
        //

        // Transform dirty areas into scene
        if (context.dirtyMatcher) {
            context.dirtyMatcher.transform(this._view.getViewTransform());
        }

        if (context.configuration.pagesVisible) {
            this._renderPages(context);
        }
    };

    /**
     * Event listener for scene's repaintRequest
     * @param {IFScene.InvalidationRequestEvent} event the invalidation request event
     * @private
     */
    IFEditorBackStage.prototype._sceneInvalidationRequest = function (event) {
        var area = event.area;
        if (area) {
            // Ensure to map the scene area into view coordinates, first
            // TODO : How to handle view margins!?
            area = this._view.getWorldTransform().mapRect(area);
        }
        this.invalidate(area);
    };

    /**
     * @param context
     * @private
     */
    IFEditorBackStage.prototype._renderPages = function (context) {
        // We'll leave our canvas in view coordinates for the background
        var singlePage = this._view.getScene().getProperty('singlePage');
        var transform = this._view.getWorldTransform();
        for (var node = this._view.getScene().getFirstChild(); node !== null; node = node.getNext()) {
            if (node instanceof IFPage && node.isPaintable(context) && (!singlePage || node.hasFlag(IFNode.Flag.Active))) {
                this._renderPage(context, transform, node);
            }
        }
    };

    /**
     * @param context
     * @param transform
     * @param page
     * @private
     */
    IFEditorBackStage.prototype._renderPage = function (context, transform, page) {
        // Get page rectangle and transform it into world space
        var pageRect = new IFRect(page.getProperty('x'), page.getProperty('y'), page.getProperty('w'), page.getProperty('h'));
        var marginRect = pageRect.expanded(-page.getProperty('ml'), -page.getProperty('mt'), -page.getProperty('mr'), -page.getProperty('mb'));
        var transformedPageRect = transform.mapRect(pageRect).toAlignedRect();
        var transformedMarginRect = transform.mapRect(marginRect).toAlignedRect();
        var x = transformedPageRect.getX(), y = transformedPageRect.getY(), w = transformedPageRect.getWidth(), h = transformedPageRect.getHeight();
        var mx = transformedMarginRect.getX(), my = transformedMarginRect.getY(), mw = transformedMarginRect.getWidth(), mh = transformedMarginRect.getHeight();

        // Paint page color or chessboard if transparent
        if (!PAGE_CHESSBOARD_FILL) {
            PAGE_CHESSBOARD_FILL = IFPaintCanvas.createChessboard(8, 'white', 'rgb(205, 205, 205)');
        }
        var chessFill = context.canvas.createTexture(PAGE_CHESSBOARD_FILL);

        context.canvas.setTransform(new IFTransform(1, 0, 0, 1, x, y));
        context.canvas.fillRect(0, 0, w, h, chessFill);
        var pageColor = page.getProperty('cls');
        if (pageColor) {
            context.canvas.fillRect(0, 0, w, h, pageColor);
        }
        context.canvas.resetTransform();

        // Paint margin rect
        if (!IFRect.equals(pageRect, marginRect)) {
            context.canvas.strokeRect(mx + 0.5, my + 0.5, mw, mh, 1, IFColor.MARGIN_OUTLINE);
        }
    };

    /** @override */
    IFEditorBackStage.prototype.toString = function () {
        return "[Object IFEditorBackStage]";
    };

    _.IFEditorBackStage = IFEditorBackStage;
})(this);