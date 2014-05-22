(function (_) {

    /**
     * Attributes that render children of the element
     * @class IFContentAttribute
     * @extends IFAttribute
     * @mixes IFAttribute.Render
     * @constructor
     */
    function IFContentAttribute() {
        IFAttribute.call(this);
    }

    IFNode.inheritAndMix("contentAttr", IFContentAttribute, IFAttribute, [IFAttribute.Render]);

    /** @override */
    IFContentAttribute.prototype.render = function (context, source, bbox) {
        var ownerElement = this.getOwnerElement();

        // Create a temporary canvas for our contents for later clipping
        var oldCanvas = context.canvas;
        context.canvas = oldCanvas.createCanvas(ownerElement.getPaintBBox());
        try {
            // Render our owner element's contents
            if (ownerElement.hasMixin(IFNode.Container)) {
                for (var child = ownerElement.getFirstChild(); child !== null; child = child.getNext()) {
                    if (child instanceof IFElement) {
                        child.paint(context);
                        break;
                    }
                }
            }

            // Clip our contents and swap canvas back
            context.canvas.putVertices(source);
            context.canvas.fillVertices(gColor.build(0, 0, 0), 1, IFPaintCanvas.CompositeOperator.DestinationIn);
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