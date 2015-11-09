(function (_) {
    /**
     * A base editor for a base path
     * @param {GPathBase} path the path this editor works on
     * @class GPathBaseEditor
     * @extends GShapeEditor
     * @constructor
     */
    function GPathBaseEditor(path) {
        GShapeEditor.call(this, path);
    };
    GObject.inherit(GPathBaseEditor, GShapeEditor);

    /** @override */
    GPathBaseEditor.prototype.toString = function () {
        return "[Object GPathBaseEditor]";
    };

    _.GPathBaseEditor = GPathBaseEditor;
})(this);