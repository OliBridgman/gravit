(function (_) {
    /**
     * A layer for rendering editors
     * @param {GXEditorView} view
     * @class GXEditorLayer
     * @extends GXViewLayer
     * @constructor
     */
    function GXEditorLayer(view) {
        GXViewLayer.call(this, view);
        view.getEditor().addEventListener(GXEditor.InvalidationRequestEvent, this._editorInvalidationRequest, this);
    }
    GObject.inherit(GXEditorLayer, GXViewLayer);

    /** @override */
    GXEditorLayer.prototype.paint = function (context) {
        var sceneEditor = GXElementEditor.getEditor(this._view.getScene());
        if (sceneEditor) {
            sceneEditor.paint(this._view.getWorldTransform(), context);
        }
    };

    /**
     * Event listener for editor's repaintRequest
     * @param {GXEditor.InvalidationRequestEvent} event the invalidation request event
     * @private
     */
    GXEditorLayer.prototype._editorInvalidationRequest = function (event) {
        if (event.editor) {
            var area = event.editor.invalidate(this._view.getWorldTransform(), event.args);
            if (area) {
                this.invalidate(area);
            }
        }
    };

    /** @override */
    GXEditorLayer.prototype.toString = function () {
        return "[Object GXEditorLayer]";
    };

    _.GXEditorLayer = GXEditorLayer;
})(this);