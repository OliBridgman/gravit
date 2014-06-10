(function (_) {

    /**
     * A stroke paint
     * @class IFStrokePaint
     * @extends IFPatternPaint
     * @constructor
     */
    function IFStrokePaint() {
        IFPatternPaint.call(this);
        this._setDefaultProperties(IFStrokePaint.GeometryProperties);
    }

    IFNode.inherit('strokePaint', IFStrokePaint, IFPatternPaint);

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
    IFStrokePaint.prototype.getStackIndex = function () {
        return 1;
    };

    /** @override */
    IFStrokePaint.prototype.isSeparate = function () {
        return this.$sa !== IFStrokePaint.Alignment.Center;
    };

    /** @override */
    IFStrokePaint.prototype.hitTest = function (source, location, transform, tolerance) {
        var outlineWidth = this.$sw * transform.getScaleFactor() + tolerance * 2;
        var vertexHit = new IFVertexInfo.HitResult();
        if (gVertexInfo.hitTest(location.getX(), location.getY(), new IFVertexTransformer(source, transform), outlineWidth, false, vertexHit)) {
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
            canvas.strokeVertices(pattern, strokeWidth, this.$slc, this.$slj, this.$slm, this.$opc, this.$cmp);

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
        if (IFPatternPaint.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFStrokePaint.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFStrokePaint.prototype.restore = function (blob) {
        if (IFPatternPaint.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFStrokePaint.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFStrokePaint.prototype.toString = function () {
        return "[IFStrokePaint]";
    };

    _.IFStrokePaint = IFStrokePaint;
})(this);