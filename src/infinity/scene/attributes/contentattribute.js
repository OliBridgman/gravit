(function (_) {

    /**
     * Attributes that render children of the element
     * @class IFContentAttribute
     * @extends IFRenderAttribute
     * @constructor
     */
    function IFContentAttribute() {
        IFRenderAttribute.call(this);
    }

    GObject.inheritAndMix(IFContentAttribute, IFRenderAttribute);

    /** @override */
    IFContentAttribute.prototype.render = function (context, source, bbox) {
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
    IFContentAttribute.prototype.toString = function () {
        return "[IFContentAttribute]";
    };

    _.IFContentAttribute = IFContentAttribute;
})(this);