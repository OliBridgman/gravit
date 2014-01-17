(function (_) {
    /**
     * A base editor for an image
     * @param {GXImage} image the image this editor works on
     * @class GXImageEditor
     * @extends GXShapeEditor
     * @constructor
     */
    function GXImageEditor(image) {
        GXShapeEditor.call(this, image);
    };
    GObject.inherit(GXImageEditor, GXShapeEditor);
    GXElementEditor.exports(GXImageEditor, GXImage);

    /** @override */
    GXImageEditor.prototype.toString = function () {
        return "[Object GXImageEditor]";
    };

    _.GXImageEditor = GXImageEditor;
})(this);