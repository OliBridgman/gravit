(function (_) {
    /**
     * Color transform effect
     * @class GColorTransformEffect
     * @extends GEffect
     * @constructor
     */
    GColorTransformEffect = function () {
        GEffect.call(this);
        this._setDefaultProperties(GColorTransformEffect.VisualProperties);
    };
    GNode.inherit('clTransformEffect', GColorTransformEffect, GEffect);

    GColorTransformEffect.equals = function (left, right) {
        if (left instanceof GColorTransformEffect && right instanceof  GColorTransformEffect) {
            return left.arePropertiesEqual(right, Object.keys(GColorTransformEffect.VisualProperties));
        }
        return false;
    };

    /**
     * Visual properties of a color grading effect
     */
    GColorTransformEffect.VisualProperties = {
        /** The rgba multipliers (Array<Number>) */
        m: null,
        /** The rgba offsets (Array<Number>) */
        o: null
    };

    /** @override */
    GColorTransformEffect.prototype.getEffectType = function () {
        return GEffect.Type.Filter;
    };

    /** @override */
    GColorTransformEffect.prototype.render = function (contents, output, background, scale) {
        if (this.$m && this.$o) {
            contents.getBitmap().applyFilter(GColorMatrixFilter, {multiplier: this.$m, offsets: this.$o});
        }
    };

    /** @override */
    GColorTransformEffect.prototype._handleChange = function (change, args) {
        if (change === GNode._Change.Store) {
            this.storeProperties(args, GColorTransformEffect.VisualProperties);
        } else if (change === GNode._Change.Restore) {
            this.restoreProperties(args, GColorTransformEffect.VisualProperties);
        }

        this._handleVisualChangeForProperties(change, args, GColorTransformEffect.VisualProperties);

        GEffect.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GColorTransformEffect.prototype.toString = function () {
        return "[Object GColorTransformEffect]";
    };

    _.GColorTransformEffect = GColorTransformEffect;
})(this);