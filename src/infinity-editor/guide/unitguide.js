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
                    x: {value: ifMath.round(x, true), visual: false},
                    y: {value: ifMath.round(y, true), visual: false}};
                break;
            case IFScene.UnitSnap.Half:
                result = {
                    x: {value: ifMath.round(x, true) + 0.5, visual: false},
                    y: {value: ifMath.round(y, true) + 0.5, visual: false}};
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