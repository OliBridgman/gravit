(function (_) {
    /**
     * An editor for a layer
     * @param {IFLayer} layer the layer this editor works on
     * @class IFLayerEditor
     * @extends IFBlockEditor
     * @constructor
     */
    function IFLayerEditor(layer) {
        IFBlockEditor.call(this, layer);
        this._flags |= IFBlockEditor.Flag.ResizeAll;
    };
    IFObject.inherit(IFLayerEditor, IFBlockEditor);
    IFElementEditor.exports(IFLayerEditor, IFLayer);

    /** @override */
    IFLayerEditor.prototype.paint = function (transform, context) {
        // Setup outline colors if we have a color
        var oldSelOutlineColor = context.selectionOutlineColor;
        var layerColor = this._element.getProperty('cls');
        context.selectionOutlineColor = layerColor.asRGBInt();

        // Call super
        IFBlockEditor.prototype.paint.call(this, transform, context);

        // Reset outline colors if set
        context.selectionOutlineColor = oldSelOutlineColor;
    };

    /** @override */
    IFLayerEditor.prototype.toString = function () {
        return "[Object IFLayerEditor]";
    };

    _.IFLayerEditor = IFLayerEditor;
})(this);