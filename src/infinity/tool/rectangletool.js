(function (_) {
    /**
     * The rectangle tool
     * @class IFRectangleTool
     * @extends IFShapeTool
     * @constructor
     */
    function IFRectangleTool() {
        IFShapeTool.call(this, true, true);
    }

    IFObject.inherit(IFRectangleTool, IFShapeTool);

    /** @override */
    IFRectangleTool.prototype._createShape = function () {
        return new IFRectangle();
    };

    /** @override */
    IFRectangleTool.prototype._updateShape = function (shape, area, line) {
        // Original shape is a rectangle with coordinates x,y: [-1, 1]. Transform it to fit into the area:
        shape.setProperty('trf',
            new GTransform(area.getWidth() / 2, 0, 0, area.getHeight() / 2,
                area.getX() + area.getWidth() / 2, area.getY() + area.getHeight() / 2));
    };

    /** @override */
    IFRectangleTool.prototype._hasCenterCross = function () {
        return true;
    };

    /** override */
    IFRectangleTool.prototype.toString = function () {
        return "[Object IFRectangleTool]";
    };

    _.IFRectangleTool = IFRectangleTool;
})(this);