(function (_) {
    /**
     * GXEditorView is a widget to render and edit a scene
     * @param {GXEditor} [editor] the editor this view is bound too, defaults to null
     * @class GXEditorView
     * @extends GXSceneView
     * @constructor
     * @version 1.0
     */
    function GXEditorView(editor) {
        var args = Array.prototype.slice.call(arguments);
        args[0] = null;
        GXSceneView.apply(this, args);

        if (editor) {
            this.setEditor(editor);
        }

        this._editorConfiguration = new GXEditorPaintConfiguration();

        // Add our editor layer
        this.addLayer(GXEditorView.Layer.Editor, this._editorConfiguration)
            .paint = this._paintEditorLayer.bind(this);

        // Add our tool layer

        // Add our editor layer
        this.addLayer(GXEditorView.Layer.Tool, null);
    }

    GObject.inherit(GXEditorView, GXSceneView);

    /**
     * Enumeration of known layers within an editor view.
     * @enum
     * @version 1.0
     */
    GXEditorView.Layer = {
        /**
         * The editor layer for painting editors
         * @type {Number}
         * @version 1.0
         */
        Editor: 100,

        /**
         * The tool layer for painting tools
         * @type {Number}
         * @version 1.0
         */
        Tool: 101
    };

    /**
     * @type {GXEditorPaintConfiguration}
     * @private
     */
    GXEditorView.prototype._editorConfiguration = null;

    /**
     * Return the editor this view is rendering
     * @returns {GXEditor}
     */
    GXEditorView.prototype.getEditor = function () {
        return this._scene;
    };

    /**
     * Assign the editor this view is rendering
     * @param {editor} editor
     */
    GXEditorView.prototype.setEditor = function (editor) {
        if (editor != this._editor) {
            if (this._editor) {
                this._editor.removeEventListener(GXEditor.InvalidationRequestEvent, this._editorInvalidationRequest);
            }

            this._editor = editor;

            if (this._editor) {
                this._editor.addEventListener(GXEditor.InvalidationRequestEvent, this._editorInvalidationRequest, this);
            }

            this.setScene(this._editor.getScene());
        }
    };

    /**
     * Event listener for scene's repaintRequest
     * @param {GXEditor.InvalidationRequestEvent} event the invalidation request event
     * @private
     */
    GXEditorView.prototype._editorInvalidationRequest = function (event) {
        if (event.editor) {
            var area = event.editor.invalidate(this._worldToViewTransform, event.args);
            if (area) {
                this._layerMap[GXEditorView.Layer.Editor].invalidate(area);
            }
        }
    };

    /**
     * Paint the editor layer
     * @param {GXPaintContext} context
     * @private
     */
    GXEditorView.prototype._paintEditorLayer = function (context) {
        // TODO : Paint transform box, markers, etc.

        // Paint our editors
        var sceneEditor = GXElementEditor.getEditor(this.getScene());
        if (sceneEditor) {
            sceneEditor.paint(this.getWorldTransform(), context);
        }
    };

    /** @override */
    GXEditorView.prototype.toString = function () {
        return "[Object GXEditorView]";
    };

    _.GXEditorView = GXEditorView;

})(this);