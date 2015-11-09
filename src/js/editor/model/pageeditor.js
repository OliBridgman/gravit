(function (_) {
    /**
     * An editor for a page
     * @param {GPage} page the page this editor works on
     * @class GPageEditor
     * @extends GSceneEditor
     * @constructor
     */
    function GPageEditor(page) {
        GSceneEditor.call(this, page);
    };
    GObject.inherit(GPageEditor, GSceneEditor);
    GPageEditor.exports(GPageEditor, GPage);

    /** @override */
    GPageEditor.prototype.toString = function () {
        return "[Object GPageEditor]";
    };

    _.GPageEditor = GPageEditor;
})(this);