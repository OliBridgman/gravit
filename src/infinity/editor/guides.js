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

    /**
     * Map a point to the current snapping options
     * @param {GPoint} point the point to map
     * @returns {GPoint} a mapped point
     */
    GXGuides.prototype.mapPoint = function (point) {
        var result = point;

        // Snap to grid
        if (this._scene.getProperty('gridSnap')) {
            var gs = this._scene.getProperty('gridSize');
            result = new GPoint(Math.round(result.getX() / gs) * gs, Math.round(result.getY() / gs) * gs);
        }

        return result;
    };

    /** @override */
    GXGuides.prototype.toString = function () {
        return "[Object GXGuides]";
    };

    _.GXGuides = GXGuides;
})(this);