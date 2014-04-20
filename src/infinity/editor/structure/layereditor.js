(function (_) {
    /**
     * An editor for a layer
     * @param {GXLayer} layer the layer this editor works on
     * @class GXLayerEditor
     * @extends GXBlockEditor
     * @constructor
     */
    function GXLayerEditor(layer) {
        GXBlockEditor.call(this, layer);
        this._flags |= GXBlockEditor.Flag.ResizeAll;
    };
    GObject.inherit(GXLayerEditor, GXBlockEditor);
    GXElementEditor.exports(GXLayerEditor, GXLayer);

    /** @override */
    GXLayerEditor.prototype.paint = function (transform, context) {
        // Setup outline colors if we have a color
        var oldSelOutlineColor = context.selectionOutlineColor;
        var layerColor = this._element.getProperty('cls');
        context.selectionOutlineColor = layerColor.asRGBInt();

        // Call super
        GXBlockEditor.prototype.paint.call(this, transform, context);

        // Reset outline colors if set
        context.selectionOutlineColor = oldSelOutlineColor;
    };

    /** @override */
    GXLayerEditor.prototype.toString = function () {
        return "[Object GXLayerEditor]";
    };

    _.GXLayerEditor = GXLayerEditor;
})(this);