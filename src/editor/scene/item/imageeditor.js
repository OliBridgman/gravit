(function (_) {
    /**
     * A base editor for an image
     * @param {GImage} image the image this editor works on
     * @class GImageEditor
     * @extends GShapeEditor
     * @constructor
     */
    function GImageEditor(image) {
        GShapeEditor.call(this, image);
        this._flags |= GBlockEditor.Flag.ResizeAll;
    };
    GObject.inherit(GImageEditor, GShapeEditor);
    GElementEditor.exports(GImageEditor, GImage);

    /** @override */
    GImageEditor.prototype.initialSetup = function () {
        // NO-OP as image shouldn't gain a default style
    };

    /** @override */
    GImageEditor.prototype.toString = function () {
        return "[Object GImageEditor]";
    };

    _.GImageEditor = GImageEditor;
})(this);