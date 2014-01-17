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
    GXEllipseTool.prototype.getImageClass = function () {
        return 'g-tool-ellipse';
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
        shape.setProperty('transform', new GTransform(area.getWidth(), 0, 0, area.getHeight(), area.getX(), area.getY()));
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