(function (_) {

    /**
     * Effect attribute for blurring the contents
     * @class IFBlurAttribute
     * @extends IFEffectAttribute
     * @mixes GXNode.Properties
     * @mixes GXNode.Container
     * @constructor
     */
    function IFBlurAttribute() {
        IFEffectAttribute.call(this);
        this._setDefaultProperties(IFBlurAttribute.GeometryProperties, IFBlurAttribute.VisualProperties);
    }

    GXNode.inheritAndMix("blurAttr", IFBlurAttribute, IFEffectAttribute, [GXNode.Properties, GXNode.Container]);

    /**
     * Geometry properties
     */
    IFBlurAttribute.GeometryProperties = {
        // The radius of the blur
        r: 10
    };

    /**
     * Visual properties
     */
    IFBlurAttribute.VisualProperties = {
        // The color of the blur
        cls: null
    };

    /** @override */
    IFBlurAttribute.prototype._renderEffect = function (context, source, bbox) {
        var tint = this.$cls ? this.$cls.asRGB() : null;
        if (tint) {
            tint[3] = tint[3] / 100.0;
        }

        context.canvas.runFilter('stackBlur', null, [this.$r, tint]);
    };

    /** @override */
    IFBlurAttribute.prototype.getBBox = function (source) {
        return source.expanded(this.$r * 2, this.$r * 2, this.$r * 2, this.$r * 2);
    };

    /** @override */
    IFBlurAttribute.prototype.store = function (blob) {
        if (IFEffectAttribute.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFBlurAttribute.GeometryProperties);
            this.storeProperties(blob, IFBlurAttribute.VisualProperties, function (property, value) {
                if (property === 'cls' && value) {
                    return value.asString();
                }
                return value;
            });
            return true;
        }
        return false;
    };

    /** @override */
    IFBlurAttribute.prototype.restore = function (blob) {
        if (IFEffectAttribute.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFBlurAttribute.GeometryProperties);
            this.restoreProperties(blob, IFBlurAttribute.VisualProperties, function (property, value) {
                if (property === 'cls' && value) {
                    return GXColor.parseColor(value);
                }
                return value;
            });
            return true;
        }
        return false;
    };

    /** @override */
    IFBlurAttribute.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, IFBlurAttribute.GeometryProperties);
        this._handleVisualChangeForProperties(change, args, IFBlurAttribute.VisualProperties);
        IFEffectAttribute.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFBlurAttribute.prototype.toString = function () {
        return "[IFBlurAttribute]";
    };

    _.IFBlurAttribute = IFBlurAttribute;
})(this);