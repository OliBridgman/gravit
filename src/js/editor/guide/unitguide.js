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

    GObject.inheritAndMix(GUnitGuide, GGuide, [GGuide.Map, GGuide.DetailMap]);

    GUnitGuide.ID = 'guide.unit';

    /** @override */
    GUnitGuide.prototype.getId = function () {
        return GUnitGuide.ID;
    };

    /** @override */
    GUnitGuide.prototype.map = function (x, y) {
        var valueX = GMath.round(x, true);
        var valueY = GMath.round(y, true);
        return {
            x: {value: valueX, guide: null, delta: Math.abs(x - valueX)},
            y: {value: valueY, guide: null, delta: Math.abs(y - valueY)}
        };

        return null;
    };

    /** @override */
    GUnitGuide.prototype.isMappingAllowed = function (enabled, detail) {
        return detail !== GGuide.DetailMap.Mode.DetailOffFilterOn;
    };

    /** @override */
    GUnitGuide.prototype.toString = function () {
        return "[Object GUnitGuide]";
    };

    _.GUnitGuide = GUnitGuide;
})(this);