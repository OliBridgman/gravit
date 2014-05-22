(function (_) {

    /**
     * An ellipse shape
     * @class IFEllipse
     * @extends IFPathBase
     * @constructor
     */
    function IFEllipse() {
        IFPathBase.call(this);
        this._setDefaultProperties(IFEllipse.GeometryProperties);
        this._invalidatePath(); // create unit path
    }

    IFNode.inherit("ellipse", IFEllipse, IFPathBase);

    /**
     * Various types for an ellipse
     * @enum
     * @version 1.0
     */
    IFEllipse.Type = {
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
    IFEllipse.GeometryProperties = {
        /** The start angle */
        sa: Math.PI,
        /** The end angle */
        ea: Math.PI,
        /** The ellipse-type */
        etp: IFEllipse.Type.Pie
    };

    /** @override */
    IFEllipse.prototype.store = function (blob) {
        if (IFPathBase.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFEllipse.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFEllipse.prototype.restore = function (blob) {
        if (IFPathBase.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFEllipse.GeometryProperties);

            this._invalidatePath();

            return true;
        }
        return false;
    };

    /** @override */
    IFEllipse.prototype._handleChange = function (change, args) {
        if (this._handleGeometryChangeForProperties(change, args, IFEllipse.GeometryProperties) && change == IFNode._Change.AfterPropertiesChange) {
            this._invalidatePath();
        }
        IFPathBase.prototype._handleChange.call(this, change, args);
    };

    /**
     * @private
     */
    IFEllipse.prototype._invalidatePath = function () {
        var anchorPoints = this._getAnchorPoints();

        this.beginUpdate();
        anchorPoints._beginBlockCompositeEvents(true, true, true);
        try {
            // Clear old path points
            anchorPoints.clearChildren();

            var an;
            for (an = Math.PI / 2; an <= this.$sa || ifMath.isEqualEps(an, this.$sa); an += Math.PI / 2) {
            }

            var anchorPoint = new IFPathBase.AnchorPoint();
            anchorPoint.setProperties(['x', 'y', 'tp', 'ah'], [Math.cos(this.$sa), Math.sin(this.$sa), IFPathBase.AnchorPoint.Type.Symmetric, true]);
            anchorPoints.appendChild(anchorPoint);

            var ea = ifMath.isEqualEps(this.$sa, this.$ea) ? this.$sa + ifMath.PI2 : this.$ea;
            if (ea < this.$sa) {
                ea += ifMath.PI2;
            }

            for (an; an < ea && !ifMath.isEqualEps(an, ea); an += Math.PI / 2) {
                anchorPoint = new IFPathBase.AnchorPoint();
                anchorPoint.setProperties(['x', 'y', 'tp', 'ah'], [Math.cos(an), Math.sin(an), IFPathBase.AnchorPoint.Type.Symmetric, true]);
                anchorPoints.appendChild(anchorPoint);
            }

            if (!ifMath.isEqualEps(this.$sa + ifMath.PI2, ea)) {
                anchorPoint = new IFPathBase.AnchorPoint();
                anchorPoint.setProperties(['x', 'y', 'tp', 'ah'], [Math.cos(ea), Math.sin(ea), IFPathBase.AnchorPoint.Type.Symmetric, true]);
                anchorPoints.appendChild(anchorPoint);
            }

            var extraPoint = null;
            if (anchorPoints.getFirstChild().getNext() == anchorPoints.getLastChild()) {
                // We have only two anchor points, so add one for proper auto-handles, making rounded shape,
                // and then switch off auto-handles and remove that extra point
                anchorPoint = new IFPathBase.AnchorPoint();
                if (ifMath.isEqualEps(an, ea)) {
                    an += Math.PI / 2;
                }
                anchorPoint.setProperties(['x', 'y', 'tp', 'ah'], [Math.cos(an), Math.sin(an), IFPathBase.AnchorPoint.Type.Symmetric, true]);
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

            if (!ifMath.isEqualEps(this.$sa + ifMath.PI2, ea)) {
                anchorPoints.getFirstChild().setProperties(['tp', 'hlx', 'hly'], [IFPathBase.AnchorPoint.Type.Asymmetric, null, null]);
                anchorPoints.getLastChild().setProperties(['tp', 'hrx', 'hry'], [IFPathBase.AnchorPoint.Type.Asymmetric, null, null]);

                if (this.$etp == IFEllipse.Type.Pie) {
                    anchorPoint = new IFPathBase.AnchorPoint();
                    anchorPoints.appendChild(anchorPoint);
                } else if (this.$etp == IFEllipse.Type.Arc) {
                    this.setProperty('closed', false);
                }
            }
        } finally {
            this.endUpdate();
            anchorPoints._endBlockCompositeEvents(true, true, true);
        }
    };

    /** @override */
    IFEllipse.prototype.toString = function () {
        return "[IFEllipse]";
    };

    _.IFEllipse = IFEllipse;
})(this);