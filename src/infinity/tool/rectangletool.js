(function (_) {
    /**
     * The rectangle tool
     * @class GXRectangleTool
     * @extends GXShapeTool
     * @constructor
     */
    function GXRectangleTool() {
        GXShapeTool.call(this, true, true);
    }

    GObject.inherit(GXRectangleTool, GXShapeTool);

    /** @override */
    GXRectangleTool.prototype.getGroup = function () {
        return 'draw';
    };

    /** @override */
    GXRectangleTool.prototype.getIcon = function () {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M17.5,20.5v14h-16v-14H17.5 M18.5,19.5h-18v16h18v-15V19.5L18.5,19.5z"/>\n</svg>\n';
    };

    /** @override */
    GXRectangleTool.prototype.getHint = function () {
        return GXShapeTool.prototype.getHint.call(this).setTitle(new GLocale.Key(GXRectangleTool, "title"));
    };

    /** @override */
    GXRectangleTool.prototype.getActivationCharacters = function () {
        return ['R'];
    };

    /** @override */
    GXRectangleTool.prototype._createShape = function () {
        return new GXRectangle();
    };

    /** @override */
    GXRectangleTool.prototype._updateShape = function (shape, area, line) {
        shape.setProperty('transform', new GTransform(area.getWidth(), 0, 0, area.getHeight(), area.getX(), area.getY()));
    };

    /** @override */
    GXRectangleTool.prototype._paintCenterCross = function () {
        return true;
    };

    /** override */
    GXRectangleTool.prototype.toString = function () {
        return "[Object GXRectangleTool]";
    };

    _.GXRectangleTool = GXRectangleTool;
})(this);