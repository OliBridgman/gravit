(function (_) {

    /**
     * A vector effect style to transform the input source
     * @class GXVectorTransformStyle
     * @extends GXVectorStyle
     * @constructor
     */
    function GXVectorTransformStyle() {
    }

    GObject.inherit(GXVectorTransformStyle, GXVectorStyle);

    /**
     * Called to paint this style providing the painting
     * context and the vertex source used for painting
     * @param {GXPaintContext} context
     * @parma {GXVertexSource} source
     */
    GXVectorTransformStyle.prototype.paint = function (context, source) {
        var sourceBBox = gVertexInfo.calculateBounds(source, true);
        var center = sourceBBox.getSide(GRect.Side.CENTER);
        var transform = new GTransform(1.0, 0.0, 0.0, 1.0, -center.getX(), -center.getY())
            .scaled(1.2, 1.2)
            .translated(center.getX(), center.getY());

        var newSource = new GXVertexTransformer(source, transform);//  new GTransform(1.2, 0, 0, 1.2, 0, 0));
        GXVectorStyle.prototype.paint.call(this, context, newSource);
    };

    /** @override */
    GXVectorTransformStyle.prototype.toString = function () {
        return "[GXVectorTransformStyle]";
    };

    _.GXVectorTransformStyle = GXVectorTransformStyle;
})(this);