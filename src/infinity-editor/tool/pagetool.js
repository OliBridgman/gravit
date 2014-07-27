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