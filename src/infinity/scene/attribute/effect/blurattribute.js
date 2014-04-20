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
        this._setDefaultProperties(IFBlurAttribute.VisualProperties);
    }

    GXNode.inheritAndMix("blurAttr", IFBlurAttribute, IFEffectAttribute, [GXNode.Properties, GXNode.Container]);

    /**
     * Visual properties
     */
    IFBlurAttribute.VisualProperties = {
        // The radius of the blur
        r: 10
    };

    /** @override */
    IFBlurAttribute.prototype._renderEffect = function (context, source, bbox) {
        // Simply run our blur filter
        context.canvas.runFilter('stackBlur', null, [this.$r]);
    };

    /** @override */
    IFBlurAttribute.prototype.getBBox = function (source) {
        return source.expanded(this.$r * 2, this.$r * 2, this.$r * 2, this.$r * 2);
    };

    /** @override */
    IFBlurAttribute.prototype.store = function (blob) {
        if (IFEffectAttribute.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFBlurAttribute.VisualProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFBlurAttribute.prototype.restore = function (blob) {
        if (IFEffectAttribute.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFBlurAttribute.VisualProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFBlurAttribute.prototype._handleChange = function (change, args) {
        this._handleVisualChangeForProperties(change, args, IFBlurAttribute.VisualProperties);
        IFEffectAttribute.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFBlurAttribute.prototype.toString = function () {
        return "[IFBlurAttribute]";
    };

    _.IFBlurAttribute = IFBlurAttribute;
})(this);