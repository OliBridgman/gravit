(function (_) {
    /**
     * The polygon tool
     * @class GPolygonTool
     * @extends GShapeTool
     * @constructor
     * @version 1.0
     */
    function GPolygonTool() {
        GShapeTool.call(this, false, false);
    }

    GObject.inherit(GPolygonTool, GShapeTool);

    /**
     * @type {number}
     * @private
     */
    GPolygonTool.prototype._numberOfPoints = 6;

    /**
     * @type {number}
     * @private
     */
    GPolygonTool.prototype._innerRadiusFactor = 0.5;

    /** @override */
    GPolygonTool.prototype._modifiersChanged = function (event) {
        if (event.changed.shiftKey || event.changed.optionKey) {
            this._invalidateShape();
        }
        GShapeTool.prototype._modifiersChanged.call(this, event);
    };

    /** @override */
    GPolygonTool.prototype._createShape = function () {
        return new GPolygon();
    };

    /** @override */
    GPolygonTool.prototype._updateShape = function (shape, area, line) {
        var deltaX = line[1].getX() - line[0].getX();
        var deltaY = line[1].getY() - line[0].getY();
        var angle = GMath.normalizeAngleRadians(Math.atan2(deltaY, deltaX));
        var distance = GMath.ptDist(line[1].getX(), line[1].getY(), line[0].getX(), line[0].getY());

        // Lock angle to 15° if desired
        if (ifPlatform.modifiers.shiftKey) {
            angle = Math.round(angle * 12 / Math.PI) * Math.PI / 12;
        }

        var outerAngle = angle;
        var innerAngle = GMath.normalizeAngleRadians(angle + Math.PI / this._numberOfPoints);

        var outerRadius = distance;
        var innerRadius = distance * Math.cos(Math.PI / this._numberOfPoints);

        if (ifPlatform.modifiers.optionKey) {
            innerRadius = distance * this._innerRadiusFactor;
        }

        shape.setProperties(['pts', 'cx', 'cy', 'ir', 'or', 'ia', 'oa'],
            [this._numberOfPoints, line[0].getX(), line[0].getY(), innerRadius, outerRadius, innerAngle, outerAngle]);
    };

    /** @override */
    GPolygonTool.prototype._hasCenterCross = function () {
        return true;
    };

    /** override */
    GPolygonTool.prototype.toString = function () {
        return "[Object GPolygonTool]";
    };

    _.GPolygonTool = GPolygonTool;
})(this);