(function (_) {

    /**
     * An ellipse shape
     * @class GEllipse
     * @extends GPathBase
     * @constructor
     */
    function GEllipse() {
        GPathBase.call(this);
        this._setDefaultProperties(GEllipse.GeometryProperties);
        this._invalidatePath(); // create unit path
    }

    GNode.inherit("ellipse", GEllipse, GPathBase);

    /**
     * Various types for an ellipse
     * @enum
     * @version 1.0
     */
    GEllipse.Type = {
        /**
         * Pie (center-closed ellipse) type
         * @type {Number}
         * @version 1.0
         */
        Pie: 0,

        /**
         * Chord (closed ellipse) type
         * @type {Number}
         * @version 1.0
         */
        Chord: 1,

        /**
         * Arc (opened ellipse) type
         * @type {Number}
         * @version 1.0
         */
        Arc: 2
    };

    /**
     * The geometry properties of an ellipse with their default values
     */
    GEllipse.GeometryProperties = {
        /** The start angle */
        sa: Math.PI,
        /** The end angle */
        ea: Math.PI,
        /** The ellipse-type */
        etp: GEllipse.Type.Pie
    };

    /** @override */
    GEllipse.prototype._handleChange = function (change, args) {
        if (change === GNode._Change.Store) {
            this.storeProperties(args, GEllipse.GeometryProperties);
        } else if (change === GNode._Change.Restore) {
            this.restoreProperties(args, GEllipse.GeometryProperties);
            this._invalidatePath();
        }

        if (this._handleGeometryChangeForProperties(change, args, GEllipse.GeometryProperties) && change == GNode._Change.AfterPropertiesChange) {
            this._invalidatePath();
        }

        GPathBase.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GEllipse.prototype._calculateOrigGeometryBBox = function () {
        if (GMath.isEqualEps(this.$sa, this.$ea)) {
            return new GRect(-1, -1, 2, 2);
        } else {
            return GPathBase.prototype._calculateOrigGeometryBBox.call(this);
        }
    };

    /**
     * @private
     */
    GEllipse.prototype._invalidatePath = function () {
        var anchorPoints = this._getAnchorPoints();

        this.beginUpdate();
        anchorPoints._beginBlockCompositeEvents(true, true, true);
        try {
            // Clear old path points
            anchorPoints.clearChildren();

            var an;
            for (an = Math.PI / 2; an <= this.$sa || GMath.isEqualEps(an, this.$sa); an += Math.PI / 2) {
            }

            var anchorPoint = new GPathBase.AnchorPoint();
            anchorPoint.setProperties(['x', 'y', 'tp', 'ah'], [Math.cos(this.$sa), Math.sin(this.$sa), GPathBase.AnchorPoint.Type.Symmetric, true]);
            anchorPoints.appendChild(anchorPoint);

            var ea = GMath.isEqualEps(this.$sa, this.$ea) ? this.$sa + GMath.PI2 : this.$ea;
            if (ea < this.$sa) {
                ea += GMath.PI2;
            }

            for (an; an < ea && !GMath.isEqualEps(an, ea); an += Math.PI / 2) {
                anchorPoint = new GPathBase.AnchorPoint();
                anchorPoint.setProperties(['x', 'y', 'tp', 'ah'], [Math.cos(an), Math.sin(an), GPathBase.AnchorPoint.Type.Symmetric, true]);
                anchorPoints.appendChild(anchorPoint);
            }

            if (!GMath.isEqualEps(this.$sa + GMath.PI2, ea)) {
                anchorPoint = new GPathBase.AnchorPoint();
                anchorPoint.setProperties(['x', 'y', 'tp', 'ah'], [Math.cos(ea), Math.sin(ea), GPathBase.AnchorPoint.Type.Symmetric, true]);
                anchorPoints.appendChild(anchorPoint);
            }

            var extraPoint = null;
            if (anchorPoints.getFirstChild().getNext() == anchorPoints.getLastChild()) {
                // We have only two anchor points, so add one for proper auto-handles, making rounded shape,
                // and then switch off auto-handles and remove that extra point
                anchorPoint = new GPathBase.AnchorPoint();
                if (GMath.isEqualEps(an, ea)) {
                    an += Math.PI / 2;
                }
                anchorPoint.setProperties(['x', 'y', 'tp', 'ah'], [Math.cos(an), Math.sin(an), GPathBase.AnchorPoint.Type.Symmetric, true]);
                anchorPoints.appendChild(anchorPoint);
                extraPoint = anchorPoint;
            }

            this.setProperty('closed', true);
            for (var ap = anchorPoints.getFirstChild(); ap != null; ap = ap.getNext()) {
                // Don't change auto-handles to true here! They must be true at first to be calculated properly for
                // good rounded arc, but then they must be set to false, as they should not be affected with the
                // rest changes
                ap.setProperty('ah', false);
            }

            if (extraPoint) {
                anchorPoints.removeChild(extraPoint);
            }

            if (!GMath.isEqualEps(this.$sa + GMath.PI2, ea)) {
                anchorPoints.getFirstChild().setProperties(['tp', 'hlx', 'hly'], [GPathBase.AnchorPoint.Type.Asymmetric, null, null]);
                anchorPoints.getLastChild().setProperties(['tp', 'hrx', 'hry'], [GPathBase.AnchorPoint.Type.Asymmetric, null, null]);

                if (this.$etp == GEllipse.Type.Pie) {
                    anchorPoint = new GPathBase.AnchorPoint();
                    anchorPoints.appendChild(anchorPoint);
                } else if (this.$etp == GEllipse.Type.Arc) {
                    this.setProperty('closed', false);
                }
            }
        } finally {
            this.endUpdate();
            anchorPoints._endBlockCompositeEvents(true, true, true);
        }
    };

    /** @override */
    GEllipse.prototype.toString = function () {
        return "[GEllipse]";
    };

    _.GEllipse = GEllipse;
})(this);