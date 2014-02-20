(function (_) {

    /**
     * A basic fill paint style
     * @class GXPaintFillStyle
     * @extends GXPaintStyle
     * @mixes GXNode.Properties
     * @constructor
     */
    function GXPaintFillStyle() {
        GXPaintStyle.call(this);
        this._setDefaultProperties(GXPaintFillStyle.VisualProperties);
    }

    GObject.inheritAndMix(GXPaintFillStyle, GXPaintStyle, [GXNode.Properties]);

    /**
     * Visual properties of a fill style
     */
    GXPaintFillStyle.VisualProperties = {
        // Filling (GXColor | GXSwatch)
        fill: null
    };

    /** @override */
    GXPaintFillStyle.prototype.store = function (blob) {
        if (GXPaintStyle.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXPaintFillStyle.VisualProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXPaintFillStyle.prototype.restore = function (blob) {
        if (GXPaintStyle.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXPaintFillStyle.VisualProperties, true);
            return true;
        }
        return false;
    };

    /**
     * Checks whether this style has a paintable fill. Invalid or
     * completely transparent fills are considered to be not paintable.
     */
    GXPaintFillStyle.prototype.hasPaintableFill = function () {
        if (!this.$fill) {
            return false;
        }

        // TODO : Check for validity, transparency, etc.

        return true;
    };

    /** @override */
    GXPaintFillStyle.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, GXPaintFillStyle.VisualProperties);
        GXPaintStyle.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GXPaintFillStyle.prototype.toString = function () {
        return "[GXPaintFillStyle]";
    };


    _.GXPaintFillStyle = GXPaintFillStyle;
})(this);