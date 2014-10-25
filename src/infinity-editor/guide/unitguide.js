(function (_) {
    /**
     * The unit guide for snapping to units if desired
     * @param {GGuides} guides
     * @class GUnitGuide
     * @extends GGuide
     * @mixes GGuide.Map
     * @constructor
     */
    function GUnitGuide(guides) {
        GGuide.call(this, guides);
    }

    GObject.inheritAndMix(GUnitGuide, GGuide, [GGuide.Map]);

    /** @override */
    GUnitGuide.prototype.map = function (x, y) {
        // Snap to units if desired
        if (this._scene.getProperty('unitSnap') === true) {
            return {
                x: {value: GMath.round(x, true), guide: null},
                y: {value: GMath.round(y, true), guide: null}};
        }

        return null;
    };

    /** @override */
    GUnitGuide.prototype.toString = function () {
        return "[Object GUnitGuide]";
    };

    _.GUnitGuide = GUnitGuide;
})(this);