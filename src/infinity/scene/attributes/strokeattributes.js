(function (_) {

    /**
     * Stroke attributes for stroking something with a pattern
     * @class GXStrokeAttributes
     * @extends GXPatternAttributes
     * @constructor
     */
    function GXStrokeAttributes() {
        GXPatternAttributes.call(this);
        this._setDefaultProperties(GXStrokeAttributes.GeometryProperties);
    }

    GXNode.inherit("strokeAttr", GXStrokeAttributes, GXPatternAttributes);

    /**
     * Geometry properties
     */
    GXStrokeAttributes.GeometryProperties = {
        // Stroke width
        sw: 1,
        // Stroke inside or not (center)
        si: false,
        // Stroke Line-Caption
        slc: GXPaintCanvas.LineCap.Square,
        // Stroke Line-Join
        slj: GXPaintCanvas.LineJoin.Miter,
        // Stroke Line-Miter-Limit
        slm: 10
    };

    /** @override */
    GXStrokeAttributes.prototype.render = function (context, source, bbox) {
        if (!context.configuration.isOutline(context) && this.$sw && this.$sw > 0) {
            var strokeBBox = this.$si ? bbox : bbox.expanded(this.$sw, this.$sw, this.$sw, this.$sw);
            var pattern = this._createPaintPattern(context, strokeBBox);
            if (pattern) {
                if (this.getScene().getProperty('unit') === GXLength.Unit.PX && this.$sw % 2 !== 0) {
                    // This code is temporary disabled as it breaks ellipse arcs, pies and chords, especially
                    // it is noticeable at zoom
                    //vertexSource = new GXVertexPixelAligner(source);
                    // TODO : Translate 0,5 0,5 depending on bbox + take care on inside or not!!
                }

                context.canvas.putVertices(source);

                // If inside, we need to clip
                if (this.$si) {
                    //context.canvas.clipVertices();
                }

                context.canvas.strokeVertices(pattern, this.$sw * (this.$si ? 2 : 1), this.$slc, this.$slj, this.$slm, this.$opc, this.$smp);

                // If inside, we need to reset our clipping
                if (this.$si) {
                    //context.canvas.resetClip();
                }
            }
        }
    };

    /** @override */
    GXStrokeAttributes.prototype.hitTest = function (source, location, transform, tolerance) {
        var outlineWidth = this.$sw * transform.getScaleFactor() + tolerance * 2;
        var vertexHit = new GXVertexInfo.HitResult();
        if (gVertexInfo.hitTest(location.getX(), location.getY(), new GXVertexTransformer(source, transform), outlineWidth, false, vertexHit)) {
            return new GXRenderAttributes.HitResult(this, vertexHit);
        }
        return null;
    };

    /** @override */
    GXStrokeAttributes.prototype.getBBox = function (source) {
        // Extend source by our stroke width if not inside
        if (!this.$si) {
            return source.expanded(this.$sw / 2, this.$sw / 2, this.$sw / 2, this.$sw / 2);
        } else {
            return source;
        }
    };

    /** @override */
    GXStrokeAttributes.prototype.store = function (blob) {
        if (GXPatternAttributes.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXStrokeAttributes.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXStrokeAttributes.prototype.restore = function (blob) {
        if (GXPatternAttributes.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXStrokeAttributes.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXStrokeAttributes.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, GXStrokeAttributes.GeometryProperties);
        GXPatternAttributes.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GXStrokeAttributes.prototype.toString = function () {
        return "[GXStrokeAttributes]";
    };

    _.GXStrokeAttributes = GXStrokeAttributes;
})(this);