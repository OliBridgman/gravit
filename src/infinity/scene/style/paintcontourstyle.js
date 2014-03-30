(function (_) {

    /**
     * A contour paint style
     * @class GXPaintContourStyle
     * @extends GXPaintFillStyle
     * @constructor
     */
    function GXPaintContourStyle() {
        GXPaintFillStyle.call(this);
        this._setDefaultProperties(GXPaintContourStyle.GeometryProperties);
    }

    GXNode.inherit("contour", GXPaintContourStyle, GXPaintFillStyle);

    /**
     * Geometry properties of a contour style
     */
    GXPaintContourStyle.GeometryProperties = {
        // Contour width
        cw: 1,
        // Contour alignment
        ca: GXPaintCanvas.StrokeAlignment.Center,
        // Contour Line-Caption
        clc: GXPaintCanvas.LineCap.Square,
        // Contour Line-Join
        clj: GXPaintCanvas.LineJoin.Miter,
        // Contour Line-Miter-Limit
        clm: 10
    };

    /** @override */
    GXPaintContourStyle.prototype.paint = function (context, source) {
        if (this.hasPaintableFill() && this.$cw && this.$cw > 0) {
            var vertexSource = source;
            if (this.getScene().getProperty('unit') === GXLength.Unit.PX && this.$cw % 2 !== 0) {
                vertexSource = new GXVertexPixelAligner(source);
            }

            context.canvas.putVertices(vertexSource);
            context.canvas.strokeVertices(this.$cls, this.$cw, this.$clc, this.$clj, this.$clm, this.$ca, this.$opc, this.$cmp);
        }
    };

    /** @override */
    GXPaintContourStyle.prototype.hitTest = function (source, location, transform, tolerance) {
        var outlineWidth = this.$cw * transform.getScaleFactor() + tolerance * 2;
        var vertexHit = new GXVertexInfo.HitResult();
        if (gVertexInfo.hitTest(location.getX(), location.getY(), new GXVertexTransformer(source, transform), outlineWidth, false, vertexHit)) {
            return new GXStyle.HitResult(this, vertexHit);
        }
        return null;
    };

    /** @override */
    GXPaintContourStyle.prototype.getBBox = function (source) {
        // Extend source by our contour width
        return source.expanded(this.$cw / 2, this.$cw / 2, this.$cw / 2, this.$cw / 2);
    };

    /** @override */
    GXPaintContourStyle.prototype.store = function (blob) {
        if (GXPaintFillStyle.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXPaintContourStyle.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXPaintContourStyle.prototype.restore = function (blob) {
        if (GXPaintFillStyle.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXPaintContourStyle.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXPaintContourStyle.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, GXPaintContourStyle.GeometryProperties);
        GXPaintFillStyle.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GXPaintContourStyle.prototype.toString = function () {
        return "[GXPaintContourStyle]";
    };

    _.GXPaintContourStyle = GXPaintContourStyle;
})(this);