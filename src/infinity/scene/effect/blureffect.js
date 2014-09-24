(function (_) {
    /**
     * Blur effect
     * @class IFBlurEffect
     * @extends IFEffect
     * @constructor
     */
    IFBlurEffect = function () {
        IFEffect.call(this);
        this._setDefaultProperties(IFBlurEffect.GeometryProperties);
    };
    IFNode.inherit('blurEffect', IFBlurEffect, IFEffect);

    /**
     * Geometry properties of a blur effect
     */
    IFBlurEffect.GeometryProperties = {
        /** The blur radius */
        'r': 5
    };

    /** @override */
    IFBlurEffect.prototype.getEffectType = function () {
        return IFEffect.Type.Filter;
    };

    /** @override */
    IFBlurEffect.prototype.getEffectPadding = function () {
        return this.$r;
    };

    /** @override */
    IFBlurEffect.prototype.render = function (contents, output, scale) {
        if (this.$r) {
            contents.getBitmap().blur(this.$r * scale);
        }
    };

    /** @override */
    IFBlurEffect.prototype._handleChange = function (change, args) {
        if (change === IFNode._Change.Store) {
            this.storeProperties(args, IFBlurEffect.GeometryProperties);
        } else if (change === IFNode._Change.Restore) {
            this.restoreProperties(args, IFBlurEffect.GeometryProperties);
        }

        IFEffect.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFBlurEffect.prototype.toString = function () {
        return "[Object IFBlurEffect]";
    };

    _.IFBlurEffect = IFBlurEffect;
})(this);