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

    GObject.inherit(IFRectangleTool, IFShapeTool);

    /** @override */
    IFRectangleTool.prototype.getGroup = function () {
        return 'draw';
    };

    /** @override */
    IFRectangleTool.prototype.getIcon = function () {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M17.5,20.5v14h-16v-14H17.5 M18.5,19.5h-18v16h18v-15V19.5L18.5,19.5z"/>\n</svg>\n';
    };

    /** @override */
    IFRectangleTool.prototype.getHint = function () {
        return IFShapeTool.prototype.getHint.call(this).setTitle(new GLocale.Key(IFRectangleTool, "title"));
    };

    /** @override */
    IFRectangleTool.prototype.getActivationCharacters = function () {
        return ['R'];
    };

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