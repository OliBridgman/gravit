(function (_) {
    /**
     * The base for a scene editor
     * @param {IFScene} scene the scene this editor works on
     * @class IFSceneEditor
     * @extends IFElementEditor
     * @constructor
     */
    function IFSceneEditor(scene) {
        IFElementEditor.call(this, scene);
    };
    IFObject.inherit(IFSceneEditor, IFElementEditor);
    IFElementEditor.exports(IFSceneEditor, IFScene);

    /** @override */
    IFSceneEditor.prototype.toString = function () {
        return "[Object IFSceneEditor]";
    };

    _.IFSceneEditor = IFSceneEditor;
})(this);