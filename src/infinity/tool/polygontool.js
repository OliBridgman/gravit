(function (_) {
    /**
     * The polygon tool
     * @class GXPolygonTool
     * @extends GXShapeTool
     * @constructor
     * @version 1.0
     */
    function GXPolygonTool() {
        GXShapeTool.call(this, false, false);
    }

    GObject.inherit(GXPolygonTool, GXShapeTool);

    /**
     * @type {number}
     * @private
     */
    GXPolygonTool.prototype._numberOfPoints = 6;

    /**
     * @type {number}
     * @private
     */
    GXPolygonTool.prototype._innerRadiusFactor = 0.5;

    /** @override */
    GXPolygonTool.prototype.getGroup = function () {
        return 'draw';
    };

    /** @override */
    GXPolygonTool.prototype.getIcon = function () {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M13,33.5H6l-3.5-6l3.5-6h7l3.5,6L13,33.5z M6.5,32.5h6l2.9-5l-2.9-5h-6l-2.9,5L6.5,32.5z"/>\n</svg>\n';
    };

    /** @override */
    GXPolygonTool.prototype.getHint = function () {
        return GXShapeTool.prototype.getHint.call(this)
            .addKey(GUIKey.Constant.UP, new GLocale.Key(GXPolygonTool, "shortcut.shift"))
            .addKey(GUIKey.Constant.DOWN, new GLocale.Key(GXPolygonTool, "shortcut.option"))
            .setTitle(new GLocale.Key(GXPolygonTool, "title"));
    };

    /** @override */
    GXPolygonTool.prototype.getActivationCharacters = function () {
        return ['G'];
    };

    /** @override */
    GXPolygonTool.prototype._modifiersChanged = function (event) {
        if (event.changed.shiftKey || event.changed.optionKey) {
            this._invalidateShape();
        }
        GXShapeTool.prototype._modifiersChanged.call(this, event);
    };

    /** @override */
    GXPolygonTool.prototype._createShape = function () {
        return new GXPolygon();
    };

    /** @override */
    GXPolygonTool.prototype._updateShape = function (shape, area, line) {
        var deltaX = line[1].getX() - line[0].getX();
        var deltaY = line[1].getY() - line[0].getY();
        var angle = gMath.normalizeAngleRadians(Math.atan2(deltaY, deltaX));
        var distance = gMath.ptDist(line[1].getX(), line[1].getY(), line[0].getX(), line[0].getY());

        // Lock angle to 15° if desired
        if (gPlatform.modifiers.shiftKey) {
            angle = Math.round(angle * 12 / Math.PI) * Math.PI / 12;
        }

        var outerAngle = angle;
        var innerAngle = gMath.normalizeAngleRadians(angle + Math.PI / this._numberOfPoints);

        var outerRadius = distance;
        var innerRadius = distance * Math.cos(Math.PI / this._numberOfPoints);

        if (gPlatform.modifiers.optionKey) {
            innerRadius = distance * this._innerRadiusFactor;
        }

        shape.setProperties(['pts', 'cx', 'cy', 'ir', 'or', 'ia', 'oa'],
            [this._numberOfPoints, line[0].getX(), line[0].getY(), innerRadius, outerRadius, innerAngle, outerAngle]);
    };

    /** @override */
    GXPolygonTool.prototype._paintCenterCross = function () {
        return true;
    };

    /** override */
    GXPolygonTool.prototype.toString = function () {
        return "[Object GXPolygonTool]";
    };

    _.GXPolygonTool = GXPolygonTool;
})(this);