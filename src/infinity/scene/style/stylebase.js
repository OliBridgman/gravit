(function (_) {

    /**
     * The base of styles and style-entries
     * @class IFStyleBase
     * @extends IFNode
     * @mixes IFNode.Store
     * @mixes IFNode.Properties
     * @constructor
     */
    function IFStyleBase() {
        IFNode.call(this);
        this._setDefaultProperties(IFStyleBase.VisualProperties);
    }

    IFObject.inheritAndMix(IFStyleBase, IFNode, [IFNode.Store, IFNode.Properties]);

    /**
     * Visual properties
     */
    IFStyleBase.VisualProperties = {
        // Whether the node is visible or not
        vs: true
    };

    /** @override */
    IFStyleBase.prototype.store = function (blob) {
        if (IFNode.Store.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFStyleBase.VisualProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFStyleBase.prototype.restore = function (blob) {
        if (IFNode.Store.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFStyleBase.VisualProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFStyleBase.prototype.toString = function () {
        return "[IFStyleBase]";
    };

    _.IFStyleBase = IFStyleBase;
})(this);