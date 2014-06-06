(function (_) {

    /**
     * A blur filter
     * @class IFBlurFilter
     * @extends IFFilterEntry
     * @constructor
     */
    function IFBlurFilter() {
        IFFilterEntry.call(this);
        this._setDefaultProperties(IFBlurFilter.GeometryProperties);
    }

    IFNode.inherit('blurFilter', IFBlurFilter, IFFilterEntry);

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