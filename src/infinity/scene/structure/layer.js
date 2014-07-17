(function (_) {
    /**
     * An element representing a layer
     * @class IFLayer
     * @extends IFLayerBlock
     * @constructor
     */
    function IFLayer() {
        IFLayerBlock.call(this);
    }

    IFNode.inherit("layer", IFLayer, IFLayerBlock);

    /** @override */
    IFLayer.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFLayerSet || parent instanceof IFPage;
    };

    _.IFLayer = IFLayer;
})(this);