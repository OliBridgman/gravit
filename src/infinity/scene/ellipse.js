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
        se: Math.PI,
        /** The ellipse-type */
        tp: GXEllipse.Type.Pie
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
        // TODO : Correctly create bezier-based PIE/CHORD/ARC using approx. four bezier curves (see Freehand and convert to path) + make sa/se angles compatible to freehand
        this.beginUpdate();
        this._firstChild.clearChildren();

        // TODO : REMOVE THAT OBSOLETE RECT CODE WHEN DONE
        var anchorPoint = new GXPathBase.AnchorPoint();
        anchorPoint.setProperties(['x', 'y'], [0, 0]);
        this._firstChild.appendChild(anchorPoint, false);
        anchorPoint = new GXPathBase.AnchorPoint();
        anchorPoint.setProperties(['x', 'y'], [1, 0]);
        this._firstChild.appendChild(anchorPoint, false);
        anchorPoint = new GXPathBase.AnchorPoint();
        anchorPoint.setProperties(['x', 'y'], [1, 1]);
        this._firstChild.appendChild(anchorPoint, false);
        anchorPoint = new GXPathBase.AnchorPoint();
        anchorPoint.setProperties(['x', 'y'], [0, 1]);
        this._firstChild.appendChild(anchorPoint, false);

        this.endUpdate();
    };

    /** @override */
    GXEllipse.prototype.toString = function () {
        return "[GXEllipse]";
    };

    _.GXEllipse = GXEllipse;
})(this);