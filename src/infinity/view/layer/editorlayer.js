(function (_) {
    /**
     * A layer for rendering editors
     * @param {IFEditorView} view
     * @class IFEditorLayer
     * @extends IFViewLayer
     * @constructor
     */
    function IFEditorLayer(view) {
        IFViewLayer.call(this, view);
        view.getEditor().addEventListener(IFEditor.InvalidationRequestEvent, this._editorInvalidationRequest, this);
    }
    IFObject.inherit(IFEditorLayer, IFViewLayer);

    /** @override */
    IFEditorLayer.prototype.paint = function (context) {
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
    IFEditorLayer.prototype._editorInvalidationRequest = function (event) {
        if (event.editor) {
            var area = event.editor.invalidate(this._view.getWorldTransform(), event.args);
            if (area) {
                this.invalidate(area);
            }
        }
    };

    /** @override */
    IFEditorLayer.prototype.toString = function () {
        return "[Object IFEditorLayer]";
    };

    _.IFEditorLayer = IFEditorLayer;
})(this);