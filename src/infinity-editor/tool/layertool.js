(function (_) {
    /**
     * The layer tool
     * @class GLayerTool
     * @extends GSelectTool
     * @constructor
     */
    function GLayerTool() {
        GSelectTool.call(this);
    };

    GObject.inherit(GLayerTool, GSelectTool);

    /** @override */
    GLayerTool.prototype.activate = function (view) {
        GSelectTool.prototype.activate.call(this, view);

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
    GLayerTool.prototype.deactivate = function (view) {
        // Restore previous selection
        this._editor.restoreSelection();

        GSelectTool.prototype.deactivate.call(this, view);
    };

    /** @override */
    GLayerTool.prototype._getSelectableElement = function (element) {
        for (var p = element; p !== null; p = p.getParent()) {
            if (p instanceof GLayer) {
                return p;
            }
        }

        return null;
    };

    /** override */
    GLayerTool.prototype.toString = function () {
        return "[Object GLayerTool]";
    };

    _.GLayerTool = GLayerTool;
})(this);