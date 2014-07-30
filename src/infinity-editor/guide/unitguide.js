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
        switch (this._scene.getProperty('unitSnap')) {
            case IFScene.UnitSnap.Full:
                result = new IFPoint(ifMath.round(result.getX(), true), ifMath.round(result.getY(), true));
                break;
            case IFScene.UnitSnap.Half:
                result = new IFPoint(ifMath.round(result.getX(), true) + 0.5, ifMath.round(result.getY(), true) + 0.5);
                break;
        }
    };

    /** @override */
    IFUnitGuide.prototype.toString = function () {
        return "[Object IFUnitGuide]";
    };

    _.IFUnitGuide = IFUnitGuide;
})(this);