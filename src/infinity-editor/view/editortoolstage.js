(function (_) {
    /**
     * A stage for rendering the tools
     * @param {IFEditorView} view
     * @class IFEditorToolStage
     * @extends IFStage
     * @constructor
     */
    function IFEditorToolStage(view) {
        IFStage.call(this, view);
    }
    IFObject.inherit(IFEditorToolStage, IFStage);

    /** @override */
    IFEditorToolStage.prototype.toString = function () {
        return "[Object IFEditorToolStage]";
    };

    _.IFEditorToolStage = IFEditorToolStage;
})(this);