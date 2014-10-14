(function (_) {
    /**
     * Inner Shadow effect
     * @class IFInnerShadowEffect
     * @extends IFEffect
     * @constructor
     */
    IFInnerShadowEffect = function () {
        IFEffect.call(this);
        this._setDefaultProperties(IFInnerShadowEffect.GeometryProperties, IFInnerShadowEffect.VisualProperties);
    };
    IFNode.inherit('innerShadowEffect', IFInnerShadowEffect, IFEffect);

    IFInnerShadowEffect.equals = function (left, right) {
        if (left instanceof IFInnerShadowEffect && right instanceof  IFInnerShadowEffect) {
            return left.arePropertiesEqual(right, Object.keys(IFInnerShadowEffect.GeometryProperties).concat(Object.keys(IFInnerShadowEffect.VisualProperties)));
        }
        return false;
    };

    /**
     * Geometry properties of a shadow effect
     */
    IFInnerShadowEffect.GeometryProperties = {
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
    IFInnerShadowEffect.VisualProperties = {
        /** The color of the shadow */
        cls: IFRGBColor.BLACK,
        /** The opacity of the shadow */
        opc: 0.5
    };

    /** @override */
    IFInnerShadowEffect.prototype.getEffectType = function () {
        return IFEffect.Type.PostEffect;
    };

    /** @override */
    IFInnerShadowEffect.prototype.getEffectPadding = function () {
        return [this.$r - this.$x, this.$r - this.$y, this.$r + this.$x, this.$r + this.$y];
    };

    /** @override */
    IFInnerShadowEffect.prototype.render = function (contents, output, background, scale) {
        if (this.$opc > 0) {
            // Fill our whole output with the shadow color
            output.fillCanvas(this.$cls);

            var x = this.$x * scale;
            var y = this.$y * scale;
            var r = this.$r * scale;

            output.drawCanvas(contents, x, y, 1, IFPaintCanvas.CompositeOperator.DestinationOut);
            output.getBitmap().applyFilter(IFStackBlurFilter, r);
            output.drawCanvas(contents, 0, 0, 1, IFPaintCanvas.CompositeOperator.DestinationIn);
        }
    };

    /** @override */
    IFInnerShadowEffect.prototype._handleChange = function (change, args) {
        if (change === IFNode._Change.Store) {
            this.storeProperties(args, IFInnerShadowEffect.GeometryProperties);
            this.storeProperties(args, IFInnerShadowEffect.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'cls') {
                        return IFPattern.serialize(value);
                    }
                }
                return value;
            });
        } else if (change === IFNode._Change.Restore) {
            this.restoreProperties(args, IFInnerShadowEffect.GeometryProperties);
            this.restoreProperties(args, IFInnerShadowEffect.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'cls') {
                        return IFPattern.deserialize(value);
                    }
                }
                return value;
            });
        }

        this._handleGeometryChangeForProperties(change, args, IFInnerShadowEffect.GeometryProperties);
        this._handleVisualChangeForProperties(change, args, IFInnerShadowEffect.VisualProperties);

        IFEffect.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFInnerShadowEffect.prototype.toString = function () {
        return "[Object IFInnerShadowEffect]";
    };

    _.IFInnerShadowEffect = IFInnerShadowEffect;
})(this);