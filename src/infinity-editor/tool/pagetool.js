(function (_) {
    /**
     * The page tool
     * @class GPageTool
     * @extends GSelectTool
     * @constructor
     * @version 1.0
     */
    function GPageTool() {
        GSelectTool.call(this);
    };

    GObject.inherit(GPageTool, GSelectTool);

    /** @override */
    GPageTool.prototype.activate = function (view) {
        GSelectTool.prototype.activate.call(this, view);

        // Store current selection & select active page
        this._editor.storeSelection();

        var activePage = this._scene.getActivePage();
        if (activePage) {
            this._editor.updateSelection(false, [activePage])
        } else {
            this._editor.clearSelection();
        }
    };

    /** @override */
    GPageTool.prototype.deactivate = function (view) {
        // Restore previous selection
        this._editor.restoreSelection();

        GSelectTool.prototype.deactivate.call(this, view);
    };

    /** @override */
    GPageTool.prototype._selectFilter = function (element) {
        // Stop on layer level as we select pages only
        if (element instanceof GLayer) {
            return false;
        }

        return true;
    };

    /** @override */
    GPageTool.prototype._getSelectableElement = function (element) {
        for (var p = element; p !== null; p = p.getParent()) {
            if (p instanceof GPage) {
                return p;
            }
        }

        return null;
    };

    /** override */
    GPageTool.prototype.toString = function () {
        return "[Object GPageTool]";
    };

    _.GPageTool = GPageTool;
})(this);