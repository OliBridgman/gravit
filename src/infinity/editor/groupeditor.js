(function (_) {
    /**
     * An editor for a group
     * @param {GXGroup} group the group this editor works on
     * @class GXGroupEditor
     * @extends GXBlockEditor
     * @constructor
     */
    function GXGroupEditor(group) {
        GXBlockEditor.call(this, group);
        this._flags |= GXBlockEditor.Flag.ResizeAll;
    };
    GObject.inherit(GXGroupEditor, GXBlockEditor);
    GXElementEditor.exports(GXGroupEditor, GXGroup);

    /** @override */
    GXGroupEditor.prototype.toString = function () {
        return "[Object GXGroupEditor]";
    };

    _.GXGroupEditor = GXGroupEditor;
})(this);