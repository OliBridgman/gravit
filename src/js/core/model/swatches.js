(function (_) {
    /**
     * A collection of swatches
     * @class GSwatches
     * @extends GNode
     * @mixes GNode.Container
     * @mixes GNode.Store
     * @mixes GEventTarget
     * @constructor
     */
    function GSwatches(workspace) {
        GNode.call(this);
        this._setWorkspace(workspace);
    }

    GNode.inheritAndMix("swatches", GSwatches, GNode, [GNode.Container, GNode.Store, GEventTarget]);

    _.GSwatches = GSwatches;
})(this);