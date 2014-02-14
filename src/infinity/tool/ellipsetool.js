(function (_) {
    /**
     * The ellipse tool
     * @class GXEllipseTool
     * @extends GXShapeTool
     * @constructor
     */
    function GXEllipseTool() {
        GXShapeTool.call(this, true, true);
    }

    GObject.inherit(GXEllipseTool, GXShapeTool);

    /** @override */
    GXEllipseTool.prototype.getGroup = function () {
        return 'draw';
    };

    /** @override */
    GXEllipseTool.prototype.getIcon = function () {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<ellipse style="fill:none; stroke: inherit" cx="9.5" cy="27.5" rx="8.5" ry="7.5"/>\n</svg>\n';
    };

    /** @override */
    GXEllipseTool.prototype.getHint = function () {
        return GXShapeTool.prototype.getHint.call(this)
            .setTitle(new GLocale.Key(GXEllipseTool, "title"));
    };

    /** @override */
    GXEllipseTool.prototype.getActivationCharacters = function () {
        return ['E', '3'];
    };

    /** @override */
    GXEllipseTool.prototype._createShape = function () {
        return new GXEllipse();
    };

    /** @override */
    GXEllipseTool.prototype._updateShape = function (shape, area, line) {
        // Original shape is a circle with coordinates x,y: [-1, 1]. Transform it to fit into the area:
        shape.setProperty('transform',
            new GTransform(area.getWidth() / 2, 0, 0, area.getHeight() / 2,
                area.getX() + area.getWidth() / 2, area.getY() + area.getHeight() / 2));
    };

    /** @override */
    GXEllipseTool.prototype._paintCenterCross = function () {
        return true;
    };

    /** override */
    GXEllipseTool.prototype.toString = function () {
        return "[Object GXEllipseTool]";
    };

    _.GXEllipseTool = GXEllipseTool;
})(this);