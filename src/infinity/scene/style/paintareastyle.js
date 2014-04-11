(function (_) {

    /**
     * A contour paint style
     * @class GXPaintAreaStyle
     * @extends GXPaintFillStyle
     * @constructor
     */
    function GXPaintAreaStyle() {
        GXPaintFillStyle.call(this);
    }

    GXNode.inherit("area", GXPaintAreaStyle, GXPaintFillStyle);

    /** @override */
    GXPaintAreaStyle.prototype.paint = function (context, source) {
        if (this.hasPaintableFill()) {
            context.canvas.putVertices(source);
            context.canvas.fillVertices(this.$val, this.$opc, this.$cmp);
        }
    };

    /** @override */
    GXPaintAreaStyle.prototype.hitTest = function (source, location, transform, tolerance) {
        var vertexHit = new GXVertexInfo.HitResult();
        if (gVertexInfo.hitTest(location.getX(), location.getY(), new GXVertexTransformer(source, transform), tolerance, true, vertexHit)) {
            return new GXStyle.HitResult(this, vertexHit);
        }
        return null;
    };

    /** @override */
    GXPaintAreaStyle.prototype.toString = function () {
        return "[GXPaintAreaStyle]";
    };

    _.GXPaintAreaStyle = GXPaintAreaStyle;
})(this);