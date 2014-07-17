(function (_) {
    /**
     * An element representing a set of layers
     * @class IFLayerSet
     * @extends IFLayerBlock
     * @constructor
     */
    function IFLayerSet() {
        IFLayerBlock.call(this);
    }

    IFNode.inherit("layerSet", IFLayerSet, IFLayerBlock);

    /** @override */
    IFLayerSet.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFLayerSet || parent instanceof IFPage;
    };

    _.IFLayerSet = IFLayerSet;
})(this);