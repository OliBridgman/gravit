(function (_) {

    /**
     * Attribute that does some raster effect
     * @class IFEffectAttribute
     * @extends IFDrawAttribute
     * @constructor
     */
    function IFEffectAttribute() {
        IFDrawAttribute.call(this);
    }

    IFObject.inherit(IFEffectAttribute, IFDrawAttribute);

    /** @override */
    IFEffectAttribute.prototype.render = function (context, source, bbox) {
        // Let the effect take only place in 'Full' or 'Output' mode
        var paintMode = context.configuration.paintMode;
        if (!context.configuration.isOutline(context) && (paintMode === IFScenePaintConfiguration.PaintMode.Full || paintMode === IFScenePaintConfiguration.PaintMode.Output)) {
            // Create a temporary canvas for our contents for our effects
            var oldCanvas = context.canvas;
            context.canvas = oldCanvas.createCanvas(this._getCanvasExtents(context, source, bbox));
            try {
                // Call to render the effect contents
                this._renderContents(context, source, bbox);

                // Call the effect now
                var offset = this._renderEffect(context, source, bbox);

                // Paint our canvas back
                var dx = 0;
                var dy = 0;

                if (offset) {
                    var canvasTransform = oldCanvas.getTransform();
                    var delta = canvasTransform.mapPoint(offset).subtract(canvasTransform.mapPoint(new GPoint(0, 0)));
                    var dx = delta.getX();
                    var dy = delta.getY();
                }

                oldCanvas.drawCanvas(context.canvas, dx, dy);
            } finally {
                context.canvas = oldCanvas;
            }

            // Call this to render any overlay on source canvas
            this._renderOverlay(context, source, bbox);
        } else {
            // in any other mode, do simply render the filter contents
            this._renderContents(context, source, bbox);
        }
    };

    /**
     * @param {IFPaintContext} context
     * @param {IFVertexSource} source
     * @param {IFRect} bbox
     * @return {GRect}
     * @private
     */
    IFEffectAttribute.prototype._getCanvasExtents = function (context, source, bbox) {
        return this.getBBox(bbox);
    };

    /**
     * @param {IFPaintContext} context
     * @param {IFVertexSource} source
     * @param {IFRect} bbox
     * @private
     */
    IFEffectAttribute.prototype._renderContents = function (context, source, bbox) {
        this._renderChildren(context, source, bbox);
    };

    /**
     * @param {IFPaintContext} context
     * @param {IFVertexSource} source
     * @param {IFRect} bbox
     * @return {GPoint} optional offset in scene coordinates to paint the effect by
     * @private
     */
    IFEffectAttribute.prototype._renderEffect = function (context, source, bbox) {
        // NO-OP
        return null;
    };

    /**
     * @param {IFPaintContext} context
     * @param {IFVertexSource} source
     * @param {IFRect} bbox
     * @private
     */
    IFEffectAttribute.prototype._renderOverlay = function (context, source, bbox) {
        // NO-OP
    };

    /** @override */
    IFEffectAttribute.prototype.toString = function () {
        return "[IFEffectAttribute]";
    };

    _.IFEffectAttribute = IFEffectAttribute;
})(this);