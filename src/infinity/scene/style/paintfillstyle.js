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
         * Linear Gradient color fill
         */
        LinearGradient: 'L',

        /**
         * Radial Gradient color fill
         */
        RadialGradient: 'R',

        /**
         * Pattern fill
         */
        Pattern: 'P'
    };

    /**
     * Checks if a given fill type is a gradient or not
     * @param {GXPaintFillStyle.Type} type
     * @returns {boolean}
     */
    GXPaintFillStyle.isGradientType = function (type) {
        return type === GXPaintFillStyle.Type.LinearGradient ||
            type === GXPaintFillStyle.Type.RadialGradient;
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
        // Value of the fill, depending on type
        val: new GXColor(GXColor.Type.Black),
        // Transform of the fill in unit space
        trf: null
    };

    /** @override */
    GXPaintFillStyle.prototype.store = function (blob) {
        if (GXPaintStyle.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXPaintFillStyle.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'val') {
                        if (value instanceof GXColor) {
                            return value.asString();
                        } else if (value instanceof GXGradient) {
                            return value.asString();
                        } else {
                            // TODO
                            throw new Error('Unsupported.');
                        }
                    } else if (property === 'trf') {
                        return GTransform.serialize(value);
                    }
                }
                return value;
            }.bind(this));
            return true;
        }
        return false;
    };

    /** @override */
    GXPaintFillStyle.prototype.restore = function (blob) {
        if (GXPaintStyle.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXPaintFillStyle.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'val') {
                        var tp = blob.hasOwnProperty('tp') ? blob.tp : GXPaintFillStyle.VisualProperties.tp;
                        if (GXPaintFillStyle.isGradientType(tp)) {
                            return GXGradient.parseGradient(value);
                        } else if (tp === GXPaintFillStyle.Type.Color) {
                            return GXColor.parseColor(value);
                        } else{
                        // TODO
                                throw new Error('Unsupported.');/**/
                        }
                    } else if (property === 'trf') {
                        return GTransform.deserialize(value);
                    }
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
            return this.$val;
        } else if (GXPaintFillStyle.isGradientType(this.$tp)) {
            return this.$val.getStops()[0].color;
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
            this.setProperty('val', color);
        } else if (GXPaintFillStyle.isGradientType(this.$tp)) {
            var newGradient = new GXGradient(this.$val.getStops());
            newGradient.getStops()[0].color = color;
            this.setProperty('val', newGradient);
        }
    };

    /**
     * Checks whether this style has a paintable fill. Invalid or
     * completely transparent fills are considered to be not paintable.
     */
    GXPaintFillStyle.prototype.hasPaintableFill = function () {
        // TODO : Check for transparencies and more
        return !!this.$val;
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