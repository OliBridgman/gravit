(function (_) {
    /**
     * The transform tool
     * @class GTransformTool
     * @extends GSelectTool
     * @constructor
     * @version 1.0
     */
    function GTransformTool() {
        GSelectTool.call(this);
    };

    GObject.inherit(GTransformTool, GSelectTool);

    /** @override */
    GTransformTool.prototype.activate = function (view) {
        GSelectTool.prototype.activate.call(this, view);

        // If there's no available selection, select the pointer tool instead
        var selection = view.getEditor().getSelection();
        if (!selection || selection.length === 0) {
            this._manager.activateTool(GPointerTool);
        } else {
            this._openTransformBox();
        }
    };

    /** @override */
    GTransformTool.prototype._mouseDblClick = function () {
        // no-op, just disallow any actions on double click as this would
        // do things we don't want in transform mode
    };

    /** override */
    GTransformTool.prototype.toString = function () {
        return "[Object GTransformTool]";
    };

    _.GTransformTool = GTransformTool;
})(this);