(function (_) {
    /**
     * An editor for a shapeSet
     * @param {IFGroup} set the set this editor works on
     * @class IFGroupEditor
     * @extends IFBlockEditor
     * @constructor
     */
    function IFGroupEditor(set) {
        IFBlockEditor.call(this, set);
        this._flags |= IFBlockEditor.Flag.ResizeAll;
    };
    IFObject.inherit(IFGroupEditor, IFBlockEditor);
    IFElementEditor.exports(IFGroupEditor, IFGroup);

    /** @override */
    IFGroupEditor.prototype._prePaint = function (transform, context) {
        if (this.hasFlag(IFElementEditor.Flag.Selected) || this.hasFlag(IFElementEditor.Flag.Highlighted)) {
            this._paintBBoxOutline(transform, context);
        }
        IFBlockEditor.prototype._prePaint.call(this, transform, context);
    };

    /** @override */
    IFGroupEditor.prototype.toString = function () {
        return "[Object IFGroupEditor]";
    };

    _.IFGroupEditor = IFGroupEditor;
})(this);