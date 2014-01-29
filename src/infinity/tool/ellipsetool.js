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
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M9.5,33.5c-3.6,0-6.5-2.7-6.5-6c0-3.3,2.9-6,6.5-6s6.5,2.7,6.5,6C16,30.8,13.1,33.5,9.5,33.5z M9.5,22.5\n    c-3,0-5.5,2.2-5.5,5c0,2.7,2.5,5,5.5,5c3,0,5.5-2.2,5.5-5C15,24.8,12.5,22.5,9.5,22.5z"/>\n</svg>\n';
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