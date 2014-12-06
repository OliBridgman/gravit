(function (_) {
    /**
     * The base for a groups
     * @class GGroup
     * @extends GItem
     * @mixes GNode.Container
     * @mixes GElement.Transform
     * @mixes GElement.Stylable
     * @constructor
     */
    function GGroup() {
        GItem.call(this);
    }
    GNode.inheritAndMix('group', GGroup, GItem, [GNode.Container, GElement.Transform, GElement.Stylable]);

    /** @override */
    GGroup.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GLayer || parent instanceof GGroup || parent instanceof GScene;
    };

    /** @override */
    GGroup.prototype._paintStyleContent = function (context, contentPaintBBox, styleLayers, orderedEffects, effectCanvas) {
        this._paintChildren(context);
    };

    /** @override */
    GGroup.prototype._detailHitTest = function (location, transform, tolerance, force) {
        return new GElement.HitResultInfo(this);
    };

    _.GGroup = GGroup;
})(this);