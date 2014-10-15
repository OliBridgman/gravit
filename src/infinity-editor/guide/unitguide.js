(function (_) {
    /**
     * The unit guide for snapping to units if desired
     * @param {IFGuides} guides
     * @class IFUnitGuide
     * @extends IFGuide
     * @mixes IFGuide.Map
     * @constructor
     */
    function IFUnitGuide(guides) {
        IFGuide.call(this, guides);
    }

    IFObject.inheritAndMix(IFUnitGuide, IFGuide, [IFGuide.Map]);

    /** @override */
    IFUnitGuide.prototype.map = function (x, y) {
        // Snap to units if desired
        if (this._scene.getProperty('unitSnap') === true) {
            return {
                x: {value: IFMath.round(x, true), guide: null},
                y: {value: IFMath.round(y, true), guide: null}};
        }

        return null;
    };

    /** @override */
    IFUnitGuide.prototype.toString = function () {
        return "[Object IFUnitGuide]";
    };

    _.IFUnitGuide = IFUnitGuide;
})(this);