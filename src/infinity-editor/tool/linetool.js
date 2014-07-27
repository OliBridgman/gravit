(function (_) {
    /**
     * The line tool
     * @class IFLineTool
     * @extends IFShapeTool
     * @constructor
     */
    function IFLineTool() {
        IFShapeTool.call(this, true, true);
    }

    IFObject.inherit(IFLineTool, IFShapeTool);

    /** @override */
    IFLineTool.prototype._createShape = function () {
        var path = new IFPath();
        path.getAnchorPoints().appendChild(new IFPathBase.AnchorPoint());
        path.getAnchorPoints().appendChild(new IFPathBase.AnchorPoint());
        return path;
    };

    /** @override */
    IFLineTool.prototype._updateShape = function (shape, area, line) {
        shape.getAnchorPoints().getChildByIndex(0).setProperties(['x', 'y'], [line[0].getX(), line[0].getY()]);
        shape.getAnchorPoints().getChildByIndex(1).setProperties(['x', 'y'], [line[1].getX(), line[1].getY()]);
    };

    /** override */
    IFLineTool.prototype.toString = function () {
        return "[Object IFLineTool]";
    };

    _.IFLineTool = IFLineTool;
})(this);