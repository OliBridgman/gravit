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

    /**
     * Assign an area. This will assign the area to the topmost
     * area-style on this set. If there's none, this will create one.
     * @param {GXColor|GXSwatch} fill
     */
    GXStyleSet.prototype.setArea = function (fill) {
        var targetStyle = null;
        for (var child = this.getFirstChild(); child !== null; child = child.getNext()) {
            if (child instanceof GXPaintAreaStyle) {
                targetStyle = child;
                break;
            }
        }

        if (!targetStyle) {
            targetStyle = new GXPaintAreaStyle();
            this.appendChild(targetStyle);
        }

        // TODO : REMOVE AS STRING
        targetStyle.setProperty('fill', fill && fill instanceof GXColor ? fill.asString() : fill);
    };

    /**
     * Assign a contour. This will assign the fill to the topmost
     * contour-style on this set. If there's none, this will create one.
     * @param {GXColor|GXSwatch} fill
     */
    GXStyleSet.prototype.setContour = function (fill) {
        var targetStyle = null;
        for (var child = this.getFirstChild(); child !== null; child = child.getNext()) {
            if (child instanceof GXPaintContourStyle) {
                targetStyle = child;
                break;
            }
        }

        if (!targetStyle) {
            targetStyle = new GXPaintContourStyle();
            this.appendChild(targetStyle);
        }

        // TODO : REMOVE AS STRING
        targetStyle.setProperty('fill', fill && fill instanceof GXColor ? fill.asString() : fill);
    };

    /** @override */
    GXStyleSet.prototype.paint = function (context, source) {
        // by default, simply paint our style children
        this._paintChildren(context, source);
    };

    /** @override */
    GXStyleSet.prototype.getBBox = function (source) {
        return this._getChildrenBBox(source);
    };

    /** @override */
    GXStyleSet.prototype.hitTest = function (source, location, transform, tolerance) {
        return this._hitTestChildren(source, location, transform, tolerance);
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

    /** @private */
    GXStyleSet.prototype._hitTestChildren = function (source, location, transform, tolerance) {
        for (var child = this.getLastChild(); child !== null; child = child.getPrevious()) {
            if (child instanceof GXStyle) {
                var result = child.hitTest(source, location, transform, tolerance);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    };

    /** @override */
    GXStyleSet.prototype.toString = function () {
        return "[GXStyleSet]";
    };

    _.GXStyleSet = GXStyleSet;
})(this);