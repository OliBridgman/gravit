(function (_) {
    /**
     * The base for a scene editor
     * @param {GXScene} scene the scene this editor works on
     * @class GXSceneEditor
     * @extends GXElementEditor
     * @constructor
     */
    function GXSceneEditor(scene) {
        GXElementEditor.call(this, scene);
    };
    GObject.inherit(GXSceneEditor, GXElementEditor);
    GXElementEditor.exports(GXSceneEditor, GXScene);

    /** @override */
    GXSceneEditor.prototype.toString = function () {
        return "[Object GXSceneEditor]";
    };

    _.GXSceneEditor = GXSceneEditor;
})(this);