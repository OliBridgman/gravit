(function (_) {
    /**
     * Color grading effect
     * @class IFColorGradingEffect
     * @extends IFEffect
     * @constructor
     */
    IFColorGradingEffect = function () {
        IFEffect.call(this);
        this._setDefaultProperties(IFColorGradingEffect.VisualProperties);
    };
    IFNode.inherit('clGradingEffect', IFColorGradingEffect, IFEffect);

    /**
     * Visual properties of a color grading effect
     */
    IFColorGradingEffect.VisualProperties = {
        /** The curve points {rgb:[], r:[], g:[], b:[]} */
        cp: null
    };

    /** @override */
    IFColorGradingEffect.prototype.getEffectType = function () {
        return IFEffect.Type.Filter;
    };

    /** @override */
    IFColorGradingEffect.prototype.render = function (contents, output, background, scale) {
        if (this.$cp) {
            contents.getBitmap().applyFilter(IFColorGradingFilter, this.$cp);
        }
    };

    /** @override */
    IFColorGradingEffect.prototype._handleChange = function (change, args) {
        if (change === IFNode._Change.Store) {
            this.storeProperties(args, IFColorGradingEffect.VisualProperties);
        } else if (change === IFNode._Change.Restore) {
            this.restoreProperties(args, IFColorGradingEffect.VisualProperties);
        }

        IFEffect.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFColorGradingEffect.prototype.toString = function () {
        return "[Object IFColorGradingEffect]";
    };

    _.IFColorGradingEffect = IFColorGradingEffect;
})(this);