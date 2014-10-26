(function (_) {
    /**
     * The grid guide
     * @param {GGuides} guides
     * @class GShapeBoxGuide
     * @extends GGuide
     * @mixes GGuide.Visual
     * @mixes GGuide.Map
     * @constructor
     */
    function GShapeBoxGuide(guides) {
        GGuide.call(this, guides);
    }

    GObject.inheritAndMix(GShapeBoxGuide, GGuide, [GGuide.Map]);

    GShapeBoxGuide.GUIDE_MARGIN = 20;

    /**
     * Array of elements, which should be excluded from snapping to them
     * @type {Array}
     * @private
     */
    GShapeBoxGuide.prototype._exclusions = null;

    /** @override */
    GShapeBoxGuide.prototype.map = function (x, y) {
        var resX = null;
        var resY = null;
        var guideX = null;
        var guideY = null;
        var result = null;
        if (this._scene.getProperty('singlePage')) {
            var snapDistance = this._scene.getProperty('snapDist');

            var _snap = function (shape) {
                if (this._exclusions) {
                    for (var i = 0; i < this._exclusions.length; ++i) {
                        if (this._exclusions[i] == shape) {
                            return;
                        }
                    }
                }

                var bBox = shape.getGeometryBBox();
                if (bBox && !bBox.isEmpty()) {
                    var tl = bBox.getSide(GRect.Side.TOP_LEFT);
                    var br = bBox.getSide(GRect.Side.BOTTOM_RIGHT);
                    var cntr = bBox.getSide(GRect.Side.CENTER);
                    var pivots = [tl, br, cntr];
                    var sides = [GRect.Side.TOP_LEFT, GRect.Side.BOTTOM_RIGHT, GRect.Side.CENTER];
                    for (var i = 0; i < sides.length; ++i) {
                        var pivot = pivots[i];
                        if (resX === null && Math.abs(x - pivot.getX()) <= snapDistance) {
                            resX = pivot.getX();
                            if (y <= tl.getY()) {
                                guideX = [new GPoint(resX, y - GShapeBoxGuide.GUIDE_MARGIN),
                                    new GPoint(resX, br.getY() + GShapeBoxGuide.GUIDE_MARGIN)];
                            } else if (tl.getY() < y && y < br.getY()) {
                                guideX = [new GPoint(resX, tl.getY() - GShapeBoxGuide.GUIDE_MARGIN),
                                    new GPoint(resX, br.getY() + GShapeBoxGuide.GUIDE_MARGIN)];
                            } else {
                                guideX = [new GPoint(resX, tl.getY() - GShapeBoxGuide.GUIDE_MARGIN),
                                    new GPoint(resX, y + GShapeBoxGuide.GUIDE_MARGIN)];
                            }
                        }
                        if (resY === null && Math.abs(y - pivot.getY()) <= snapDistance) {
                            resY = pivot.getY();
                            if (x <= tl.getX()) {
                                guideY = [new GPoint(x - GShapeBoxGuide.GUIDE_MARGIN, resY),
                                    new GPoint(br.getX() + GShapeBoxGuide.GUIDE_MARGIN, resY)];
                            } else if (tl.getX() < x && x < br.getX()) {
                                guideY = [new GPoint(tl.getX() - GShapeBoxGuide.GUIDE_MARGIN, resY),
                                    new GPoint(br.getX() + GShapeBoxGuide.GUIDE_MARGIN, resY)];
                            } else {
                                guideY = [new GPoint(tl.getX() - GShapeBoxGuide.GUIDE_MARGIN, resY),
                                    new GPoint(x + GShapeBoxGuide.GUIDE_MARGIN, resY)];
                            }
                        }
                    }
                }
            }.bind(this);

            var page = this._scene.getActivePage();

            page.accept(function (node) {
                if (node instanceof GShape && node.getParent() instanceof GLayer) {
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
    GShapeBoxGuide.prototype.isMappingAllowed = function () {
        return !ifPlatform.modifiers.metaKey;
    };

    /**
     * Use the passed list of elements as exclusions from snapping to them
     * @param {Array} exclusions
     */
    GShapeBoxGuide.prototype.useExclusions = function (exclusions) {
        this._exclusions = exclusions;
    };

    /**
     * Clean exclusions list
     */
    GShapeBoxGuide.prototype.cleanExclusions = function () {
        this._exclusions = null;
    };

    /** @override */
    GShapeBoxGuide.prototype.toString = function () {
        return "[Object GShapeBoxGuide]";
    };

    _.GShapeBoxGuide = GShapeBoxGuide;
})(this);

