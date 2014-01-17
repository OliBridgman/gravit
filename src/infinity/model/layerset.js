(function (_) {
    /**
     * An element representing a set of layers
     * @class GXLayerSet
     * @extends GXLayerBase
     * @constructor
     */
    function GXLayerSet() {
        GXLayerBase.call(this);
    }

    GXNode.inherit("layerSet", GXLayerSet, GXLayerBase);

    /** @override */
    GXLayerSet.prototype.validateInsertion = function (parent, reference) {
        // Layerset can only be appended to the scene and
        // only if the scene does not yet contain a layerSet
        // or to another layerSet
        return parent instanceof GXLayerSet || (parent instanceof GXScene && !parent.getLayerSet());
    };

    /** @override */
    GXLayerSet.prototype.validateRemoval = function () {
        // A layerSet can only be removed from another layerSet
        // and not from the document which is the root
        return this._parent instanceof GXLayerSet;
    };

    _.GXLayerSet = GXLayerSet;
})(this);