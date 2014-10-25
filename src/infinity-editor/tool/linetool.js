(function (_) {
    /**
     * The line tool
     * @class GLineTool
     * @extends GShapeTool
     * @constructor
     */
    function GLineTool() {
        GShapeTool.call(this, true, true);
    }

    GObject.inherit(GLineTool, GShapeTool);

    /** @override */
    GLineTool.prototype._createShape = function () {
        var path = new GPath();
        path.getAnchorPoints().appendChild(new GPathBase.AnchorPoint());
        path.getAnchorPoints().appendChild(new GPathBase.AnchorPoint());
        return path;
    };

    /** @override */
    GLineTool.prototype._updateShape = function (shape, area, line) {
        shape.getAnchorPoints().getChildByIndex(0).setProperties(['x', 'y'], [line[0].getX(), line[0].getY()]);
        shape.getAnchorPoints().getChildByIndex(1).setProperties(['x', 'y'], [line[1].getX(), line[1].getY()]);
    };

    /** override */
    GLineTool.prototype.toString = function () {
        return "[Object GLineTool]";
    };

    _.GLineTool = GLineTool;
})(this);