(function (_) {
    /**
     * An editor for a layer
     * @param {GLayer} layer the layer this editor works on
     * @class GLayerEditor
     * @extends GBlockEditor
     * @constructor
     */
    function GLayerEditor(layer) {
        GBlockEditor.call(this, layer);
        this._flags |= GBlockEditor.Flag.ResizeAll;
    };
    GObject.inherit(GLayerEditor, GBlockEditor);
    GElementEditor.exports(GLayerEditor, GLayer);

    /** @override */
    GLayerEditor.prototype.paint = function (transform, context) {
        // Setup outline colors if we have a color
        var oldSelOutlineColor = context.selectionOutlineColor;
        var layerColor = this._element.getProperty('cls');
        context.selectionOutlineColor = layerColor;

        // Call super
        GBlockEditor.prototype.paint.call(this, transform, context);

        // Reset outline colors if set
        context.selectionOutlineColor = oldSelOutlineColor;
    };

    /** @override */
    GLayerEditor.prototype._prePaint = function (transform, context) {
        if (this.hasFlag(GElementEditor.Flag.Selected) || this.hasFlag(GElementEditor.Flag.Highlighted)) {
            this._paintBBoxOutline(transform, context);
        }
        GBlockEditor.prototype._prePaint.call(this, transform, context);
    };

    /** @override */
    GLayerEditor.prototype.toString = function () {
        return "[Object GLayerEditor]";
    };

    _.GLayerEditor = GLayerEditor;
})(this);