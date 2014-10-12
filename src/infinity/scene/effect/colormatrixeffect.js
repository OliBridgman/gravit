(function (_) {
    /**
     * Color matrix effect
     * @class IFColorMatrixEffect
     * @extends IFEffect
     * @constructor
     */
    IFColorMatrixEffect = function () {
        IFEffect.call(this);
        this._setDefaultProperties(IFColorMatrixEffect.VisualProperties);
    };
    IFNode.inherit('clMatrixEffect', IFColorMatrixEffect, IFEffect);

    IFColorMatrixEffect.equals = function (left, right) {
        if (left instanceof IFColorMatrixEffect && right instanceof  IFColorMatrixEffect) {
            return left.arePropertiesEqual(right, Object.keys(IFColorMatrixEffect.VisualProperties));
        }
        return false;
    };

    /**
     * Visual properties of a color grading effect
     */
    IFColorMatrixEffect.VisualProperties = {
        /** The color matrix */
        cm: null
    };

    /** @override */
    IFColorMatrixEffect.prototype.getEffectType = function () {
        return IFEffect.Type.Filter;
    };

    /** @override */
    IFColorMatrixEffect.prototype.render = function (contents, output, background, scale) {
        if (this.$cm) {
            contents.getBitmap().applyFilter(IFColorMatrixFilter, this.$cm);
        }
    };

    /** @override */
    IFColorMatrixEffect.prototype._handleChange = function (change, args) {
        if (change === IFNode._Change.Store) {
            this.storeProperties(args, IFColorMatrixEffect.VisualProperties);
        } else if (change === IFNode._Change.Restore) {
            this.restoreProperties(args, IFColorMatrixEffect.VisualProperties);
        }

        this._handleVisualChangeForProperties(change, args, IFColorMatrixEffect.VisualProperties);

        IFEffect.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFColorMatrixEffect.prototype.toString = function () {
        return "[Object IFColorMatrixEffect]";
    };

    _.IFColorMatrixEffect = IFColorMatrixEffect;
})(this);