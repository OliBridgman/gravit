(function (_) {
    /**
     * Guides for managing guides like grid, smart guides etc.
     * @param {GXScene} scene
     * @class GXGuides
     * @extend GEventTarget
     * @constructor
     */
    function GXGuides(scene) {
        this._scene = scene;
    }

    GObject.inherit(GXGuides, GEventTarget);

    /**
     * @type {GXScene}
     * @private
     */
    GXGuides.prototype._scene = null;

    GXGuides.prototype.beginMap = function () {
        // TODO
    };

    GXGuides.prototype.finishMap = function () {
        // TODO
    };

    /**
     * Map a point to the current snapping options
     * @param {GPoint} point the point to map
     * @returns {GPoint} a mapped point
     */
    GXGuides.prototype.mapPoint = function (point) {
        var result = point;

        // Snap to grid
        if (this._scene.getProperty('gridActive')) {
            var gsx = this._scene.getProperty('gridSizeX');
            var gsy = this._scene.getProperty('gridSizeY');
            result = new GPoint(Math.round(result.getX() / gsx) * gsx, Math.round(result.getY() / gsy) * gsy);
        }

        return result;
    };

    GXGuides.prototype.mapRect = function (rect) {
        // TODO
    };

    /** @override */
    GXGuides.prototype.toString = function () {
        return "[Object GXGuides]";
    };

    _.GXGuides = GXGuides;
})(this);