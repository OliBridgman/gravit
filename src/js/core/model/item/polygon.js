(function (_) {

    /**
     * A polygon shape
     * @class GPolygon
     * @extends GPathBase
     * @constructor
     */
    function GPolygon() {
        GPathBase.call(this);
        this.$closed = true; // polygons are always closed
        this._setDefaultProperties(GPolygon.GeometryProperties);
    }

    GNode.inherit("polygon", GPolygon, GPathBase);

    /**
     * The geometry properties of a polygon with their default values
     */
    GPolygon.GeometryProperties = {
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
        ia: GMath.PI2 - Math.PI / 3,
        /** Outer Corner Type */
        oct: GPathBase.CornerType.Rounded,
        /** Inner Corner Type */
        ict: GPathBase.CornerType.Rounded,
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
    GPolygon.prototype.iterateSegments = function (iterator, includeTransform) {
        // Accuracy or considering start and end angles the same (2*PI overall)
        var ACC = 1.0e-6;
        var endArc = this.$oa + GMath.PI2;
        var stepArc = GMath.PI2 / this.$pts;
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
    GPolygon.prototype._handleChange = function (change, args) {
        if (change === GNode._Change.Store) {
            this.storeProperties(args, GPolygon.GeometryProperties);
        } else if (change === GNode._Change.Restore) {
            this.restoreProperties(args, GPolygon.GeometryProperties);
            this._invalidatePath();
        }

        if (this._handleGeometryChangeForProperties(change, args, GPolygon.GeometryProperties) && change == GNode._Change.AfterPropertiesChange) {
            this._invalidatePath();
        }

        GPathBase.prototype._handleChange.call(this, change, args);
    };

    /**
     * @private
     */
    GPolygon.prototype._invalidatePath = function () {
        var anchorPoints = this._getAnchorPoints();

        this.beginUpdate();
        anchorPoints._beginBlockCompositeEvents(true, true, true);
        try {
            // Clear old path points
            anchorPoints.clearChildren();

            this.iterateSegments(function (point, inside, angle) {
                var anchorPoint = new GPathBase.AnchorPoint();
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
    GPolygon.prototype.getCenter = function (includeTransform) {
        var center = new GPoint(this.$cx, this.$cy);
        if (includeTransform && this.$trf) {
            center = this.$trf.mapPoint(center);
        }
        return center;
    };

    /** @override */
    GPolygon.prototype.getOrigHalfWidth = function () {
        return this.$or >= this.$ir ? this.$or : this.$ir;
    };

    /** @override */
    GPolygon.prototype.getOrigHalfHeight = function () {
        return this.$or >= this.$ir ? this.$or : this.$ir;
    };

    /** @override */
    GPolygon.prototype._requireMiterLimitApproximation = function () {
        return true;
    };

    /** @override */
    GPolygon.prototype.toString = function () {
        return "[GPolygon]";
    };

    _.GPolygon = GPolygon;
})(this);