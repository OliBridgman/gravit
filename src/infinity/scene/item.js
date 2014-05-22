(function (_) {
    /**
     * The base for items like shapes and groups
     * @class IFItem
     * @extends IFBlock
     * @constructor
     */
    function IFItem() {
        IFBlock.call(this);
    }
    GObject.inherit(IFItem, IFBlock);

    _.IFItem = IFItem;
})(this);