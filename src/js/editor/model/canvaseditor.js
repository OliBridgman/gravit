(function (_) {
    /**
     * An editor for a canvas
     * @param {GCanvas} canvas the canvas this editor works on
     * @class GCanvasEditor
     * @extends GSceneEditor
     * @constructor
     */
    function GCanvasEditor(canvas) {
        GSceneEditor.call(this, canvas);
    };
    GObject.inherit(GCanvasEditor, GSceneEditor);
    GCanvasEditor.exports(GCanvasEditor, GCanvas);

    /** @override */
    GCanvasEditor.prototype.toString = function () {
        return "[Object GCanvasEditor]";
    };

    _.GCanvasEditor = GCanvasEditor;
})(this);