(function (_) {
    /**
     * The line tool
     * @class GXLineTool
     * @extends GXShapeTool
     * @constructor
     */
    function GXLineTool() {
        GXShapeTool.call(this, true, true);
    }

    GObject.inherit(GXLineTool, GXShapeTool);

    /** @override */
    GXLineTool.prototype.getGroup = function () {
        return 'draw';
    };

    /** @override */
    GXLineTool.prototype.getIcon = function () {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<rect stroke="none" x="9" y="15.3" transform="matrix(0.7069 0.7074 -0.7074 0.7069 22.2372 1.3418)" width="1" height="24.5"/>\n</svg>\n';
    };

    /** @override */
    GXLineTool.prototype.getHint = function () {
        return GXShapeTool.prototype.getHint.call(this).setTitle(new GLocale.Key(GXLineTool, "title"));
    };

    /** @override */
    GXLineTool.prototype.getActivationCharacters = function () {
        return ['N'];
    };

    /** @override */
    GXLineTool.prototype._createShape = function () {
        var path = new GXPath();
        path.getAnchorPoints().appendChild(new GXPathBase.AnchorPoint());
        path.getAnchorPoints().appendChild(new GXPathBase.AnchorPoint());
        return path;
    };

    /** @override */
    GXLineTool.prototype._updateShape = function (shape, area, line) {
        shape.getAnchorPoints().getChildByIndex(0).setProperties(['x', 'y'], [line[0].getX(), line[0].getY()]);
        shape.getAnchorPoints().getChildByIndex(1).setProperties(['x', 'y'], [line[1].getX(), line[1].getY()]);
    };

    /** override */
    GXLineTool.prototype.toString = function () {
        return "[Object GXLineTool]";
    };

    _.GXLineTool = GXLineTool;
})(this);