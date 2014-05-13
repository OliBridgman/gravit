(function (_) {
    /**
     * An editor for a text
     * @param {GXText} text the text this editor works on
     * @class GXTextEditor
     * @extends GXShapeEditor
     * @constructor
     */
    function GXTextEditor(rectangle) {
        GXShapeEditor.call(this, rectangle);
        this._flags |= GXBlockEditor.Flag.ResizeAll;
    };
    GObject.inherit(GXTextEditor, GXShapeEditor);
    GXElementEditor.exports(GXTextEditor, GXText);

    /** @override */
    GXTextEditor.prototype.handleInsert = function (fillColor, strokeColor) {
        // Text will always retrieve a black fill if there's no other fill
        GXShapeEditor.prototype.handleInsert.call(this, fillColor ? fillColor : new GXColor(GXColor.Type.Black), null);
    };

    /** @override */
    GXTextEditor.prototype.toString = function () {
        return "[Object GXTextEditor]";
    };

    _.GXTextEditor = GXTextEditor;
})(this);