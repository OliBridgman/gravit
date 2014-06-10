(function (_) {

    /**
     * A base style entry class
     * @class IFStyleEntry
     * @extends IFNode
     * @mixes IFNode.Store
     * @mixes IFNode.Properties
     * @constructor
     */
    function IFStyleEntry() {
        IFNode.call(this);
        this._setDefaultProperties(IFStyleEntry.VisualProperties);
    }

    IFObject.inheritAndMix(IFStyleEntry, IFNode, [IFNode.Store, IFNode.Properties]);

    /**
     * Visual properties
     */
    IFStyleEntry.VisualProperties = {
        // Whether the node is visible or not
        vs: true
    };

    /** @override */
    IFStyleEntry.prototype.store = function (blob) {
        if (IFNode.Store.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFStyleEntry.VisualProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFStyleEntry.prototype.restore = function (blob) {
        if (IFNode.Store.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFStyleEntry.VisualProperties);
            return true;
        }
        return false;
    };

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