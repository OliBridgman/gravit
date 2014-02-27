(function (_) {
    /**
     * The base for an item compound
     * @class GXItemCompound
     * @extends GXItemContainer
     * @constructor
     */
    function GXItemCompound() {
        GXItemContainer.call(this);
    }
    GObject.inherit(GXItemCompound, GXItemContainer);

    _.GXItemCompound = GXItemCompound;
})(this);