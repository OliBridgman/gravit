(function (_) {

    /**
     * A set of styles appended to elements
     * @class IFStyleSet
     * @extends IFNode
     * @mixes IFNode.Container
     * @mixes IFNode.Store
     * @constructor
     */
    function IFStyleSet() {
        IFNode.call(this);
    }

    IFObject.inheritAndMix(IFStyleSet, IFNode, [IFNode.Container, IFNode.Store]);

    /**
     * Returns the bounding box of the styleSet which is
     * the union of all visible style's bboxes
     * @param {IFRect} source the source bbox
     * @returns {IFRect}
     */
    IFStyleSet.prototype.getBBox = function (source) {
        var result = source;
        for (var node = this.getFirstChild(); node != null; node = node.getNext()) {
            if (node instanceof IFStyle && node.getProperty('vs') === true) {
                var childBBox = node.getBBox(source);
                if (childBBox && !childBBox.isEmpty()) {
                    result = result.united(childBBox);
                }
            }
        }
        return result;
    };

    /**
     * Makes a hit-test on each visible style until a hit was found.
     * Goes from top-to-bottom.
     * @parma {IFVertexSource} source
     * @param {IFPoint} location
     * @param {IFTransform} transform
     * @param {Number} tolerance
     * @returns {IFStyle.HitResult}
     * @see IFStyle.hitTest
     */
    IFStyleSet.prototype.hitTest = function (source, location, transform, tolerance) {
        for (var node = this.getLastChild(); node !== null; node = node.getPrevious()) {
            if (node instanceof IFStyle && node.getProperty('vs') === true) {
                var result = node.hitTest(source, location, transform, tolerance);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    };

    /** @override */
    IFStyleSet.prototype._handleChange = function (change, args) {
        var parent = this.getParent();
        if (parent) {
            if (change == IFNode._Change.BeforeChildInsert || change === IFNode._Change.BeforeChildRemove) {
                if (args instanceof IFStyle) {
                    parent._notifyChange(IFElement._Change.PrepareGeometryUpdate);
                }
            } else if (change == IFNode._Change.AfterChildInsert || change === IFNode._Change.AfterChildRemove) {
                if (args instanceof IFStyle) {
                    parent._notifyChange(IFElement._Change.FinishGeometryUpdate);
                }
            }
        }

        IFNode.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFStyleSet.prototype.toString = function () {
        return "[IFStyleSet]";
    };

    _.IFStyleSet = IFStyleSet;
})(this);