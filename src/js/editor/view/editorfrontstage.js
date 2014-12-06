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
        view.getScene().addEventListener(GNode.AfterPropertiesChangeEvent, this._sceneAfterPropertiesChanged, this);
        view.addEventListener(GMouseEvent.Release, this._cleanGuides, this);
        view.getEditor().getGuides().addEventListener(GGuides.InvalidationRequestEvent, this._guidesInvalidationRequest, this);
    }
    GObject.inherit(GEditorFrontStage, GStage);

    /** @override */
    GEditorFrontStage.prototype.release = function () {
        this._view.getScene().removeEventListener(GNode.AfterPropertiesChangeEvent, this._sceneAfterPropertiesChanged, this);
        this._view.getEditor().removeEventListener(GGuides.InvalidationRequestEvent, this._guidesInvalidationRequest, this);
        this._view.removeEventListener(GMouseEvent.Release, this._cleanGuides, this);
    };

    /** @override */
    GEditorFrontStage.prototype.paint = function (context) {
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

    /** @override */
    GEditorFrontStage.prototype.toString = function () {
        return "[Object GEditorFrontStage]";
    };

    _.GEditorFrontStage = GEditorFrontStage;
})(this);