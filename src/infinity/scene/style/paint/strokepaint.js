(function (_) {

    /**
     * A stroke paint
     * @class IFStrokePaint
     * @extends IFAreaPaint
     * @constructor
     */
    function IFStrokePaint() {
        IFAreaPaint.call(this);
        this._setDefaultProperties(IFStrokePaint.GeometryProperties);
    }

    IFNode.inherit('strokePaint', IFStrokePaint, IFAreaPaint);

    /**
     * Alignment of a stroke
     * @enum
     */
    IFStrokePaint.Alignment = {
        /**
         * Center alignment
         */
        Center : 'C',

        /**
         * Outside alignment
         */
        Outside: 'O',

        /**
         * Inside alignment
         */
        Inside: 'I'
    };

    /**
     * Geometry properties
     */
    IFStrokePaint.GeometryProperties = {
        // Stroke width
        sw: 1,
        // Stroke alignment
        sa: IFStrokePaint.Alignment.Center,
        // Stroke Line-Caption
        slc: IFPaintCanvas.LineCap.Square,
        // Stroke Line-Join
        slj: IFPaintCanvas.LineJoin.Miter,
        // Stroke Line-Miter-Limit
        slm: 10
    };

    /** @override */
    IFStrokePaint.prototype.isSeparate = function () {
        if (IFAreaPaint.prototype.isSeparate.call(this) === false) {
            // If we're not having a center-aligned stroke then
            // we need a separate canvas here
            if (this.$sa !== IFStrokePaint.Alignment.Center) {
                return true;
            }

            // If we're having anything else than a color fill and
            // the scale factor is not 100%, we need a separate canvas
            if (this.$pat && IFPatternPaint.getTypeOf(this.$pat)) {
                if (this.$sx !== 1 || this.$sy !== 1) {
                    return true;
                }
            }
        }
        return false;
    };

    /** @override */
    IFStrokePaint.prototype.hitTest = function (source, location, transform, tolerance) {
        var outlineWidth = this.$sw * transform.getScaleFactor() + tolerance * 2;
        var vertexHit = new IFVertexInfo.HitResult();
        if (ifVertexInfo.hitTest(location.getX(), location.getY(), new IFVertexTransformer(source, transform), outlineWidth, false, vertexHit)) {
            return new IFStyle.HitResult(this, vertexHit);
        }
        return null;
    };

    /** @override */
    IFStrokePaint.prototype.getPadding = function () {
        // Padding depends on stroke-width and alignment
        if (this.$sa === IFStrokePaint.Alignment.Center) {
            var val = this.$sw / 2;
            return [val, val, val, val];
        } else if (this.$sa === IFStrokePaint.Alignment.Outside) {
            return [this.$sw, this.$sw, this.$sw, this.$sw];
        }
        return null;
    };

    /** @override */
    IFStrokePaint.prototype.paint = function (canvas, source, bbox) {
        var pattern = this._createPaintPattern(canvas, bbox);
        if (pattern) {
            var strokeWidth = this.$sw;

            // Except center alignment we need to double the stroke width
            // as we're gonna clip half away
            if (this.$sa !== IFStrokePaint.Alignment.Center) {
                strokeWidth *= 2;
            }

            // Stroke vertices now
            if (pattern instanceof IFColor) {
                canvas.strokeVertices(pattern, strokeWidth, this.$slc, this.$slj, this.$slm, this.$opc, this.$blm);
            } else {
                // If we're on a separate canvas then use the standard opacity and blend mode
                // as our canvas will be blended in using the given options
                var blendMode = this.$blm;
                var opacity = this.$opc;

                if (this.isSeparate()) {
                    blendMode = IFPaintCanvas.BlendMode.Normal;
                    opacity = 1;
                }

                // If our scale factors are != 100% then we'll fill the whole area as
                // we're on a separate canvas and clip our stroke, otherwise we'll do
                // the simple stroke
                if (this.$sx !== 1 || this.$sy !== 1) {
                    // Fill everything with the pattern, first
                    var patternTransform = this._getPatternTransform(bbox);
                    var oldTransform = canvas.setTransform(canvas.getTransform(true).multiplied(patternTransform));
                    var patternFillArea = patternTransform.inverted().mapRect(bbox);
                    canvas.fillRect(patternFillArea.getX(), patternFillArea.getY(), patternFillArea.getWidth(), patternFillArea.getHeight(), pattern);
                    canvas.setTransform(oldTransform);

                    // Now stroke as regular but use our stroke as mask
                    canvas.strokeVertices(pattern, strokeWidth, this.$slc, this.$slj, this.$slm, 1, IFPaintCanvas.CompositeOperator.DestinationIn);
                } else {
                    var oldTransform = canvas.setTransform(canvas.getTransform(true).multiplied(this._getPatternTransform(bbox)))
                    canvas.strokeVertices(pattern, strokeWidth, this.$slc, this.$slj, this.$slm, opacity, blendMode);
                    canvas.setTransform(oldTransform);
                }
            }

            // Depending on the stroke alignment we might need to clip now
            if (this.$sa === IFStrokePaint.Alignment.Inside) {
                canvas.fillVertices(IFColor.BLACK, 1, IFPaintCanvas.CompositeOperator.DestinationIn);
            } else if (this.$sa === IFStrokePaint.Alignment.Outside) {
                canvas.fillVertices(IFColor.BLACK, 1, IFPaintCanvas.CompositeOperator.DestinationOut);
            }
        }
    };

    /** @override */
    IFStrokePaint.prototype.store = function (blob) {
        if (IFAreaPaint.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFStrokePaint.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFStrokePaint.prototype.restore = function (blob) {
        if (IFAreaPaint.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFStrokePaint.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFStrokePaint.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, IFStrokePaint.GeometryProperties);
        IFAreaPaint.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFStrokePaint.prototype.toString = function () {
        return "[IFStrokePaint]";
    };

    _.IFStrokePaint = IFStrokePaint;
})(this);