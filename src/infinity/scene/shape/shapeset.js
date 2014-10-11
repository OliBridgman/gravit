(function (_) {
    /**
     * The base for a groups
     * @class IFShapeSet
     * @extends IFItem
     * @mixes IFNode.Container
     * @mixes IFElement.Transform
     * @mixes IFElement.Stylable
     * @constructor
     */
    function IFShapeSet() {
        IFItem.call(this);
    }
    IFNode.inheritAndMix('shapeSet', IFShapeSet, IFItem, [IFNode.Container, IFElement.Transform, IFElement.Stylable]);

    /** @override */
    IFShapeSet.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFLayer || parent instanceof IFShapeSet;
    };

    /** @override */
    IFShapeSet.prototype._paintStyleContent = function (context, contentPaintBBox, styleLayers, orderedEffects, effectCanvas) {
        this._paintChildren(context);
    };

    /** @override */
    IFShapeSet.prototype._detailHitTest = function (location, transform, tolerance, force) {
        return new IFElement.HitResultInfo(this);
    };

    _.IFShapeSet = IFShapeSet;
})(this);