(function (_) {
    /**
     * The base for items like shapes and groups
     * @class GItem
     * @extends GBlock
     * @constructor
     */
    function GItem() {
        GBlock.call(this);
    }
    GObject.inherit(GItem, GBlock);

    _.GItem = GItem;
})(this);