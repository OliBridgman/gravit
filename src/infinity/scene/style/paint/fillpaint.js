(function (_) {

    /**
     * A fill paint
     * @class IFFillPaint
     * @extends IFPatternPaint
     * @constructor
     */
    function IFFillPaint() {
        IFPatternPaint.call(this);
    }

    IFNode.inherit('fillPaint', IFFillPaint, IFPatternPaint);

    /** @override */
    IFFillPaint.prototype.paint = function (canvas, source) {
        canvas.fillVertices(IFColor.parseCSSColor('silver'));
    };

    /** @override */
    IFFillPaint.prototype.toString = function () {
        return "[IFFillPaint]";
    };

    _.IFFillPaint = IFFillPaint;
})(this);