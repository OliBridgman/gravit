(function (_) {
    /**
     * The grid guide
     * @param {IFGuides} guides
     * @class IFGridGuide
     * @extends IFGuide
     * @mixes IFGuide.Visual
     * @mixes IFGuide.Map
     * @constructor
     */
    function IFGridGuide(guides) {
        IFGuide.call(this, guides);
    }

    IFObject.inheritAndMix(IFGridGuide, IFGuide, [IFGuide.Visual, IFGuide.Map]);

    /** @override */
    IFGridGuide.prototype.paint = function (transform, context) {
        // TODO
    };
    /** @override */
    IFGridGuide.prototype.map = function (x, y) {
        // NO-OP
    };

    /** @override */
    IFGridGuide.prototype.toString = function () {
        return "[Object IFGridGuide]";
    };

    _.IFGridGuide = IFGridGuide;
})(this);