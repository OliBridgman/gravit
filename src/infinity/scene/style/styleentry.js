(function (_) {

    /**
     * A base style entry class
     * @class IFStyleEntry
     * @extends IFNode
     * @mixes IFNode.Store
     * @constructor
     */
    function IFStyleEntry() {
    }

    IFObject.inheritAndMix(IFStyleEntry, IFNode, [IFNode.Store]);

    /**
     * If the style extends the paint area it should
     * return the padding extensions here: [left, top, right, bottom]
     * @returns {Array<Number>}
     */
    IFStyleEntry.prototype.getPadding = function () {
        return null;
    };

    /** @override */
    IFStyleEntry.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFStyle;
    };

    /** @override */
    IFStyleEntry.prototype.toString = function () {
        return "[IFStyleEntry]";
    };

    _.IFStyleEntry = IFStyleEntry;
})(this);