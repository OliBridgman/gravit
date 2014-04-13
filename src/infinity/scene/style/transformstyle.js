(function (_) {

    /**
     * A vector effect style to transform the input source
     * @class GXTransformStyle
     * @extends GXVectorStyle
     * @constructor
     */
    function GXTransformStyle() {
        GXVectorStyle.call(this);
    }

    GObject.inherit(GXTransformStyle, GXVectorStyle);

    /**
     * Called to paint this style providing the painting
     * context and the vertex source used for painting
     * @param {GXPaintContext} context
     * @parma {GXVertexSource} source
     */
    GXTransformStyle.prototype.paint = function (context, source, bbox) {
        var sourceBBox = gVertexInfo.calculateBounds(source, true);
        var center = sourceBBox.getSide(GRect.Side.CENTER);
        var transform = new GTransform(1.0, 0.0, 0.0, 1.0, -center.getX(), -center.getY())
            .scaled(1.2, 1.2)
            .translated(center.getX(), center.getY());

        var newSource = new GXVertexTransformer(source, transform);//  new GTransform(1.2, 0, 0, 1.2, 0, 0));
        GXVectorStyle.prototype.paint.call(this, context, newSource, bbox);
    };

    /** @override */
    GXTransformStyle.prototype.toString = function () {
        return "[GXTransformStyle]";
    };

    _.GXTransformStyle = GXTransformStyle;
})(this);