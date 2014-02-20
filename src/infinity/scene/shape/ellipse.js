(function (_) {

    /**
     * An ellipse shape
     * @class GXEllipse
     * @extends GXPathBase
     * @constructor
     */
    function GXEllipse() {
        GXPathBase.call(this);
        this._setDefaultProperties(GXEllipse.GeometryProperties);
        this._invalidatePath(); // create unit path
    }

    GXNode.inherit("ellipse", GXEllipse, GXPathBase);

    /**
     * Various types for an ellipse
     * @enum
     * @version 1.0
     */
    GXEllipse.Type = {
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
    GXEllipse.GeometryProperties = {
        /** The start angle */
        sa: Math.PI,
        /** The end angle */
        ea: Math.PI,
        /** The ellipse-type */
        etp: GXEllipse.Type.Pie
    };

    /** @override */
    GXEllipse.prototype.store = function (blob) {
        if (GXPathBase.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXEllipse.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXEllipse.prototype.restore = function (blob) {
        if (GXPathBase.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXEllipse.GeometryProperties);

            this._invalidatePath();

            return true;
        }
        return false;
    };

    /** @override */
    GXEllipse.prototype._handleChange = function (change, args) {
        if (this._handleGeometryChangeForProperties(change, args, GXEllipse.GeometryProperties) && change == GXNode._Change.AfterPropertiesChange) {
            this._invalidatePath();
        }
        GXPathBase.prototype._handleChange.call(this, change, args);
    };

    /**
     * @private
     */
    GXEllipse.prototype._invalidatePath = function () {
        this.beginUpdate();
        this._getAnchorPoints().clearChildren();

        var an;
        for (an = Math.PI / 2; an <= this.$sa || gMath.isEqualEps(an, this.$sa); an += Math.PI / 2) {}

        var anchorPoint = new GXPathBase.AnchorPoint();
        anchorPoint.setProperties(['x', 'y', 'tp', 'ah'], [Math.cos(this.$sa), Math.sin(this.$sa), 'S', true]);
        this._getAnchorPoints().appendChild(anchorPoint, false);

        var ea = gMath.isEqualEps(this.$sa, this.$ea) ? this.$sa + gMath.PI2 : this.$ea;
        if (ea < this.$sa) {
            ea += gMath.PI2;
        }

        for (an; an < ea && !gMath.isEqualEps(an, ea); an += Math.PI / 2) {
            anchorPoint = new GXPathBase.AnchorPoint();
            anchorPoint.setProperties(['x', 'y', 'tp', 'ah'], [Math.cos(an), Math.sin(an), 'S', true]);
            this._getAnchorPoints().appendChild(anchorPoint, false);
        }

        if (!gMath.isEqualEps(this.$sa + gMath.PI2, ea)) {
            anchorPoint = new GXPathBase.AnchorPoint();
            anchorPoint.setProperties(['x', 'y', 'tp', 'ah'], [Math.cos(ea), Math.sin(ea), 'S', true]);
            this._getAnchorPoints().appendChild(anchorPoint, false);
        }

        var extraPoint = null;
        if (this._getAnchorPoints().getFirstChild().getNext() == this._getAnchorPoints().getLastChild()) {
            // We have only two anchor points, so add one for proper auto-handles, making rounded shape,
            // and then switch of auto-handles and remove that extra point
            anchorPoint = new GXPathBase.AnchorPoint();
            if (gMath.isEqualEps(an, ea)) {
                an += Math.PI / 2;
            }
            anchorPoint.setProperties(['x', 'y', 'tp', 'ah'], [Math.cos(an), Math.sin(an), 'S', true]);
            this._getAnchorPoints().appendChild(anchorPoint, false);
            extraPoint = anchorPoint;
        }

        this.setProperty('closed', true);

        for (var ap = this._getAnchorPoints().getFirstChild(); ap != null; ap = ap.getNext()) {
            ap.setProperty('ah', false);
        }

        if (extraPoint) {
            this._getAnchorPoints().removeChild(extraPoint);
        }

        if (!gMath.isEqualEps(this.$sa + gMath.PI2, ea)) {
            this._getAnchorPoints().getFirstChild().setProperties(['tp', 'hlx', 'hly'], ['N', null, null]);
            this._getAnchorPoints().getLastChild().setProperties(['tp', 'hrx', 'hry'], ['N', null, null]);
            if (this.$etp == GXEllipse.Type.Pie) {
                anchorPoint = new GXPathBase.AnchorPoint();
                this._getAnchorPoints().appendChild(anchorPoint, false);
            } else if (this.$etp == GXEllipse.Type.Arc) {
                this.setProperty('closed', false);
            }
        }

        this.endUpdate();
    };

    /** @override */
    GXEllipse.prototype.toString = function () {
        return "[GXEllipse]";
    };

    _.GXEllipse = GXEllipse;
})(this);