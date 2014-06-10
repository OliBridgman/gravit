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
    IFBlurFilter.prototype.store = function (blob) {
        if (IFFilterEntry.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFBlurFilter.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFBlurFilter.prototype.restore = function (blob) {
        if (IFFilterEntry.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFBlurFilter.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFBlurFilter.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, IFBlurFilter.GeometryProperties);
        IFFilterEntry.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFBlurFilter.prototype.toString = function () {
        return "[IFBlurFilter]";
    };

    _.IFBlurFilter = IFBlurFilter;
})(this);