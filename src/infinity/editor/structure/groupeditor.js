(function (_) {
    /**
     * An editor for a group
     * @param {IFGroup} group the group this editor works on
     * @class IFGroupEditor
     * @extends IFBlockEditor
     * @constructor
     */
    function IFGroupEditor(group) {
        IFBlockEditor.call(this, group);
        this._flags |= IFBlockEditor.Flag.ResizeAll;
    };
    GObject.inherit(IFGroupEditor, IFBlockEditor);
    IFElementEditor.exports(IFGroupEditor, IFGroup);

    /** @override */
    IFGroupEditor.prototype.toString = function () {
        return "[Object IFGroupEditor]";
    };

    _.IFGroupEditor = IFGroupEditor;
})(this);