(function (_) {
    /**
     * The ellipse tool
     * @class IFEllipseTool
     * @extends IFShapeTool
     * @constructor
     */
    function IFEllipseTool() {
        IFShapeTool.call(this, true, true);
    }

    IFObject.inherit(IFEllipseTool, IFShapeTool);

    /** @override */
    IFEllipseTool.prototype._createShape = function () {
        return new IFEllipse();
    };

    /** @override */
    IFEllipseTool.prototype._updateShape = function (shape, area, line) {
        // Original shape is a circle with coordinates x,y: [-1, 1]. Transform it to fit into the area:
        shape.setProperty('trf',
            new GTransform(area.getWidth() / 2, 0, 0, area.getHeight() / 2,
                area.getX() + area.getWidth() / 2, area.getY() + area.getHeight() / 2));
    };

    /** @override */
    IFEllipseTool.prototype._hasCenterCross = function () {
        return true;
    };

    /** override */
    IFEllipseTool.prototype.toString = function () {
        return "[Object IFEllipseTool]";
    };

    _.IFEllipseTool = IFEllipseTool;
})(this);