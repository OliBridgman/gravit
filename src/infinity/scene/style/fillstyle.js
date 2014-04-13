(function (_) {

    /**
     * A fill paint style
     * @class GXFillStyle
     * @extends GXPaintStyle
     * @constructor
     */
    function GXFillStyle() {
        GXPaintStyle.call(this);
    }

    GXNode.inherit("fill", GXFillStyle, GXPaintStyle);

    /** @override */
    GXFillStyle.prototype.paint = function (context, source, bbox) {
        var pattern = this._createFillPattern(context, bbox);
        if (pattern) {
            context.canvas.putVertices(source);
            context.canvas.fillVertices(pattern, this.$opc, this.$cmp);
        }
    };

    /** @override */
    GXFillStyle.prototype.hitTest = function (source, location, transform, tolerance) {
        var vertexHit = new GXVertexInfo.HitResult();
        if (gVertexInfo.hitTest(location.getX(), location.getY(), new GXVertexTransformer(source, transform), tolerance, true, vertexHit)) {
            return new GXStyle.HitResult(this, vertexHit);
        }
        return null;
    };

    /** @override */
    GXFillStyle.prototype.toString = function () {
        return "[GXFillStyle]";
    };

    _.GXFillStyle = GXFillStyle;
})(this);