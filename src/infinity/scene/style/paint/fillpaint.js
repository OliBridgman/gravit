(function (_) {

    /**
     * A fill paint
     * @class IFFillPaint
     * @extends IFPatternPaint
     * @constructor
     */
    function IFFillPaint() {
        IFPatternPaint.call(this);
    }

    IFNode.inherit('fillPaint', IFFillPaint, IFPatternPaint);

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
            var transform = canvas.getTransform(true);

            if (this.$rt !== 0) {
                transform = transform
                    .translated(-bbox.getX(), -bbox.getY())
                    .rotated(this.$rt)
                    .translated(bbox.getX(), bbox.getY());
            }

            var oldTransform = canvas.setTransform(transform);

            canvas.fillVertices(pattern, this.$opc, this.$blm);

            canvas.setTransform(oldTransform);
        }
    };

    /** @override */
    IFFillPaint.prototype.toString = function () {
        return "[IFFillPaint]";
    };

    _.IFFillPaint = IFFillPaint;
})(this);