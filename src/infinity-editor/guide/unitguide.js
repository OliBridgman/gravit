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
        var result = null;

        // Snap to units if desired
        switch (this._scene.getProperty('unitSnap')) {
            case IFScene.UnitSnap.Full:
                result = {
                    x: {value: ifMath.round(x, true), guide: null},
                    y: {value: ifMath.round(y, true), guide: null}};
                break;
            case IFScene.UnitSnap.Half:
                result = {
                    x: {value: ifMath.round(x, true) + 0.5, guide: null},
                    y: {value: ifMath.round(y, true) + 0.5, guide: null}};
                break;
        }

        return result;
    };

    /** @override */
    IFUnitGuide.prototype.toString = function () {
        return "[Object IFUnitGuide]";
    };

    _.IFUnitGuide = IFUnitGuide;
})(this);