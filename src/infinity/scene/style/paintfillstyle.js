(function (_) {

    /**
     * A fill paint style
     * @class GXPaintFillStyle
     * @extends GXPaintStyle
     * @constructor
     */
    function GXPaintFillStyle() {
        this.$fill = GXColor.parseColor('rgb255,0,0,50');
    }

    GXNode.inherit("fill", GXPaintFillStyle, GXPaintStyle);

    /** @override */
    GXPaintFillStyle.prototype.paint = function (context, source) {
        context.canvas.putVertices(source);
        context.canvas.fillVertices(this.$fill);
    };

    /** @override */
    GXPaintFillStyle.prototype.hitTest = function (source, location, transform, tolerance) {
        var vertexHit = new GXVertexInfo.HitResult();
        if (gVertexInfo.hitTest(location.getX(), location.getY(), new GXVertexTransformer(source, transform), tolerance, true, vertexHit)) {
            return new GXStyle.HitResult(this, vertexHit);
        }
        return null;
    };

    /** @override */
    GXPaintFillStyle.prototype.toString = function () {
        return "[GXPaintFillStyle]";
    };




    GXPaintFillStyle.prototype.__setFill = function (fill) {
        this.$fill = fill;
        this._invalidateOwnerElement(false);
    }


    _.GXPaintFillStyle = GXPaintFillStyle;
})(this);