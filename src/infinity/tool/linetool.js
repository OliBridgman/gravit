(function (_) {
    /**
     * The line tool
     * @class IFLineTool
     * @extends IFShapeTool
     * @constructor
     */
    function IFLineTool() {
        IFShapeTool.call(this, true, true);
    }

    IFObject.inherit(IFLineTool, IFShapeTool);

    /** @override */
    IFLineTool.prototype.getGroup = function () {
        return 'draw';
    };

    /** @override */
    IFLineTool.prototype.getIcon = function () {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<rect stroke="none" x="9" y="15.3" transform="matrix(0.7069 0.7074 -0.7074 0.7069 22.2372 1.3418)" width="1" height="24.5"/>\n</svg>\n';
    };

    /** @override */
    IFLineTool.prototype.getHint = function () {
        return IFShapeTool.prototype.getHint.call(this).setTitle(new IFLocale.Key(IFLineTool, "title"));
    };

    /** @override */
    IFLineTool.prototype.getActivationCharacters = function () {
        return ['N'];
    };

    /** @override */
    IFLineTool.prototype._createShape = function () {
        var path = new IFPath();
        path.getAnchorPoints().appendChild(new IFPathBase.AnchorPoint());
        path.getAnchorPoints().appendChild(new IFPathBase.AnchorPoint());
        return path;
    };

    /** @override */
    IFLineTool.prototype._updateShape = function (shape, area, line) {
        shape.getAnchorPoints().getChildByIndex(0).setProperties(['x', 'y'], [line[0].getX(), line[0].getY()]);
        shape.getAnchorPoints().getChildByIndex(1).setProperties(['x', 'y'], [line[1].getX(), line[1].getY()]);
    };

    /** override */
    IFLineTool.prototype.toString = function () {
        return "[Object IFLineTool]";
    };

    _.IFLineTool = IFLineTool;
})(this);