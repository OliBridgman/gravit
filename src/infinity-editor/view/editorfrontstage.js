(function (_) {
    /**
     * A stage for rendering the editor foreground
     * @param {IFView} view
     * @class IFEditorFrontStage
     * @extends IFStage
     * @constructor
     */
    function IFEditorFrontStage(view) {
        IFStage.call(this, view);
        view.getScene().addEventListener(IFNode.AfterPropertiesChangeEvent, this._sceneAfterPropertiesChanged, this);
        view.addEventListener(GUIMouseEvent.Release, this._cleanGuides, this);
        view.getEditor().getGuides().addEventListener(IFGuides.InvalidationRequestEvent, this._guidesInvalidationRequest, this);
        //view.getScene().addEventListener(IFScene.InvalidationRequestEvent, this._sceneInvalidationRequest, this);
    }
    IFObject.inherit(IFEditorFrontStage, IFStage);

    /** @override */
    IFEditorFrontStage.prototype.release = function () {
        this._view.getScene().removeEventListener(IFNode.AfterPropertiesChangeEvent, this._sceneAfterPropertiesChanged, this);
        this._view.getEditor().removeEventListener(IFGuides.InvalidationRequestEvent, this._guidesInvalidationRequest, this);
        //this._view.getScene().removeEventListener(IFScene.InvalidationRequestEvent, this._sceneInvalidationRequest, this);
        this._view.removeEventListener(GUIMouseEvent.Release, this._cleanGuides, this);
    };

    /** @override */
    IFEditorFrontStage.prototype.paint = function (context) {
        this._view.getEditor().getGuides().paint(this._view.getWorldTransform(), context);
        //var sceneEditor = IFElementEditor.getEditor(this._view.getScene());
        //if (sceneEditor) {
           // sceneEditor.paint(this._view.getWorldTransform(), context);
        //}
    };

    IFEditorFrontStage.prototype._sceneAfterPropertiesChanged = function (event) {
        if (event.properties.indexOf('gridSizeX') >= 0 || event.properties.indexOf('gridSizeY') >= 0 ||
            event.properties.indexOf('gridActive') >= 0) {
            this.invalidate();
        }
    };

    IFEditorFrontStage.prototype._guidesInvalidationRequest = function (event) {
        if (event.area) {
            var area = this._view.getWorldTransform().mapRect(event.area);
            this.invalidate(area);
        }
    };

    IFEditorFrontStage.prototype._sceneInvalidationRequest = function (event) {
        if (event.area) {
            var area = this._view.getWorldTransform().mapRect(event.area);
            this.invalidate(area);
        }
    };

    IFEditorFrontStage.prototype._cleanGuides = function (event) {
        this._view.getEditor().getGuides().invalidate();
    };

    /** @override */
    IFEditorFrontStage.prototype.toString = function () {
        return "[Object IFEditorFrontStage]";
    };

    _.IFEditorFrontStage = IFEditorFrontStage;
})(this);