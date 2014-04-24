(function (_) {

    /**
     * Effect attribute for blurring the contents
     * @class IFBlurAttribute
     * @extends IFEffectAttribute
     * @mixes GXNode.Properties
     * @constructor
     */
    function IFBlurAttribute() {
        IFEffectAttribute.call(this);
        this._setDefaultProperties(IFBlurAttribute.GeometryProperties);
    }

    GXNode.inheritAndMix("blurAttr", IFBlurAttribute, IFEffectAttribute, [GXNode.Properties]);

    /**
     * Geometry properties
     */
    IFBlurAttribute.GeometryProperties = {
        // The radius of the blur
        r: 5
    };

    /** @override */
    IFBlurAttribute.prototype._renderEffect = function (context, source, bbox) {
        context.canvas.runFilter('stackBlur', null, [this.$r]);
        return null;
    };

    /** @override */
    IFBlurAttribute.prototype.store = function (blob) {
        if (IFEffectAttribute.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFBlurAttribute.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFBlurAttribute.prototype.restore = function (blob) {
        if (IFEffectAttribute.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFBlurAttribute.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFBlurAttribute.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, IFBlurAttribute.GeometryProperties);
        IFEffectAttribute.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFBlurAttribute.prototype._getBBoxPadding = function () {
        return [
            this.$r * 2,
            this.$r * 2,
            this.$r * 2,
            this.$r * 2
        ];
    };

    /** @override */
    IFBlurAttribute.prototype.toString = function () {
        return "[IFBlurAttribute]";
    };

    _.IFBlurAttribute = IFBlurAttribute;
})(this);