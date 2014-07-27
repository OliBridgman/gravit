(function (_) {
    /**
     * A stage for rendering the scene editors
     * @param {IFEditorView} view
     * @class IFEditorSceneStage
     * @extends IFStage
     * @constructor
     */
    function IFEditorSceneStage(view) {
        IFStage.call(this, view);
        view.getEditor().addEventListener(IFEditor.InvalidationRequestEvent, this._editorInvalidationRequest, this);
    }
    IFObject.inherit(IFEditorSceneStage, IFStage);

    /** @override */
    IFEditorSceneStage.prototype.paint = function (context) {
        var sceneEditor = IFElementEditor.getEditor(this._view.getScene());
        if (sceneEditor) {
            sceneEditor.paint(this._view.getWorldTransform(), context);
        }
    };

    /**
     * Event listener for editor's repaintRequest
     * @param {IFEditor.InvalidationRequestEvent} event the invalidation request event
     * @private
     */
    IFEditorSceneStage.prototype._editorInvalidationRequest = function (event) {
        if (event.editor) {
            var area = event.editor.invalidate(this._view.getWorldTransform(), event.args);
            if (area) {
                this.invalidate(area);
            }
        }
    };

    /** @override */
    IFEditorSceneStage.prototype.toString = function () {
        return "[Object IFEditorSceneStage]";
    };

    _.IFEditorSceneStage = IFEditorSceneStage;
})(this);