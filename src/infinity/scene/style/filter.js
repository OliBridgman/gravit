(function (_) {

    /**
     * A base for raster filters
     * @class IFFilter
     * @extends IFStyleEntry
     * @constructor
     */
    function IFFilter() {
        IFStyleEntry.call(this);
    }

    IFObject.inherit(IFFilter, IFStyleEntry);

    /**
     * @param {IFPaintCanvas} contents the contents canvas to apply the filter onto
     */
    IFFilter.prototype.apply = function (contents) {
        throw new Error("Not Supported");
    };

    /** @override */
    IFFilter.prototype.toString = function () {
        return "[IFFilter]";
    };

    _.IFFilter = IFFilter;
})(this);