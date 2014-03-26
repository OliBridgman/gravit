(function (_) {
    /**
     * A base editor for a base path
     * @param {GXPathBase} path the path this editor works on
     * @class GXPathBaseEditor
     * @extends GXShapeEditor
     * @constructor
     */
    function GXPathBaseEditor(path) {
        GXShapeEditor.call(this, path);
    };
    GObject.inherit(GXPathBaseEditor, GXShapeEditor);

    /** @override */
    GXPathBaseEditor.prototype.toString = function () {
        return "[Object GXPathBaseEditor]";
    };

    _.GXPathBaseEditor = GXPathBaseEditor;
})(this);