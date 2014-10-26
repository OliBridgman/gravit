(function (_) {
    /**
     * Drop Shadow effect
     * @class GDropShadowEffect
     * @extends GEffect
     * @constructor
     */
    GDropShadowEffect = function () {
        GEffect.call(this);
        this._setDefaultProperties(GDropShadowEffect.GeometryProperties, GDropShadowEffect.VisualProperties);
    };
    GNode.inherit('dropShadowEffect', GDropShadowEffect, GEffect);

    GDropShadowEffect.equals = function (left, right) {
        if (left instanceof GDropShadowEffect && right instanceof  GDropShadowEffect) {
            return left.arePropertiesEqual(right, Object.keys(GDropShadowEffect.GeometryProperties).concat(Object.keys(GDropShadowEffect.VisualProperties)));
        }
        return false;
    };

    /**
     * Geometry properties of a shadow effect
     */
    GDropShadowEffect.GeometryProperties = {
        /** The radius of the shadow */
        r: 5,
        /** The horizontal shift of the shadow */
        x: 0,
        /** The vertical shift of the shadow */
        y: 0
    };

    /**
     * Geometry properties of a shadow effect
     */
    GDropShadowEffect.VisualProperties = {
        /** The pattern of the shadow (GPattern) */
        pat: GRGBColor.BLACK,
        /** The opacity of the shadow */
        opc: 0.5
    };

    /** @override */
    GDropShadowEffect.prototype.getEffectType = function () {
        return GEffect.Type.PreEffect;
    };

    /** @override */
    GDropShadowEffect.prototype.getEffectPadding = function () {
        return [this.$r - this.$x, this.$r - this.$y, this.$r + this.$x, this.$r + this.$y];
    };

    /** @override */
    GDropShadowEffect.prototype.render = function (contents, output, background, scale) {
        if (this.$pat && this.$opc > 0) {
            // Fill our whole output with the shadow pattern
            var fillRect = output.getTransform(false).inverted().mapRect(new GRect(0, 0, output.getWidth(), output.getHeight()));
            var fill = output.createPatternPaint(this.$pat, fillRect);
            if (fill) {
                if (fill.transform) {
                    var oldTransform = output.setTransform(output.getTransform(true).preMultiplied(fill.transform));
                    output.fillRect(0, 0, 1, 1, fill.paint, this.$opc);
                    output.setTransform(oldTransform);
                } else {
                    output.fillRect(fillRect.getX(), fillRect.getY(), fillRect.getWidth(), fillRect.getHeight(), fill.paint, this.$opc);
                }
            }

            // Now clip with contents and blur our stuff
            var x = this.$x * scale;
            var y = this.$y * scale;
            var r = this.$r * scale;

            output.drawCanvas(contents, x, y, 1, GPaintCanvas.CompositeOperator.DestinationIn);

            if (r > 0) {
                output.getBitmap().applyFilter(GStackBlurFilter, r);
            }
        }
    };

    /** @override */
    GDropShadowEffect.prototype._handleChange = function (change, args) {
        if (change === GNode._Change.Store) {
            this.storeProperties(args, GDropShadowEffect.GeometryProperties);
            this.storeProperties(args, GDropShadowEffect.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'pat') {
                        return GPattern.serialize(value);
                    }
                }
                return value;
            });
        } else if (change === GNode._Change.Restore) {
            this.restoreProperties(args, GDropShadowEffect.GeometryProperties);
            this.restoreProperties(args, GDropShadowEffect.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'pat' && value) {
                        return GPattern.deserialize(value);
                    }
                }
                return value;
            });
        }

        this._handleGeometryChangeForProperties(change, args, GDropShadowEffect.GeometryProperties);
        this._handleVisualChangeForProperties(change, args, GDropShadowEffect.VisualProperties);

        GEffect.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GDropShadowEffect.prototype.toString = function () {
        return "[Object GDropShadowEffect]";
    };

    _.GDropShadowEffect = GDropShadowEffect;
})(this);