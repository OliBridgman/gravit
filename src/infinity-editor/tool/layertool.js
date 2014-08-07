(function (_) {
    /**
     * The layer tool
     * @class IFLayerTool
     * @extends IFSelectTool
     * @constructor
     */
    function IFLayerTool() {
        IFSelectTool.call(this);
    };

    IFObject.inherit(IFLayerTool, IFSelectTool);

    /** @override */
    IFLayerTool.prototype.activate = function (view) {
        IFTool.prototype.activate.call(this, view);

        // Store current selection & select active layer
        this._editor.storeSelection();

        var activeLayer = this._scene.getActiveLayer();
        if (activeLayer) {
            this._editor.updateSelection(false, [activeLayer])
        } else {
            this._editor.clearSelection();
        }
    };

    /** @override */
    IFLayerTool.prototype.deactivate = function (view) {
        // Restore previous selection
        this._editor.restoreSelection();

        IFTool.prototype.deactivate.call(this, view);
    };

    /** @override */
    IFLayerTool.prototype._getSelectableElement = function (element) {
        for (var p = element; p !== null; p = p.getParent()) {
            if (p instanceof IFLayer) {
                return p;
            }
        }

        return null;
    };

    /** override */
    IFLayerTool.prototype.toString = function () {
        return "[Object IFLayerTool]";
    };

    _.IFLayerTool = IFLayerTool;
})(this);