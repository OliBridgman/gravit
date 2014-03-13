(function (_) {
    /**
     * A base editor for a base path
     * @param {GXPathBase} path the path this editor works on
     * @param {Boolean} supportBBoxResize - if true, enable resizing by BBox corner points movement
     * @class GXPathBaseEditor
     * @extends GXShapeEditor
     * @constructor
     */
    function GXPathBaseEditor(path, supportBBoxResize) {
        GXShapeEditor.call(this, path, supportBBoxResize);
    };
    GObject.inherit(GXPathBaseEditor, GXShapeEditor);

    /** @override */
    GXPathBaseEditor.prototype.toString = function () {
        return "[Object GXPathBaseEditor]";
    };

    _.GXPathBaseEditor = GXPathBaseEditor;
})(this);