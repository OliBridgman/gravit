(function (_) {
    /**
     * A stage for rendering the tools
     * @param {GEditorWidget} view
     * @class GEditorToolStage
     * @extends GStage
     * @constructor
     */
    function GEditorToolStage(view) {
        GStage.call(this, view);
    }
    GObject.inherit(GEditorToolStage, GStage);

    /** @override */
    GEditorToolStage.prototype.toString = function () {
        return "[Object GEditorToolStage]";
    };

    _.GEditorToolStage = GEditorToolStage;
})(this);