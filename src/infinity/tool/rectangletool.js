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
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M14.5,23.5v8h-10v-8H14.5 M15.5,22.5h-1h-10h-1v1v8v1h1h10h1v-1v-8V22.5L15.5,22.5z"/>\n</svg>\n';
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