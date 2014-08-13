(function (_) {
    /**
     * The grid guide
     * @param {IFGuides} guides
     * @class IFShapeBoxGuide
     * @extends IFGuide
     * @mixes IFGuide.Visual
     * @mixes IFGuide.Map
     * @constructor
     */
    function IFShapeBoxGuide(guides) {
        IFGuide.call(this, guides);
    }

    IFObject.inheritAndMix(IFShapeBoxGuide, IFGuide, [IFGuide.Map]);

    IFShapeBoxGuide.GUIDE_MARGIN = 20;

    /** @override */
    IFShapeBoxGuide.prototype.map = function (x, y) {
        var resX = null;
        var resY = null;
        var guideX = null;
        var guideY = null;
        var result = null;
        if (this._scene.getProperty('singlePage')) {
            var snapDistance = this._scene.getProperty('snapDist');

            var _snap = function (shape) {
                var bBox = shape.getGeometryBBox();
                if (bBox && !bBox.isEmpty()) {
                    var tl = bBox.getSide(IFRect.Side.TOP_LEFT);
                    var br = bBox.getSide(IFRect.Side.BOTTOM_RIGHT);
                    var cntr = bBox.getSide(IFRect.Side.CENTER);
                    var pivots = [tl, br, cntr];
                    var sides = [IFRect.Side.TOP_LEFT, IFRect.Side.BOTTOM_RIGHT, IFRect.Side.CENTER];
                    for (var i = 0; i < sides.length; ++i) {
                        var pivot = pivots[i];
                        if (resX === null && Math.abs(x - pivot.getX()) <= snapDistance) {
                            resX = pivot.getX();
                            if (y <= tl.getY()) {
                                guideX = [new IFPoint(resX, y - IFShapeBoxGuide.GUIDE_MARGIN),
                                    new IFPoint(resX, br.getY() + IFShapeBoxGuide.GUIDE_MARGIN)];
                            } else if (tl.getY() < y && y < br.getY()) {
                                guideX = [new IFPoint(resX, tl.getY() - IFShapeBoxGuide.GUIDE_MARGIN),
                                    new IFPoint(resX, br.getY() + IFShapeBoxGuide.GUIDE_MARGIN)];
                            } else {
                                guideX = [new IFPoint(resX, tl.getY() - IFShapeBoxGuide.GUIDE_MARGIN),
                                    new IFPoint(resX, y + IFShapeBoxGuide.GUIDE_MARGIN)];
                            }
                        }
                        if (resY === null && Math.abs(y - pivot.getY()) <= snapDistance) {
                            resY = pivot.getY();
                            if (x <= tl.getX()) {
                                guideY = [new IFPoint(x - IFShapeBoxGuide.GUIDE_MARGIN, resY),
                                    new IFPoint(br.getX() + IFShapeBoxGuide.GUIDE_MARGIN, resY)];
                            } else if (tl.getX() < x && x < br.getX()) {
                                guideY = [new IFPoint(tl.getX() - IFShapeBoxGuide.GUIDE_MARGIN, resY),
                                    new IFPoint(br.getX() + IFShapeBoxGuide.GUIDE_MARGIN, resY)];
                            } else {
                                guideY = [new IFPoint(tl.getX() - IFShapeBoxGuide.GUIDE_MARGIN, resY),
                                    new IFPoint(x + IFShapeBoxGuide.GUIDE_MARGIN, resY)];
                            }
                        }
                    }
                }
            };

            var page = this._scene.getActivePage();

            page.accept(function (node) {
                if (node instanceof IFShape && node.getParent() instanceof IFLayer) {
                    _snap(node);
                }
            });
        }

        if (resX !== null || resY !== null) {
            result = {
                x: resX !== null ? {value: resX, guide: guideX} : null,
                y: resY !== null ? {value: resY, guide: guideY} : null};
        }

        return result;
    };

    /** @override */
    IFShapeBoxGuide.prototype.isMappingAllowed = function () {
        return !ifPlatform.modifiers.metaKey;
    };

    /** @override */
    IFShapeBoxGuide.prototype.toString = function () {
        return "[Object IFShapeBoxGuide]";
    };

    _.IFShapeBoxGuide = IFShapeBoxGuide;
})(this);

