(function (_) {
    /**
     * The base for a groups
     * @class IFGroup
     * @extends IFBlock
     * @mixes IFNode.Container
     * @mixes IFElement.Transform
     * @mixes IFElement.Stylable
     * @constructor
     */
    function IFGroup() {
        IFItem.call(this);
    }
    IFNode.inheritAndMix('group', IFGroup, IFBlock, [IFNode.Container, IFElement.Transform, IFElement.Stylable]);

    /** @override */
    IFGroup.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFLayer || parent instanceof IFGroup;
    };

    /** @override */
    IFGroup.prototype._paintStyleContent = function (context, contentPaintBBox, styleLayers, orderedEffects, effectCanvas) {
        this._paintChildren(context);
    };

    /** @override */
    IFGroup.prototype._detailHitTest = function (location, transform, tolerance, force) {
        return new IFElement.HitResultInfo(this);
    };

    _.IFGroup = IFGroup;
})(this);