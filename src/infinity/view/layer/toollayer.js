(function (_) {
    /**
     * A layer for tools
     * @param {GXEditorView} view
     * @class GXToolLayer
     * @extends GXViewLayer
     * @constructor
     */
    function GXToolLayer(view) {
        GXViewLayer.call(this, view);
    }
    GObject.inherit(GXToolLayer, GXViewLayer);

    /** @override */
    GXToolLayer.prototype.toString = function () {
        return "[Object GXToolLayer]";
    };

    _.GXToolLayer = GXToolLayer;
})(this);