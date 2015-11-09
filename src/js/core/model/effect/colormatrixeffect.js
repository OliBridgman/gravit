(function (_) {
    /**
     * Color matrix effect
     * @class GColorMatrixEffect
     * @extends GEffect
     * @constructor
     */
    GColorMatrixEffect = function () {
        GEffect.call(this);
        this._setDefaultProperties(GColorMatrixEffect.VisualProperties);
    };
    GNode.inherit('clMatrixEffect', GColorMatrixEffect, GEffect);

    GColorMatrixEffect.equals = function (left, right) {
        if (left instanceof GColorMatrixEffect && right instanceof  GColorMatrixEffect) {
            return left.arePropertiesEqual(right, Object.keys(GColorMatrixEffect.VisualProperties));
        }
        return false;
    };

    /**
     * Visual properties of a color grading effect
     */
    GColorMatrixEffect.VisualProperties = {
        /** The color matrix */
        cm: null
    };

    /** @override */
    GColorMatrixEffect.prototype.getEffectType = function () {
        return GEffect.Type.Filter;
    };

    /** @override */
    GColorMatrixEffect.prototype.render = function (contents, output, background, scale) {
        if (this.$cm) {
            contents.getBitmap().applyFilter(GColorMatrixFilter, this.$cm);
        }
    };

    /** @override */
    GColorMatrixEffect.prototype._handleChange = function (change, args) {
        if (change === GNode._Change.Store) {
            this.storeProperties(args, GColorMatrixEffect.VisualProperties);
        } else if (change === GNode._Change.Restore) {
            this.restoreProperties(args, GColorMatrixEffect.VisualProperties);
        }

        this._handleVisualChangeForProperties(change, args, GColorMatrixEffect.VisualProperties);

        GEffect.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GColorMatrixEffect.prototype.toString = function () {
        return "[Object GColorMatrixEffect]";
    };

    _.GColorMatrixEffect = GColorMatrixEffect;
})(this);