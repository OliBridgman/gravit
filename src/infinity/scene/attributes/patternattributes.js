(function (_) {

    /**
     * Attributes that keep a pattern information for fill / stroke / text etc.
     * @class GXPatternAttributes
     * @extends GXRenderAttributes
     * @mixes GXNode.Properties
     * @constructor
     */
    function GXPatternAttributes() {
        GXRenderAttributes.call(this);
        this._setDefaultProperties(GXPatternAttributes.VisualProperties);
    }

    GObject.inheritAndMix(GXPatternAttributes, GXRenderAttributes, [GXNode.Properties]);

    /**
     * The type of the pattern
     * @enum
     */
    GXPatternAttributes.Type = {
        /**
         * Regular color pattern
         */
        Color: 'C',

        /**
         * Linear Gradient color pattern
         */
        LinearGradient: 'L',

        /**
         * Radial Gradient color pattern
         */
        RadialGradient: 'R',

        /**
         * Texture fill
         */
        Texture: 'T'
    };

    /**
     * Checks if a given pattern type is a gradient or not
     * @param {GXPatternAttributes.Type} type
     * @returns {boolean}
     */
    GXPatternAttributes.isGradientType = function (type) {
        return type === GXPatternAttributes.Type.LinearGradient ||
            type === GXPatternAttributes.Type.RadialGradient;
    };

    /**
     * Visual properties
     */
    GXPatternAttributes.VisualProperties = {
        // Type of the pattern
        tp: GXPatternAttributes.Type.Color,
        // Composite operator of the pattern
        cmp: GXPaintCanvas.CompositeOperator.SourceOver,
        // Opacity of the pattern
        opc: 1.0,
        // Value of the pattern, depending on type
        val: new GXColor(GXColor.Type.Black),
        // Transform of the pattern in unit space
        trf: null
    };

    /** @override */
    GXPatternAttributes.prototype.store = function (blob) {
        if (GXRenderAttributes.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXPatternAttributes.VisualProperties, function (property, value) {
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
    GXPatternAttributes.prototype.restore = function (blob) {
        if (GXRenderAttributes.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXPatternAttributes.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'val') {
                        var tp = blob.hasOwnProperty('tp') ? blob.tp : GXPatternAttributes.VisualProperties.tp;
                        if (GXPatternAttributes.isGradientType(tp)) {
                            return GXGradient.parseGradient(value);
                        } else if (tp === GXPatternAttributes.Type.Color) {
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
     * Returns the pattern color
     * @return {GXColor} color
     */
    GXPatternAttributes.prototype.getColor = function () {
        if (this.$tp === GXPatternAttributes.Type.Color) {
            return this.$val;
        } else if (GXPatternAttributes.isGradientType(this.$tp)) {
            return this.$val.getStops()[0].color;
        } else {
            return null;
        }
    };

    /**
     * Assigns the pattern color
     * @param {GXColor} color
     */
    GXPatternAttributes.prototype.setColor = function (color) {
        if (this.$tp === GXPatternAttributes.Type.Color) {
            this.setProperty('val', color);
        } else if (GXPatternAttributes.isGradientType(this.$tp)) {
            var newGradient = new GXGradient(this.$val.getStops());
            newGradient.getStops()[0].color = color;
            this.setProperty('val', newGradient);
        }
    };

    /**
     * Checks whether this pattern is paintable or not
     * @return {Boolean} true if paintable, false if not
     */
    GXPatternAttributes.prototype.isPaintable = function () {
        // TODO : Check for transparencies and more
        return !!this.$val;
    };

    /**
     * Creates and returns a paintable pattern
     * @param {GXPaintContext} context the context used for
     * creating the pattern
     * @param {GRect} bbox the bounding box to be used
     * @return {*} a canvas-specific fill pattern or null if
     * there's no fill available
     * @private
     */
    GXPatternAttributes.prototype._createPaintPattern = function (context, bbox) {
        if (this.$val) {
            if (this.$tp === GXPatternAttributes.Type.Color) {
                return this.$val;
            } else if (this.$tp === GXPatternAttributes.Type.LinearGradient) {
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
    GXPatternAttributes.prototype._handleChange = function (change, args) {
        this._handleVisualChangeForProperties(change, args, GXPatternAttributes.VisualProperties);
        GXRenderAttributes.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GXPatternAttributes.prototype.toString = function () {
        return "[GXPatternAttributes]";
    };

    _.GXPatternAttributes = GXPatternAttributes;
})(this);