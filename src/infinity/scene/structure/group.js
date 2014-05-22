(function (_) {
    /**
     * The base for a groups
     * @class IFGroup
     * @extends IFItem
     * @mixes IFNode.Container
     * @mixes IFElement.Transform
     * @constructor
     */
    function IFGroup() {
        IFItem.call(this);
    }
    IFNode.inheritAndMix('group', IFGroup, IFItem, [IFNode.Container, IFElement.Transform]);

    /** @override */
    IFGroup.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFBlock;
    };

    _.IFGroup = IFGroup;
})(this);