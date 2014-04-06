(function (_) {

    /**
     * A polygon shape
     * @class GXPolygon
     * @extends GXPathBase
     * @constructor
     */
    function GXPolygon() {
        GXPathBase.call(this);
        this.$closed = true; // polygons are always closed
        this._setDefaultProperties(GXPolygon.GeometryProperties);
    }

    GXNode.inherit("polygon", GXPolygon, GXPathBase);

    /**
     * The geometry properties of a polygon with their default values
     */
    GXPolygon.GeometryProperties = {
        /** Number of points / segments */
        pts: 6,
        /** Horizontal Center */
        cx: 0,
        /** Vertical Center */
        cy: 0,
        /** Outer Radius */
        or: 0,
        /** Inner Radius */
        ir: 0,
        /** Outer Angle */
        oa: 0,
        /** Inner Angle */
        ia: gMath.PI2 - Math.PI / 3,
        /** Outer Corner Type */
        oct: GXPathBase.CornerType.Rounded,
        /** Inner Corner Type */
        ict: GXPathBase.CornerType.Rounded,
        /** Outer Corner Radius */
        ocr: 0,
        /** Inner Corner Radius */
        icr: 0
    };

    /**
     * Iterate all segments of the polygon
     * @param {Function(point: GPoint, inside: Boolean, angle: Number)} iterator the
     * iterator receiving the parameters. If this returns true then the iteration will be stopped.
     * @param {Boolean} [includeTransform] if true, includes the transformation of the polygon
     * if any in the returned coordinates. Defaults to false.
     */
    GXPolygon.prototype.iterateSegments = function (iterator, includeTransform) {
        // Accuracy or considering start and end angles the same (2*PI overall)
        var ACC = 1.0e-6;
        var endArc = this.$oa + gMath.PI2;
        var stepArc = gMath.PI2 / this.$pts;
        var deltaArc = this.$ia - this.$oa;

        var transform = includeTransform ? this.$trf : null;

        // iterate backwards, as we have reflected Y axis; also for compatibility with MX
        for (var arc = this.$oa; arc < endArc - ACC; arc += stepArc) {
            // Outside
            var point = new GPoint(this.$or * Math.cos(arc) + this.$cx, this.$or * Math.sin(arc) + this.$cy);

            if (transform) {
                point = transform.mapPoint(point);
            }

            if (iterator(point, false, arc) === true) {
                break;
            }

            // Inside
            point = new GPoint(this.$ir * Math.cos(arc + deltaArc) + this.$cx, this.$ir * Math.sin(arc + deltaArc) + this.$cy);

            if (transform) {
                point = transform.mapPoint(point);
            }

            if (iterator(point, true, arc + deltaArc) === true) {
                break;
            }
        }
    };

    /** @override */
    GXPolygon.prototype.store = function (blob) {
        if (GXPathBase.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXPolygon.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXPolygon.prototype.restore = function (blob) {
        if (GXPathBase.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXPolygon.GeometryProperties);
            this._invalidatePath();
            return true;
        }
        return false;
    };

    /** @override */
    GXPolygon.prototype._handleChange = function (change, args) {
        if (this._handleGeometryChangeForProperties(change, args, GXPolygon.GeometryProperties) && change == GXNode._Change.AfterPropertiesChange) {
            this._invalidatePath();
        }
        GXPathBase.prototype._handleChange.call(this, change, args);
    };

    /**
     * @private
     */
    GXPolygon.prototype._invalidatePath = function () {
        var anchorPoints = this._getAnchorPoints();

        this.beginUpdate();
        anchorPoints._beginBlockCompositeEvents(true, true, true);
        try {
            // Clear old path points
            anchorPoints.clearChildren();

            this.iterateSegments(function (point, inside, angle) {
                var anchorPoint = new GXPathBase.AnchorPoint();
                anchorPoint.setProperties(['tp', 'x', 'y', 'cl', 'cr'],
                    [inside ? this.$ict : this.$oct, point.getX(), point.getY(), inside ? this.$icr : this.$ocr, inside ? this.$icr : this.$ocr]);
                anchorPoints.appendChild(anchorPoint);
            }.bind(this));

        } finally {
            this.endUpdate();
            anchorPoints._endBlockCompositeEvents(true, true, true);
        }
    };

    /** @override */
    GXPolygon.prototype.getCenter = function (includeTransform) {
        var center = new GPoint(this.$cx, this.$cy);
        if (includeTransform && this.$trf) {
            center = this.$trf.mapPoint(center);
        }
        return center;
    };

    /** @override */
    GXPolygon.prototype.getOrigHalfWidth = function () {
        return this.$or >= this.$ir ? this.$or : this.$ir;
    };

    /** @override */
    GXPolygon.prototype.getOrigHalfHeight = function () {
        return this.$or >= this.$ir ? this.$or : this.$ir;
    };

    /** @override */
    GXPolygon.prototype.toString = function () {
        return "[GXPolygon]";
    };

    _.GXPolygon = GXPolygon;
})(this);