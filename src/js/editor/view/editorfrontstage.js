(function (_) {
    /**
     * A stage for rendering the editor foreground
     * @param {GSceneWidget} view
     * @class GEditorFrontStage
     * @extends GStage
     * @constructor
     */
    function GEditorFrontStage(view) {
        GStage.call(this, view);
        view.getScene().addEventListener(GScene.InvalidationRequestEvent, this._sceneInvalidationRequest, this);
        view.getScene().addEventListener(GNode.AfterPropertiesChangeEvent, this._sceneAfterPropertiesChanged, this);
        view.addEventListener(GMouseEvent.Release, this._cleanGuides, this);
        view.getEditor().getGuides().addEventListener(GGuides.InvalidationRequestEvent, this._guidesInvalidationRequest, this);
    }
    GObject.inherit(GEditorFrontStage, GStage);

    GEditorFrontStage.MARGIN_OUTLINE = new GRGBColor([255, 0, 255]);

    /** @override */
    GEditorFrontStage.prototype.release = function () {
        this._view.getScene().removeEventListener(GScene.InvalidationRequestEvent, this._sceneInvalidationRequest, this);
        this._view.getScene().removeEventListener(GNode.AfterPropertiesChangeEvent, this._sceneAfterPropertiesChanged, this);
        this._view.getEditor().removeEventListener(GGuides.InvalidationRequestEvent, this._guidesInvalidationRequest, this);
        this._view.removeEventListener(GMouseEvent.Release, this._cleanGuides, this);
    };

    /** @override */
    GEditorFrontStage.prototype.paint = function (context) {
        var scene = this._view.getScene();

        if (scene instanceof GPage) {
            if (context.configuration.pageDecoration && scene.isPaintable(context)) {
                this._renderPageDecoration(context);
            }
        }

        this._view.getEditor().getGuides().paint(this._view.getWorldTransform(), context);
    };

    GEditorFrontStage.prototype._sceneAfterPropertiesChanged = function (event) {
        if (this._view.getScene() instanceof GCanvas) {
            if (event.properties.indexOf('gx') >= 0 || event.properties.indexOf('gy') >= 0 || event.properties.indexOf('ga') >= 0) {
                this.invalidate();
            }

            if (this._view.getScene() instanceof GPage) {
                // TODO : React on layout changes
            }
        }
    };

    GEditorFrontStage.prototype._guidesInvalidationRequest = function (event) {
        if (event.area) {
            var area = this._view.getWorldTransform().mapRect(event.area);
            this.invalidate(area);
        }
    };

    GEditorFrontStage.prototype._sceneInvalidationRequest = function (event) {
        if (event.area) {
            var area = this._view.getWorldTransform().mapRect(event.area);
            this.invalidate(area);
        }
    };

    GEditorFrontStage.prototype._cleanGuides = function (event) {
        this._view.getEditor().getGuides().invalidate();
    };

    /**
     * @param context
     * @private
     */
    GEditorFrontStage.prototype._renderPageDecoration = function (context) {
        var page = this._view.getScene();
        var transform = this._view.getWorldTransform();
        // Get page rectangle and transform it into world space
        var pageRect = new GRect(page.getProperty('x'), page.getProperty('y'), page.getProperty('w'), page.getProperty('h'));
        var marginRect = pageRect.expanded(-page.getProperty('ml'), -page.getProperty('mt'), -page.getProperty('mr'), -page.getProperty('mb'));
        var transformedMarginRect = transform.mapRect(marginRect).toAlignedRect();
        var mx = transformedMarginRect.getX(), my = transformedMarginRect.getY(), mw = transformedMarginRect.getWidth(), mh = transformedMarginRect.getHeight();

        // Paint margin rect
        if (!GRect.equals(pageRect, marginRect)) {
            context.canvas.strokeRect(mx + 0.5, my + 0.5, mw, mh, 1, GEditorFrontStage.MARGIN_OUTLINE);
        }
    };

    /** @override */
    GEditorFrontStage.prototype.toString = function () {
        return "[Object GEditorFrontStage]";
    };

    _.GEditorFrontStage = GEditorFrontStage;
})(this);