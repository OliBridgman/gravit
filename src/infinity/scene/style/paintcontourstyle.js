(function (_) {

    /**
     * A contour paint style
     * @class GXPaintContourStyle
     * @extends GXPaintFillStyle
     * @constructor
     */
    function GXPaintContourStyle() {
        this.$fill = GXColor.parseCSSColor('blue');
        this.$cw = 20;
    }

    GXNode.inherit("contour", GXPaintContourStyle, GXPaintFillStyle);

    /** @override */
    GXPaintContourStyle.prototype.paint = function (context, source) {
        context.canvas.putVertices(source);
        context.canvas.strokeVertices(this.$fill, this.$cw);
    };

    /** @override */
    GXPaintContourStyle.prototype.hitTest = function (source, location, transform, tolerance) {
        var outlineWidth = this.$cw * transform.getScaleFactor() + tolerance;
        var vertexHit = new GXVertexInfo.HitResult();
        if (gVertexInfo.hitTest(location.getX(), location.getY(), new GXVertexTransformer(source, transform), outlineWidth, false, vertexHit)) {
            return new GXStyle.HitResult(this, vertexHit);
        }
        return null;
    };

    /** @override */
    GXPaintContourStyle.prototype.getBBox = function (source) {
        return source.expanded(this.$cw / 2, this.$cw / 2, this.$cw / 2, this.$cw / 2);
    };

    /** @override */
    GXPaintContourStyle.prototype.toString = function () {
        return "[GXPaintContourStyle]";
    };

    _.GXPaintContourStyle = GXPaintContourStyle;
})(this);