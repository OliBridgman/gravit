(function (_) {
    var PAGE_CHESSBOARD_FILL = null;

    /**
     * A stage for rendering the editor background
     * @param {GSceneWidget} view
     * @class GEditorBackStage
     * @extends GStage
     * @constructor
     */
    function GEditorBackStage(view) {
        GStage.call(this, view);
        view.getScene().addEventListener(GScene.InvalidationRequestEvent, this._sceneInvalidationRequest, this);
    }

    GObject.inherit(GEditorBackStage, GStage);

    /** @override */
    GEditorBackStage.prototype.release = function () {
        this._view.getScene().removeEventListener(GScene.InvalidationRequestEvent, this._sceneInvalidationRequest, this);
    };

    /** @override */
    GEditorBackStage.prototype.paint = function (context) {
        var scene = this._view.getScene();

        if (scene instanceof GPage) {
            if (context.configuration.pageDecoration && scene.isPaintable(context)) {
                this._renderPageDecoration(context);
            }
        }
    };

    /**
     * Event listener for scene's repaintRequest
     * @param {GScene.InvalidationRequestEvent} event the invalidation request event
     * @private
     */
    GEditorBackStage.prototype._sceneInvalidationRequest = function (event) {
        var area = event.area;
        if (area) {
            area = this._view.getWorldTransform().mapRect(area);
        }
        this.invalidate(area);
    };

    /**
     * @param context
     * @private
     */
    GEditorBackStage.prototype._renderPageDecoration = function (context) {
        var page = this._view.getScene();
        var transform = this._view.getWorldTransform();
        // Get page rectangle and transform it into world space
        var pageRect = new GRect(page.getProperty('x'), page.getProperty('y'), page.getProperty('w'), page.getProperty('h'));
        var transformedPageRect = transform.mapRect(pageRect).toAlignedRect();
        var x = transformedPageRect.getX(), y = transformedPageRect.getY(), w = transformedPageRect.getWidth(), h = transformedPageRect.getHeight();

        // Paint page color or chessboard if transparent
        if (!PAGE_CHESSBOARD_FILL) {
            PAGE_CHESSBOARD_FILL = GPaintCanvas.createChessboard(8, 'white', 'rgb(205, 205, 205)');
        }
        var chessFill = context.canvas.createTexture(PAGE_CHESSBOARD_FILL);

        context.canvas.setTransform(new GTransform(1, 0, 0, 1, x, y));
        context.canvas.fillRect(0, 0, w, h, chessFill);
        context.canvas.resetTransform();
    };

    /** @override */
    GEditorBackStage.prototype.toString = function () {
        return "[Object GEditorBackStage]";
    };

    _.GEditorBackStage = GEditorBackStage;
})(this);