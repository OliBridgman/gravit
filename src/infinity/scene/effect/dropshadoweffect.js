(function (_) {
    /**
     * Drop Shadow effect
     * @class IFDropShadowEffect
     * @extends IFEffect
     * @constructor
     */
    IFDropShadowEffect = function () {
        IFEffect.call(this);
        this._setDefaultProperties(IFDropShadowEffect.GeometryProperties, IFDropShadowEffect.VisualProperties);
    };
    IFNode.inherit('dropShadowEffect', IFDropShadowEffect, IFEffect);

    IFDropShadowEffect.equals = function (left, right) {
        if (left instanceof IFDropShadowEffect && right instanceof  IFDropShadowEffect) {
            return left.arePropertiesEqual(right, Object.keys(IFDropShadowEffect.GeometryProperties).concat(Object.keys(IFDropShadowEffect.VisualProperties)));
        }
        return false;
    };

    /**
     * Geometry properties of a shadow effect
     */
    IFDropShadowEffect.GeometryProperties = {
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
    IFDropShadowEffect.VisualProperties = {
        /** The pattern of the shadow (IFPattern) */
        pat: IFRGBColor.BLACK,
        /** The opacity of the shadow */
        opc: 0.5
    };

    /** @override */
    IFDropShadowEffect.prototype.getEffectType = function () {
        return IFEffect.Type.PreEffect;
    };

    /** @override */
    IFDropShadowEffect.prototype.getEffectPadding = function () {
        return [this.$r - this.$x, this.$r - this.$y, this.$r + this.$x, this.$r + this.$y];
    };

    /** @override */
    IFDropShadowEffect.prototype.render = function (contents, output, background, scale) {
        if (this.$pat && this.$opc > 0) {
            // Fill our whole output with the shadow pattern
            var fillRect = output.getTransform(false).inverted().mapRect(new IFRect(0, 0, output.getWidth(), output.getHeight()));
            var fill = this.$pat.createPaint(output, fillRect);
            if (fill && fill.paint) {
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

            output.drawCanvas(contents, x, y, 1, IFPaintCanvas.CompositeOperator.DestinationIn);

            if (r > 0) {
                output.getBitmap().applyFilter(IFStackBlurFilter, r);
            }
        }
    };

    /** @override */
    IFDropShadowEffect.prototype._handleChange = function (change, args) {
        if (change === IFNode._Change.Store) {
            this.storeProperties(args, IFDropShadowEffect.GeometryProperties);
            this.storeProperties(args, IFDropShadowEffect.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'pat') {
                        return IFPattern.serialize(value);
                    }
                }
                return value;
            });
        } else if (change === IFNode._Change.Restore) {
            this.restoreProperties(args, IFDropShadowEffect.GeometryProperties);
            this.restoreProperties(args, IFDropShadowEffect.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'pat' && value) {
                        return IFPattern.deserialize(value);
                    }
                }
                return value;
            });
        }

        this._handleGeometryChangeForProperties(change, args, IFDropShadowEffect.GeometryProperties);
        this._handleVisualChangeForProperties(change, args, IFDropShadowEffect.VisualProperties);

        IFEffect.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFDropShadowEffect.prototype.toString = function () {
        return "[Object IFDropShadowEffect]";
    };

    _.IFDropShadowEffect = IFDropShadowEffect;
})(this);