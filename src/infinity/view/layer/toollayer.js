(function (_) {
    /**
     * A layer for tools
     * @param {IFEditorView} view
     * @class IFToolLayer
     * @extends IFViewLayer
     * @constructor
     */
    function IFToolLayer(view) {
        IFViewLayer.call(this, view);
    }
    GObject.inherit(IFToolLayer, IFViewLayer);

    /** @override */
    IFToolLayer.prototype.toString = function () {
        return "[Object IFToolLayer]";
    };

    _.IFToolLayer = IFToolLayer;
})(this);