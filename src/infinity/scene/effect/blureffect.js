(function (_) {
    /**
     * Blur effect
     * @class GBlurEffect
     * @extends GEffect
     * @constructor
     */
    GBlurEffect = function () {
        GEffect.call(this);
        this._setDefaultProperties(GBlurEffect.GeometryProperties);
    };
    GNode.inherit('blurEffect', GBlurEffect, GEffect);

    GBlurEffect.equals = function (left, right) {
        if (left instanceof GBlurEffect && right instanceof  GBlurEffect) {
            return left.arePropertiesEqual(right, Object.keys(GBlurEffect.GeometryProperties));
        }
        return false;
    };

    /**
     * Geometry properties of a blur effect
     */
    GBlurEffect.GeometryProperties = {
        /** The blur radius */
        'r': 5
    };

    /** @override */
    GBlurEffect.prototype.getEffectType = function () {
        return GEffect.Type.Filter;
    };

    /** @override */
    GBlurEffect.prototype.getEffectPadding = function () {
        return this.$r;
    };

    /** @override */
    GBlurEffect.prototype.render = function (contents, output, background, scale) {
        if (this.$r) {
            contents.getBitmap().applyFilter(GStackBlurFilter, this.$r * scale);
        }
    };

    /** @override */
    GBlurEffect.prototype._handleChange = function (change, args) {
        if (change === GNode._Change.Store) {
            this.storeProperties(args, GBlurEffect.GeometryProperties);
        } else if (change === GNode._Change.Restore) {
            this.restoreProperties(args, GBlurEffect.GeometryProperties);
        }

        this._handleGeometryChangeForProperties(change, args, GBlurEffect.GeometryProperties);

        GEffect.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GBlurEffect.prototype.toString = function () {
        return "[Object GBlurEffect]";
    };

    _.GBlurEffect = GBlurEffect;
})(this);