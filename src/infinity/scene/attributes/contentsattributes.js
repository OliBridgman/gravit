(function (_) {

    /**
     * Attributes that render children of the element
     * @class GXContentsAttributes
     * @extends GXRenderAttributes
     * @constructor
     */
    function GXContentsAttributes() {
        GXRenderAttributes.call(this);
    }

    GObject.inheritAndMix(GXContentsAttributes, GXRenderAttributes);

    /** @override */
    GXContentsAttributes.prototype.render = function (context, source, bbox) {
        var ownerElement = this.getOwnerElement();

        // Create a temporary canvas for our contents for later clipping
        var oldCanvas = context.canvas;
        context.canvas = oldCanvas.createCanvas(ownerElement.getPaintBBox());
        try {
            // Render our owner element's contents
            if (ownerElement.hasMixin(GXNode.Container)) {
                for (var child = ownerElement.getFirstChild(); child !== null; child = child.getNext()) {
                    if (child instanceof GXElement) {
                        child.paint(context);
                        break;
                    }
                }
            }

            // Clip our contents and swap canvas back
            context.canvas.putVertices(source);
            context.canvas.fillVertices(gColor.build(0, 0, 0), 1, GXPaintCanvas.CompositeOperator.DestinationIn);
            oldCanvas.drawCanvas(context.canvas);
        } finally {
            context.canvas = oldCanvas;
        }
    };

    /** @override */
    GXContentsAttributes.prototype.toString = function () {
        return "[GXContentsAttributes]";
    };

    _.GXContentsAttributes = GXContentsAttributes;
})(this);