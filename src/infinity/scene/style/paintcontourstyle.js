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
        cw: 1
    };

    /** @override */
    GXPaintContourStyle.prototype.paint = function (context, source) {
        if (this.hasPaintableFill()) {
            context.canvas.putVertices(source);
            context.canvas.strokeVertices(this.$fill, this.$cw);
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
            this.restoreProperties(blob, GXPaintContourStyle.GeometryProperties, true);
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