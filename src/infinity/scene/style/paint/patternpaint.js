(function (_) {

    /**
     * A base for pattern painting
     * @class IFPatternPaint
     * @extends IFPaintEntry
     * @mixes IFNode.Properties
     * @constructor
     */
    function IFPatternPaint() {
        IFPaintEntry.call(this);
    }

    IFObject.inheritAndMix(IFPatternPaint, IFPaintEntry, [IFNode.Properties]);

    /** @override */
    IFPatternPaint.prototype.toString = function () {
        return "[IFPatternPaint]";
    };

    _.IFPatternPaint = IFPatternPaint;
})(this);