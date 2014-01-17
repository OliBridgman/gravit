(function (_) {
    /**
     * An editor for an ellipse
     * @param {GXEllipse} ellipse the ellipse this editor works on
     * @class GXEllipseEditor
     * @extends GXArcEditor
     * @constructor
     */
    function GXEllipseEditor(ellipse) {
        GXArcEditor.call(this, ellipse);
    };
    GObject.inherit(GXEllipseEditor, GXArcEditor);
    GXElementEditor.exports(GXEllipseEditor, GXEllipse);

    /** @override */
    GXEllipseEditor.prototype.toString = function () {
        return "[Object GXEllipseEditor]";
    };

    _.GXEllipseEditor = GXEllipseEditor;
})(this);