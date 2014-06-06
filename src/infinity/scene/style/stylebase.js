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
    IFStyleBase.prototype.toString = function () {
        return "[IFStyleBase]";
    };

    _.IFStyleBase = IFStyleBase;
})(this);