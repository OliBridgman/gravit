(function (_) {
    /**
     * The page tool
     * @class IFPageTool
     * @extends IFSelectTool
     * @constructor
     * @version 1.0
     */
    function IFPageTool() {
        IFSelectTool.call(this);
    };

    IFObject.inherit(IFPageTool, IFSelectTool);

    /** @override */
    IFPageTool.prototype.activate = function (view) {
        IFSelectTool.prototype.activate.call(this, view);

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
    IFPageTool.prototype.deactivate = function (view) {
        // Restore previous selection
        this._editor.restoreSelection();

        IFSelectTool.prototype.deactivate.call(this, view);
    };

    /** @override */
    IFPageTool.prototype._selectFilter = function (element) {
        // Stop on layer level as we select pages only
        if (element instanceof IFLayer) {
            return false;
        }

        return true;
    };

    /** @override */
    IFPageTool.prototype._getSelectableElement = function (element) {
        for (var p = element; p !== null; p = p.getParent()) {
            if (p instanceof IFPage) {
                return p;
            }
        }

        return null;
    };

    /** override */
    IFPageTool.prototype.toString = function () {
        return "[Object IFPageTool]";
    };

    _.IFPageTool = IFPageTool;
})(this);