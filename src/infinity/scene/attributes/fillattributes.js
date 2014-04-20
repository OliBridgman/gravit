(function (_) {

    /**
     * Fill attributes for filling something with a pattern
     * @class GXFillAttributes
     * @extends GXPatternAttributes
     * @constructor
     */
    function GXFillAttributes() {
        GXPatternAttributes.call(this);
    }

    GXNode.inherit("fillAttr", GXFillAttributes, GXPatternAttributes);

    /** @override */
    GXFillAttributes.prototype.render = function (context, source, bbox) {
        if (!context.configuration.isOutline(context)) {
            var pattern = this._createPaintPattern(context, bbox);
            if (pattern) {
                context.canvas.putVertices(source);
                context.canvas.fillVertices(pattern, this.$opc, this.$cmp);
            }
        }
    };

    /** @override */
    GXFillAttributes.prototype.hitTest = function (source, location, transform, tolerance) {
        var vertexHit = new GXVertexInfo.HitResult();
        if (gVertexInfo.hitTest(location.getX(), location.getY(), new GXVertexTransformer(source, transform), tolerance, true, vertexHit)) {
            return new GXRenderAttributes.HitResult(this, vertexHit);
        }
        return null;
    };

    /** @override */
    GXFillAttributes.prototype.toString = function () {
        return "[GXFillAttributes]";
    };

    _.GXFillAttributes = GXFillAttributes;
})(this);