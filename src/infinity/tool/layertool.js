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