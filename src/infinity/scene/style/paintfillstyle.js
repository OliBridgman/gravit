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
     * The type of a fill
     * @enum
     */
    GXPaintFillStyle.Type = {
        /**
         * Regular color fill
         */
        Color: 'C',

        /**
         * Gradient color fill
         */
        Gradient: 'G',

        /**
         * Pattern fill
         */
        Pattern: 'P'
    };

    /**
     * The type of a gradient
     * @enum
     */
    GXPaintFillStyle.GradientType = {
        /**
         * Linear Gradient
         */
        Linear: 'L',

        /**
         * Radial Gradient
         */
        Radial: 'R'
    };

    /**
     * Visual properties of a fill style
     */
    GXPaintFillStyle.VisualProperties = {
        // Type of the fill
        tp: GXPaintFillStyle.Type.Color,
        // Composite operator of the fill
        cmp: GXPaintCanvas.CompositeOperator.SourceOver,
        // Opacity of the fill
        opc: 1.0,
        // Color of the fill
        cls: null,
        // Stop Offsets of the gradient
        gd_off: null,
        // Stop Colors of the fill
        gd_cls: null
    };

    /** @override */
    GXPaintFillStyle.prototype.store = function (blob) {
        if (GXPaintStyle.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXPaintFillStyle.VisualProperties, function (property, value) {
                if (property === 'cls' && value) {
                    return value.asString();
                } else if (property === 'gd_cls') {
                    // TODO
                }
                return value;
            });
            return true;
        }
        return false;
    };

    /** @override */
    GXPaintFillStyle.prototype.restore = function (blob) {
        if (GXPaintStyle.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXPaintFillStyle.VisualProperties, function (property, value) {
                if (property === 'cls' && value) {
                    return GXColor.parseColor(value);
                } else if (property === 'gd_cls') {
                    // TODO
                }
                return value;
            });
            return true;
        }
        return false;
    };

    /**
     * Returns the fill color
     * @return {GXColor} color
     */
    GXPaintFillStyle.prototype.getColor = function () {
        if (this.$tp === GXPaintFillStyle.Type.Color) {
            return this.$cls;
        } else if (this.$tp === GXPaintFillStyle.Type.Gradient) {
            return this.$gd_cls && this.$gd_cls.length > 0 ? this.$gd_cls[0] : null;
        } else {
            return null;
        }
    };

    /**
     * Assigns the fill color
     * @param {GXColor} color
     */
    GXPaintFillStyle.prototype.setColor = function (color) {
        if (this.$tp === GXPaintFillStyle.Type.Color) {
            this.setProperty('cls', color);
        } else if (this.$tp === GXPaintFillStyle.Type.Gradient) {
            var gd_cls = this.$gd_cls && this.$gd_cls.length > 0 ? this.$gd_cls.slice() : [null];
            gd_cls[0] = color;
            this.setProperty('gd_cls', gd_cls);
        }
    };

    /**
     * Checks whether this style has a paintable fill. Invalid or
     * completely transparent fills are considered to be not paintable.
     */
    GXPaintFillStyle.prototype.hasPaintableFill = function () {
        // TODO : Check for transparencies
        if (this.$tp === GXPaintFillStyle.Type.Color) {
            return !!this.$cls;
        } else if (this.$tp === GXPaintFillStyle.Type.Gradient) {
            return this.$gd_cls && this.$gd_cls.length > 0;
        } else {
            return false;
        }
    };

    /** @override */
    GXPaintFillStyle.prototype._handleChange = function (change, args) {
        this._handleVisualChangeForProperties(change, args, GXPaintFillStyle.VisualProperties);
        GXPaintStyle.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GXPaintFillStyle.prototype.toString = function () {
        return "[GXPaintFillStyle]";
    };


    _.GXPaintFillStyle = GXPaintFillStyle;
})(this);