(function (_) {
    /**
     * The ellipse tool
     * @class GEllipseTool
     * @extends GShapeTool
     * @constructor
     */
    function GEllipseTool() {
        GShapeTool.call(this, true, true);
    }

    GObject.inherit(GEllipseTool, GShapeTool);

    /** @override */
    GEllipseTool.prototype._createShape = function () {
        return new GEllipse();
    };

    /** @override */
    GEllipseTool.prototype._updateShape = function (shape, area, line) {
        // Original shape is a circle with coordinates x,y: [-1, 1]. Transform it to fit into the area:
        shape.setProperty('trf',
            new GTransform(area.getWidth() / 2, 0, 0, area.getHeight() / 2,
                area.getX() + area.getWidth() / 2, area.getY() + area.getHeight() / 2));
    };

    /** @override */
    GEllipseTool.prototype._hasCenterCross = function () {
        return true;
    };

    /** override */
    GEllipseTool.prototype.toString = function () {
        return "[Object GEllipseTool]";
    };

    _.GEllipseTool = GEllipseTool;
})(this);