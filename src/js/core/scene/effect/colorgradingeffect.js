(function (_) {
    /**
     * Color grading effect
     * @class GColorGradingEffect
     * @extends GEffect
     * @constructor
     */
    GColorGradingEffect = function () {
        GEffect.call(this);
        this._setDefaultProperties(GColorGradingEffect.VisualProperties);
    };
    GNode.inherit('clGradingEffect', GColorGradingEffect, GEffect);

    GColorGradingEffect.equals = function (left, right) {
        if (left instanceof GColorGradingEffect && right instanceof  GColorGradingEffect) {
            return left.arePropertiesEqual(right, Object.keys(GColorGradingEffect.VisualProperties));
        }
        return false;
    };

    /**
     * Visual properties of a color grading effect
     */
    GColorGradingEffect.VisualProperties = {
        /** The curve points {rgb:[], r:[], g:[], b:[]} */
        cp: null
    };

    /** @override */
    GColorGradingEffect.prototype.getEffectType = function () {
        return GEffect.Type.Filter;
    };

    /** @override */
    GColorGradingEffect.prototype.render = function (contents, output, background, scale) {
        if (this.$cp) {
            contents.getBitmap().applyFilter(GColorGradingFilter, this.$cp);
        }
    };

    /** @override */
    GColorGradingEffect.prototype._handleChange = function (change, args) {
        if (change === GNode._Change.Store) {
            this.storeProperties(args, GColorGradingEffect.VisualProperties);
        } else if (change === GNode._Change.Restore) {
            this.restoreProperties(args, GColorGradingEffect.VisualProperties);
        }

        this._handleVisualChangeForProperties(change, args, GColorGradingEffect.VisualProperties);

        GEffect.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GColorGradingEffect.prototype.toString = function () {
        return "[Object GColorGradingEffect]";
    };

    _.GColorGradingEffect = GColorGradingEffect;
})(this);