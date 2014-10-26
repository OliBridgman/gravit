(function (_) {
    /**
     * A stage for rendering the scene editors
     * @param {GEditorWidget} view
     * @class GEditorSceneStage
     * @extends GStage
     * @constructor
     */
    function GEditorSceneStage(view) {
        GStage.call(this, view);
        view.getEditor().addEventListener(GEditor.InvalidationRequestEvent, this._editorInvalidationRequest, this);
    }
    GObject.inherit(GEditorSceneStage, GStage);

    /** @override */
    GEditorSceneStage.prototype.release = function () {
        this._view.getEditor().removeEventListener(GEditor.InvalidationRequestEvent, this._editorInvalidationRequest, this);
    };

    /** @override */
    GEditorSceneStage.prototype.paint = function (context) {
        var sceneEditor = GElementEditor.getEditor(this._view.getScene());
        if (sceneEditor) {
            sceneEditor.paint(this._view.getWorldTransform(), context);
        }
    };

    /**
     * Event listener for editor's repaintRequest
     * @param {GEditor.InvalidationRequestEvent} event the invalidation request event
     * @private
     */
    GEditorSceneStage.prototype._editorInvalidationRequest = function (event) {
        if (event.editor) {
            var area = event.editor.invalidate(this._view.getWorldTransform(), event.args);
            if (area) {
                this.invalidate(area);
            }
        }
    };

    /** @override */
    GEditorSceneStage.prototype.toString = function () {
        return "[Object GEditorSceneStage]";
    };

    _.GEditorSceneStage = GEditorSceneStage;
})(this);