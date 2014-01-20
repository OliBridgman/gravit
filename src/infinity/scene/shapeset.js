(function (_) {
    /**
     * An element representing a set of shapes
     * @class GXShapeSet
     * @extends GXGroup
     * @mixes GXNode.Store
     * @constructor
     */
    function GXShapeSet() {
        GXGroup.call(this);
    }

    GXNode.inheritAndMix("shapeSet", GXShapeSet, GXGroup, [GXNode.Store]);

    /** @override */
    GXShapeSet.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GXLayer || parent instanceof GXShapeSet;
    };

    _.GXShapeSet = GXShapeSet;
})(this);