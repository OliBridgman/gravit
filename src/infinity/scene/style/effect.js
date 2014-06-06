(function (_) {

    /**
     * A base for raster effects
     * @class IFEffect
     * @extends IFStyleEntry
     * @constructor
     */
    function IFEffect() {
        IFStyleEntry.call(this);
    }

    IFObject.inherit(IFEffect, IFStyleEntry);

    /**
     * Should return whether this filter is applied
     * *after* contents are rendered (true) or before (false)
     * @return {boolean}
     */
    IFEffect.prototype.isPost = function () {
        throw new Error("Not Supported");
    };

    /**
     * @param {IFPaintCanvas} canvas the target canvas for the effect
     * @param {IFPaintCanvas} contents the contents the effect is applied on
     */
    IFEffect.prototype.render = function (canvas, contents) {
        throw new Error("Not Supported");
    };

    /** @override */
    IFEffect.prototype.toString = function () {
        return "[IFEffect]";
    };

    _.IFEffect = IFEffect;
})(this);