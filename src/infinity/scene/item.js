(function (_) {
    /**
     * The base for items like shapes and groups
     * @class GXItem
     * @extends GXBlock
     * @constructor
     */
    function GXItem() {
        GXBlock.call(this);
    }
    GObject.inherit(GXItem, GXBlock);

    _.GXItem = GXItem;
})(this);