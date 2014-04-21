(function (_) {

    /**
     * Attribute that does some raster effect
     * @class IFEffectAttribute
     * @extends IFAttribute
     * @mixes IFAttribute.Render
     * @constructor
     */
    function IFEffectAttribute() {
        IFAttribute.call(this);
    }

    GObject.inheritAndMix(IFEffectAttribute, IFAttribute, [IFAttribute.Render]);

    /** @override */
    IFEffectAttribute.prototype.render = function (context, source, bbox) {
        // Let the effect take only place in 'Full' or 'Output' mode
        var paintMode = context.configuration.paintMode;
        if (!context.configuration.isOutline(context) && (paintMode === GXScenePaintConfiguration.PaintMode.Full || paintMode === GXScenePaintConfiguration.PaintMode.Output)) {
            // Create a temporary canvas for our contents for our effects
            var oldCanvas = context.canvas;
            context.canvas = oldCanvas.createCanvas(this.getBBox(bbox));
            try {
                // Call to render the effect contents
                this._renderContents(context, source, bbox);

                // Call the effect now
                this._renderEffect(context, source, bbox);

                // Paint our canvas back
                oldCanvas.drawCanvas(context.canvas);
            } finally {
                context.canvas = oldCanvas;
            }
        } else {
            // in any other mode, do simply render the filter contents
            this._renderContents(context, source, bbox);
        }
    };

    /**
     * @param {GXPaintContext} context
     * @param {GXVertexSource} source
     * @param {GXRect} bbox
     * @private
     */
    IFEffectAttribute.prototype._renderContents = function (context, source, bbox) {
        if (this.hasMixin(GXNode.Container)) {
            this._renderChildren(context, source, bbox);
        }
    };

    /**
     * @param {GXPaintContext} context
     * @param {GXVertexSource} source
     * @param {GXRect} bbox
     * @private
     */
    IFEffectAttribute.prototype._renderEffect = function (context, source, bbox) {
        // NO-OP
    };

    /** @override */
    IFEffectAttribute.prototype.toString = function () {
        return "[IFEffectAttribute]";
    };

    _.IFEffectAttribute = IFEffectAttribute;
})(this);