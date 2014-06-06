(function (_) {

    /**
     * A blur filter
     * @class IFBlurFilter
     * @extends IFFilter
     * @mixes IFNode.Properties
     * @constructor
     */
    function IFBlurFilter() {
        IFFilter.call(this);
        this._setDefaultProperties(IFBlurFilter.GeometryProperties);
    }

    IFNode.inheritAndMix('blurFilter', IFBlurFilter, IFFilter, [IFNode.Properties]);

    /**
     * Geometry properties
     */
    IFBlurFilter.GeometryProperties = {
        // The radius of the blur
        r: 5
    };

    /** @override */
    IFBlurFilter.prototype.getPadding = function () {
        return [this.$r, this.$r, this.$r, this.$r];
    };

    /** @override */
    IFBlurFilter.prototype.apply = function (contents) {
        contents.blur(this.$r);
    };

    /** @override */
    IFBlurFilter.prototype.toString = function () {
        return "[IFBlurFilter]";
    };

    _.IFBlurFilter = IFBlurFilter;
})(this);