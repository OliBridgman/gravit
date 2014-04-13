(function (_) {

    /**
     * A base paint style that contains the base for filling/stroking
     * @class GXPaintStyle
     * @extends GXStyle
     * @mixes GXNode.Properties
     * @constructor
     */
    function GXPaintStyle() {
        GXStyle.call(this);
        this._setDefaultProperties(GXPaintStyle.VisualProperties);
    }

    GObject.inheritAndMix(GXPaintStyle, GXStyle, [GXNode.Properties]);

    /** @override */
    GXPaintStyle.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GXStyleSet || parent instanceof GXVectorStyle;
    };

    /**
     * The type of a fill
     * @enum
     */
    GXPaintStyle.Type = {
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
     * @param {GXPaintStyle.Type} type
     * @returns {boolean}
     */
    GXPaintStyle.isGradientType = function (type) {
        return type === GXPaintStyle.Type.LinearGradient ||
            type === GXPaintStyle.Type.RadialGradient;
    };

    /**
     * Visual properties of a fill style
     */
    GXPaintStyle.VisualProperties = {
        // Type of the fill
        tp: GXPaintStyle.Type.Color,
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
    GXPaintStyle.prototype.store = function (blob) {
        if (GXStyle.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXPaintStyle.VisualProperties, function (property, value) {
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
    GXPaintStyle.prototype.restore = function (blob) {
        if (GXStyle.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXPaintStyle.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'val') {
                        var tp = blob.hasOwnProperty('tp') ? blob.tp : GXPaintStyle.VisualProperties.tp;
                        if (GXPaintStyle.isGradientType(tp)) {
                            return GXGradient.parseGradient(value);
                        } else if (tp === GXPaintStyle.Type.Color) {
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
    GXPaintStyle.prototype.getColor = function () {
        if (this.$tp === GXPaintStyle.Type.Color) {
            return this.$val;
        } else if (GXPaintStyle.isGradientType(this.$tp)) {
            return this.$val.getStops()[0].color;
        } else {
            return null;
        }
    };

    /**
     * Assigns the fill color
     * @param {GXColor} color
     */
    GXPaintStyle.prototype.setColor = function (color) {
        if (this.$tp === GXPaintStyle.Type.Color) {
            this.setProperty('val', color);
        } else if (GXPaintStyle.isGradientType(this.$tp)) {
            var newGradient = new GXGradient(this.$val.getStops());
            newGradient.getStops()[0].color = color;
            this.setProperty('val', newGradient);
        }
    };

    /**
     * Checks whether this style has a paintable fill. Invalid or
     * completely transparent fills are considered to be not paintable.
     */
    GXPaintStyle.prototype.hasPaintableFill = function () {
        // TODO : Check for transparencies and more
        return !!this.$val;
    };

    /**
     * Creates and returns a fill pattern for this fill.
     * @param {GXPaintContext} context the context used for
     * creating the fill
     * @param {GRect} bbox the bounding box to be used
     * @return {*} a canvas-specific fill pattern or null if
     * there's no fill available
     * @private
     */
    GXPaintStyle.prototype._createFillPattern = function (context, bbox) {
        if (this.$val) {
            if (this.$tp === GXPaintStyle.Type.Color) {
                return this.$val;
            } else if (this.$tp === GXPaintStyle.Type.LinearGradient) {
                var x1 = bbox.getX();
                var y1 = bbox.getY();
                var x2 = x1 + bbox.getWidth();
                var y2 = y1;// + bbox.getHeight();

                return context.canvas.createLinearGradient(x1, y1, x2, y2, this.$val);
            }
        }
        return null;
    };

    /** @override */
    GXPaintStyle.prototype._handleChange = function (change, args) {
        this._handleVisualChangeForProperties(change, args, GXPaintStyle.VisualProperties);
        GXStyle.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GXPaintStyle.prototype.toString = function () {
        return "[GXPaintStyle]";
    };

    _.GXPaintStyle = GXPaintStyle;
})(this);