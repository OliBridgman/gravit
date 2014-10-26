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
        //view.getScene().addEventListener(GScene.InvalidationRequestEvent, this._sceneInvalidationRequest, this);
    }
    GObject.inherit(GEditorFrontStage, GStage);

    /** @override */
    GEditorFrontStage.prototype.release = function () {
        this._view.getScene().removeEventListener(GNode.AfterPropertiesChangeEvent, this._sceneAfterPropertiesChanged, this);
        this._view.getEditor().removeEventListener(GGuides.InvalidationRequestEvent, this._guidesInvalidationRequest, this);
        //this._view.getScene().removeEventListener(GScene.InvalidationRequestEvent, this._sceneInvalidationRequest, this);
        this._view.removeEventListener(GMouseEvent.Release, this._cleanGuides, this);
    };

    /** @override */
    GEditorFrontStage.prototype.paint = function (context) {
        this._view.getEditor().getGuides().paint(this._view.getWorldTransform(), context);
        //var sceneEditor = GElementEditor.getEditor(this._view.getScene());
        //if (sceneEditor) {
           // sceneEditor.paint(this._view.getWorldTransform(), context);
        //}
    };

    GEditorFrontStage.prototype._sceneAfterPropertiesChanged = function (event) {
        if (event.properties.indexOf('gridSizeX') >= 0 || event.properties.indexOf('gridSizeY') >= 0 ||
            event.properties.indexOf('gridActive') >= 0) {
            this.invalidate();
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