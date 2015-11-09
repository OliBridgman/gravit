(function (_) {
    /**
     * Inner Shadow effect
     * @class GInnerShadowEffect
     * @extends GEffect
     * @constructor
     */
    GInnerShadowEffect = function () {
        GEffect.call(this);
        this._setDefaultProperties(GInnerShadowEffect.GeometryProperties, GInnerShadowEffect.VisualProperties);
    };
    GNode.inherit('innerShadowEffect', GInnerShadowEffect, GEffect);

    GInnerShadowEffect.equals = function (left, right) {
        if (left instanceof GInnerShadowEffect && right instanceof  GInnerShadowEffect) {
            return left.arePropertiesEqual(right, Object.keys(GInnerShadowEffect.GeometryProperties).concat(Object.keys(GInnerShadowEffect.VisualProperties)));
        }
        return false;
    };

    /**
     * Geometry properties of a shadow effect
     */
    GInnerShadowEffect.GeometryProperties = {
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
    GInnerShadowEffect.VisualProperties = {
        /** The color of the shadow */
        pat: GRGBColor.BLACK,
        /** The opacity of the shadow */
        opc: 0.5
    };

    /** @override */
    GInnerShadowEffect.prototype.getEffectType = function () {
        return GEffect.Type.PostEffect;
    };

    /** @override */
    GInnerShadowEffect.prototype.getEffectPadding = function () {
        return [this.$r - this.$x, this.$r - this.$y, this.$r + this.$x, this.$r + this.$y];
    };

    /** @override */
    GInnerShadowEffect.prototype.render = function (contents, output, background, scale) {
        if (this.$pat && this.$opc > 0 && this.$r > 0) {
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

            // Clip with contents and blur
            var x = this.$x * scale;
            var y = this.$y * scale;
            var r = this.$r * scale;

            output.drawCanvas(contents, x, y, 1, GPaintCanvas.CompositeOperator.DestinationOut);
            output.getBitmap().applyFilter(GStackBlurFilter, r);
            output.drawCanvas(contents, 0, 0, 1, GPaintCanvas.CompositeOperator.DestinationIn);
        }
    };

    /** @override */
    GInnerShadowEffect.prototype._handleChange = function (change, args) {
        if (change === GNode._Change.Store) {
            this.storeProperties(args, GInnerShadowEffect.GeometryProperties);
            this.storeProperties(args, GInnerShadowEffect.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'pat') {
                        return GPattern.serialize(value);
                    }
                }
                return value;
            });
        } else if (change === GNode._Change.Restore) {
            this.restoreProperties(args, GInnerShadowEffect.GeometryProperties);
            this.restoreProperties(args, GInnerShadowEffect.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'pat') {
                        return GPattern.deserialize(value);
                    }
                }
                return value;
            });
        }

        this._handleGeometryChangeForProperties(change, args, GInnerShadowEffect.GeometryProperties);
        this._handleVisualChangeForProperties(change, args, GInnerShadowEffect.VisualProperties);

        GEffect.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GInnerShadowEffect.prototype.toString = function () {
        return "[Object GInnerShadowEffect]";
    };

    _.GInnerShadowEffect = GInnerShadowEffect;
})(this);