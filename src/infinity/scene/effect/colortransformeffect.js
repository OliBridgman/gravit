(function (_) {
    /**
     * Color transform effect
     * @class IFColorTransformEffect
     * @extends IFEffect
     * @constructor
     */
    IFColorTransformEffect = function () {
        IFEffect.call(this);
        this._setDefaultProperties(IFColorTransformEffect.VisualProperties);
    };
    IFNode.inherit('clTransformEffect', IFColorTransformEffect, IFEffect);

    /**
     * Visual properties of a color grading effect
     */
    IFColorTransformEffect.VisualProperties = {
        /** The rgba multipliers (Array<Number>) */
        m: null,
        /** The rgba offsets (Array<Number>) */
        o: null
    };

    /** @override */
    IFColorTransformEffect.prototype.getEffectType = function () {
        return IFEffect.Type.Filter;
    };

    /** @override */
    IFColorTransformEffect.prototype.render = function (contents, output, scale) {
        if (this.$m && this.$o) {
            contents.getBitmap().applyFilter(IFColorMatrixFilter, {multiplier: this.$m, offsets: this.$o});
        }
    };

    /** @override */
    IFColorTransformEffect.prototype._handleChange = function (change, args) {
        if (change === IFNode._Change.Store) {
            this.storeProperties(args, IFColorTransformEffect.VisualProperties);
        } else if (change === IFNode._Change.Restore) {
            this.restoreProperties(args, IFColorTransformEffect.VisualProperties);
        }

        IFEffect.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFColorTransformEffect.prototype.toString = function () {
        return "[Object IFColorTransformEffect]";
    };

    _.IFColorTransformEffect = IFColorTransformEffect;
})(this);