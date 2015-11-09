(function (_) {
    /**
     * An editor for a slice
     * @param {GSlice} slice the slice this editor works on
     * @class GSliceEditor
     * @extends GBlockEditor
     * @constructor
     */
    function GSliceEditor(slice) {
        GBlockEditor.call(this, slice);
        this._flags |= GBlockEditor.Flag.ResizeAll;
    };
    GObject.inherit(GSliceEditor, GBlockEditor);
    GElementEditor.exports(GSliceEditor, GSlice);

    /** @override */
    GSliceEditor.prototype._prePaint = function (transform, context) {
        if (this.hasFlag(GElementEditor.Flag.Selected) || this.hasFlag(GElementEditor.Flag.Highlighted)) {
            this._paintBBoxOutline(transform, context);
        }
        GBlockEditor.prototype._prePaint.call(this, transform, context);
    };

    /** @override */
    GSliceEditor.prototype.toString = function () {
        return "[Object GSliceEditor]";
    };

    _.GSliceEditor = GSliceEditor;
})(this);