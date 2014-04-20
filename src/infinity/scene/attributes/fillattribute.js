(function (_) {

    /**
     * Fill attribute for filling something with a pattern
     * @class IFFillAttribute
     * @extends IFPatternAttribute
     * @constructor
     */
    function IFFillAttribute() {
        IFPatternAttribute.call(this);
    }

    GXNode.inherit("fillAttr", IFFillAttribute, IFPatternAttribute);

    /** @override */
    IFFillAttribute.prototype.render = function (context, source, bbox) {
        if (!context.configuration.isOutline(context)) {
            var pattern = this._createPaintPattern(context, bbox);
            if (pattern) {
                context.canvas.putVertices(source);
                context.canvas.fillVertices(pattern, this.$opc, this.$cmp);
            }
        }
    };

    /** @override */
    IFFillAttribute.prototype.hitTest = function (source, location, transform, tolerance) {
        var vertexHit = new GXVertexInfo.HitResult();
        if (gVertexInfo.hitTest(location.getX(), location.getY(), new GXVertexTransformer(source, transform), tolerance, true, vertexHit)) {
            return new IFRenderAttribute.HitResult(this, vertexHit);
        }
        return null;
    };

    /** @override */
    IFFillAttribute.prototype.toString = function () {
        return "[IFFillAttribute]";
    };

    _.IFFillAttribute = IFFillAttribute;
})(this);