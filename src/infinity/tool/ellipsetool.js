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

    GObject.inherit(IFEllipseTool, IFShapeTool);

    /** @override */
    IFEllipseTool.prototype.getGroup = function () {
        return 'draw';
    };

    /** @override */
    IFEllipseTool.prototype.getIcon = function () {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<ellipse style="fill:none; stroke: inherit" cx="9.5" cy="27.5" rx="8.5" ry="7.5"/>\n</svg>\n';
    };

    /** @override */
    IFEllipseTool.prototype.getHint = function () {
        return IFShapeTool.prototype.getHint.call(this)
            .setTitle(new GLocale.Key(IFEllipseTool, "title"));
    };

    /** @override */
    IFEllipseTool.prototype.getActivationCharacters = function () {
        return ['E', '3'];
    };

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