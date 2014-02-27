(function (_) {
    /**
     * The base for an item container
     * @class GXItemContainer
     * @extends GXItem
     * @mixes GXNode.Container
     * @constructor
     */
    function GXItemContainer() {
        GXItem.call(this);
    }
    GObject.inheritAndMix(GXItemContainer, GXItem, [GXNode.Container]);

    _.GXItemContainer = GXItemContainer;
})(this);