(function (_) {

    /**
     * A stroke paint
     * @class IFStrokePaint
     * @extends IFPatternPaint
     * @constructor
     */
    function IFStrokePaint() {
        IFPatternPaint.call(this);
    }

    IFNode.inherit('fillPaint', IFStrokePaint, IFPatternPaint);

    /** @override */
    IFStrokePaint.prototype.getPadding = function () {
        return [2, 2, 2, 2];
    };

    /** @override */
    IFStrokePaint.prototype.paint = function (canvas, source) {
        canvas.strokeVertices(IFColor.BLACK, 2);
    };

    /** @override */
    IFStrokePaint.prototype.toString = function () {
        return "[IFStrokePaint]";
    };

    _.IFStrokePaint = IFStrokePaint;
})(this);