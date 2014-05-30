(function (_) {
    /**
     * The polygon tool
     * @class IFPolygonTool
     * @extends IFShapeTool
     * @constructor
     * @version 1.0
     */
    function IFPolygonTool() {
        IFShapeTool.call(this, false, false);
    }

    IFObject.inherit(IFPolygonTool, IFShapeTool);

    /**
     * @type {number}
     * @private
     */
    IFPolygonTool.prototype._numberOfPoints = 6;

    /**
     * @type {number}
     * @private
     */
    IFPolygonTool.prototype._innerRadiusFactor = 0.5;

    /** @override */
    IFPolygonTool.prototype._modifiersChanged = function (event) {
        if (event.changed.shiftKey || event.changed.optionKey) {
            this._invalidateShape();
        }
        IFShapeTool.prototype._modifiersChanged.call(this, event);
    };

    /** @override */
    IFPolygonTool.prototype._createShape = function () {
        return new IFPolygon();
    };

    /** @override */
    IFPolygonTool.prototype._updateShape = function (shape, area, line) {
        var deltaX = line[1].getX() - line[0].getX();
        var deltaY = line[1].getY() - line[0].getY();
        var angle = ifMath.normalizeAngleRadians(Math.atan2(deltaY, deltaX));
        var distance = ifMath.ptDist(line[1].getX(), line[1].getY(), line[0].getX(), line[0].getY());

        // Lock angle to 15° if desired
        if (gPlatform.modifiers.shiftKey) {
            angle = Math.round(angle * 12 / Math.PI) * Math.PI / 12;
        }

        var outerAngle = angle;
        var innerAngle = ifMath.normalizeAngleRadians(angle + Math.PI / this._numberOfPoints);

        var outerRadius = distance;
        var innerRadius = distance * Math.cos(Math.PI / this._numberOfPoints);

        if (gPlatform.modifiers.optionKey) {
            innerRadius = distance * this._innerRadiusFactor;
        }

        shape.setProperties(['pts', 'cx', 'cy', 'ir', 'or', 'ia', 'oa'],
            [this._numberOfPoints, line[0].getX(), line[0].getY(), innerRadius, outerRadius, innerAngle, outerAngle]);
    };

    /** @override */
    IFPolygonTool.prototype._hasCenterCross = function () {
        return true;
    };

    /** override */
    IFPolygonTool.prototype.toString = function () {
        return "[Object IFPolygonTool]";
    };

    _.IFPolygonTool = IFPolygonTool;
})(this);