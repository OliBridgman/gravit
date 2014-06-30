(function (_) {

    /**
     * A fill paint
     * @class IFFillPaint
     * @extends IFAreaPaint
     * @constructor
     */
    function IFFillPaint() {
        IFAreaPaint.call(this);
    }

    IFNode.inherit('fillPaint', IFFillPaint, IFAreaPaint);

    /** @override */
    IFFillPaint.prototype.hitTest = function (source, location, transform, tolerance) {
        var vertexHit = new IFVertexInfo.HitResult();
        if (gVertexInfo.hitTest(location.getX(), location.getY(), new IFVertexTransformer(source, transform), tolerance, true, vertexHit)) {
            return new IFStyle.HitResult(this, vertexHit);
        }
        return null;
    };

    /** @override */
    IFFillPaint.prototype.paint = function (canvas, source, bbox) {
        var pattern = this._createPaintPattern(canvas, bbox);
        if (pattern) {
            if (pattern instanceof IFColor) {
                canvas.fillVertices(pattern, this.$opc, this.$blm);
            } else {
                var oldTransform = canvas.setTransform(canvas.getTransform(true).multiplied(this._getPatternTransform(bbox)));
                canvas.fillVertices(pattern, this.$opc, this.$blm);
                canvas.setTransform(oldTransform);
            }
        }
    };

    /** @override */
    IFFillPaint.prototype.toString = function () {
        return "[IFFillPaint]";
    };

    _.IFFillPaint = IFFillPaint;
})(this);