(function (_) {

    /**
     * A set of styles
     * @class IFStyleSet
     * @extends IFStyle
     * @constructor
     */
    function IFStyleSet() {
        IFStyle.call(this);
    }

    IFNode.inheritAndMix('styleSet', IFStyleSet, IFStyle);

    /** @override */
    IFStyleSet.prototype.getBBox = function (source) {
        var result = source;
        for (var node = this.getFirstChild(); node != null; node = node.getNext()) {
            if (node instanceof IFStyle) {
                var childBBox = node.getBBox(source);
                if (childBBox && !childBBox.isEmpty()) {
                    result = result.united(childBBox);
                }
            }
        }
        return result;
    };

    /** @override */
    IFStyleSet.prototype.toString = function () {
        return "[IFStyleSet]";
    };

    _.IFStyleSet = IFStyleSet;
})(this);