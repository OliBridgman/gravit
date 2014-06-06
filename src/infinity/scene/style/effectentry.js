(function (_) {

    /**
     * A base for raster effects
     * @class IFEffectEntry
     * @extends IFStyleEntry
     * @constructor
     */
    function IFEffectEntry() {
        IFStyleEntry.call(this);
    }

    IFObject.inherit(IFEffectEntry, IFStyleEntry);

    /**
     * Should return whether this filter is applied
     * *after* contents are rendered (true) or before (false)
     * @return {boolean}
     */
    IFEffectEntry.prototype.isPost = function () {
        throw new Error("Not Supported");
    };

    /**
     * @param {IFPaintCanvas} canvas the target canvas for the effect
     * @param {IFPaintCanvas} contents the contents the effect is applied on
     */
    IFEffectEntry.prototype.render = function (canvas, contents) {
        throw new Error("Not Supported");
    };

    /** @override */
    IFEffectEntry.prototype.toString = function () {
        return "[IFEffectEntry]";
    };

    _.IFEffectEntry = IFEffectEntry;
})(this);