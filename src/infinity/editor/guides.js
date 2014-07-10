(function (_) {
    /**
     * Guides for managing guides like grid, smart guides etc.
     * @param {IFScene} scene
     * @class IFGuides
     * @extend GEventTarget
     * @constructor
     */
    function IFGuides(scene) {
        this._scene = scene;
    }

    IFObject.inherit(IFGuides, GEventTarget);

    /**
     * @type {IFScene}
     * @private
     */
    IFGuides.prototype._scene = null;

    IFGuides.prototype.beginMap = function () {
        // TODO
    };

    IFGuides.prototype.finishMap = function () {
        // TODO
    };

    /**
     * Map a point to the current snapping options
     * @param {GPoint} point the point to map
     * @returns {GPoint} a mapped point
     */
    IFGuides.prototype.mapPoint = function (point) {
        var result = point;

        var snapDistance = this._scene.getProperty('snapDist');

        // Snap to grid
        if (this._scene.getProperty('gridActive')) {
            var gsx = this._scene.getProperty('gridSizeX');
            var gsy = this._scene.getProperty('gridSizeY');
            result = new GPoint(Math.round(result.getX() / gsx) * gsx, Math.round(result.getY() / gsy) * gsy);
        }

        /** TODO :
        // Snap to pages
        for (var child = this._scene.getFirstChild(); child !== null; child = child.getNext()) {
            if (child instanceof IFPage) {
                var pageBBox = child.getGeometryBBox();
                if (pageBBox && !pageBBox.isEmpty()) {
                    var x = result.getX();
                    var y = result.getY();

                    if (Math.abs(x - pageBBox.getX()) <= snapDistance) {
                        x = pageBBox.getX();
                    }
                    if (Math.abs(y - pageBBox.getY()) <= snapDistance) {
                        y = pageBBox.getY();
                    }

                    result = new GPoint(x, y);
                }
            }
        }*/

        return result;
    };

    IFGuides.prototype.mapRect = function (rect) {
        // TODO
    };

    /** @override */
    IFGuides.prototype.toString = function () {
        return "[Object IFGuides]";
    };

    _.IFGuides = IFGuides;
})(this);