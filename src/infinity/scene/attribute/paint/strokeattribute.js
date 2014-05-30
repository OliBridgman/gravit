(function (_) {

    /**
     * Stroke attribute for stroking something with a pattern
     * @class IFStrokeAttribute
     * @extends IFPatternAttribute
     * @constructor
     */
    function IFStrokeAttribute() {
        IFPatternAttribute.call(this);
        this._setDefaultProperties(IFStrokeAttribute.GeometryProperties);
    }

    IFNode.inherit("strokeAttr", IFStrokeAttribute, IFPatternAttribute);

    /**
     * Alignment of a stroke
     * @enum
     */
    IFStrokeAttribute.Alignment = {
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
    IFStrokeAttribute.GeometryProperties = {
        // Stroke width
        sw: 1,
        // Stroke alignment
        sa: IFStrokeAttribute.Alignment.Center,
        // Stroke Line-Caption
        slc: IFPaintCanvas.LineCap.Square,
        // Stroke Line-Join
        slj: IFPaintCanvas.LineJoin.Miter,
        // Stroke Line-Miter-Limit
        slm: 10
    };

    /** @override */
    IFStrokeAttribute.prototype.render = function (context, source, bbox) {
        if (!context.configuration.isOutline(context) && this.$sw && this.$sw > 0) {
            var strokeBBox = this.getBBox(bbox);
            var pattern = this._createPaintPattern(context, strokeBBox);
            if (pattern) {
                // If not centered align, then we need to clip on temp canvas
                if (this.$sa !== IFStrokeAttribute.Alignment.Center) {
                    var oldCanvas = context.canvas;
                    context.canvas = oldCanvas.createCanvas(strokeBBox);
                    try {
                        context.canvas.putVertices(source);

                        // Render our stroke
                        context.canvas.strokeVertices(pattern, this.$sw * 2, this.$slc, this.$slj, this.$slm, this.$opc, this.$cmp);

                        // Clip our contents and swap canvas back
                        context.canvas.fillVertices(IFColor.BLACK, 1,
                            this.$sa === IFStrokeAttribute.Alignment.Inside ? IFPaintCanvas.CompositeOperator.DestinationIn : IFPaintCanvas.CompositeOperator.DestinationOut);
                        oldCanvas.drawCanvas(context.canvas);
                    } finally {
                        context.canvas = oldCanvas;
                    }
                } else {
                    context.canvas.putVertices(source);
                    context.canvas.strokeVertices(pattern, this.$sw, this.$slc, this.$slj, this.$slm, this.$opc, this.$cmp);
                }
            }
        }
    };

    /** @override */
    IFStrokeAttribute.prototype.hitTest = function (source, location, transform, tolerance) {
        var outlineWidth = this.$sw * transform.getScaleFactor() + tolerance * 2;
        var vertexHit = new IFVertexInfo.HitResult();
        if (gVertexInfo.hitTest(location.getX(), location.getY(), new IFVertexTransformer(source, transform), outlineWidth, false, vertexHit)) {
            return new IFAttribute.HitResult(this, vertexHit);
        }
        return null;
    };

    /** @override */
    IFStrokeAttribute.prototype.getBBox = function (source) {
        // Extend source by our stroke width depending on alignment
        if (this.$sa === IFStrokeAttribute.Alignment.Center) {
            return source.expanded(this.$sw / 2, this.$sw / 2, this.$sw / 2, this.$sw / 2);
        } else if (this.$sa === IFStrokeAttribute.Alignment.Outside) {
            return source.expanded(this.$sw, this.$sw, this.$sw, this.$sw);
        } else {
            return source;
        }
    };

    /** @override */
    IFStrokeAttribute.prototype.store = function (blob) {
        if (IFPatternAttribute.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFStrokeAttribute.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFStrokeAttribute.prototype.restore = function (blob) {
        if (IFPatternAttribute.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFStrokeAttribute.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFStrokeAttribute.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, IFStrokeAttribute.GeometryProperties);
        IFPatternAttribute.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFStrokeAttribute.prototype.toString = function () {
        return "[IFStrokeAttribute]";
    };

    _.IFStrokeAttribute = IFStrokeAttribute;
})(this);