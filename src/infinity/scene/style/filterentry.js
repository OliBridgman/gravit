(function (_) {

    /**
     * A base for raster filters
     * @class IFFilterEntry
     * @extends IFStyleEntry
     * @constructor
     */
    function IFFilterEntry() {
        IFStyleEntry.call(this);
    }

    IFObject.inherit(IFFilterEntry, IFStyleEntry);

    /**
     * @param {IFPaintCanvas} contents the contents canvas to apply the filter onto
     * @param {Number} scale a scale factor you need to multiply your params with
     */
    IFFilterEntry.prototype.apply = function (contents, scale) {
        throw new Error("Not Supported");
    };

    /** @override */
    IFFilterEntry.prototype.toString = function () {
        return "[IFFilterEntry]";
    };

    _.IFFilterEntry = IFFilterEntry;
})(this);