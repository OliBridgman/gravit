(function (_) {

    /**
     * A set of styles
     * @class GXStyleSet
     * @extends GXStyle
     * @mixes GXNode.Container
     * @constructor
     */
    function GXStyleSet() {
        GXStyle.call(this);
    }

    GXNode.inheritAndMix("styleSet", GXStyleSet, GXStyle, [GXNode.Container]);

    /** @override */
    GXStyleSet.prototype.paint = function (context, source) {
        // by default, simply paint our style children
        this._paintChildren(context, source);
    };

    /** @override */
    GXStyleSet.prototype.getBBox = function (source) {
        return this._getChildrenBBox(source);
    };

    /** @private */
    GXStyleSet.prototype._paintChildren = function (context, source) {
        for (var child = this.getFirstChild(); child !== null; child = child.getNext()) {
            if (child instanceof GXStyle) {
                child.paint(context, source);
            }
        }
    };

    /** @private */
    GXStyleSet.prototype._getChildrenBBox = function (source) {
        var result = source;
        for (var node = this.getFirstChild(); node != null; node = node.getNext()) {
            if (node instanceof GXStyle) {
                var childBBox = node.getBBox(source);
                if (childBBox && !childBBox.isEmpty()) {
                    result = result.united(childBBox);
                }
            }
        }
        return result;
    };

    /** @override */
    GXStyleSet.prototype.toString = function () {
        return "[GXStyleSet]";
    };

    _.GXStyleSet = GXStyleSet;
})(this);