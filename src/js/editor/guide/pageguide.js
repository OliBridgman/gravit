(function (_) {
    /**
     * The grid guide
     * @param {GGuides} guides
     * @class GPageGuide
     * @extends GGuide
     * @mixes GGuide.Visual
     * @mixes GGuide.Map
     * @constructor
     */
    function GPageGuide(guides) {
        GGuide.call(this, guides);
    }

    GObject.inheritAndMix(GPageGuide, GGuide, [GGuide.Map]);

    /** @override */
    GPageGuide.prototype.map = function (x, y) {
        var snapDistance = this._scene.getWorkspace().getSnapDistance();
        var resX = null;
        var resY = null;
        var guideX = null;
        var guideY = null;
        var deltaX = null;
        var deltaY= null;
        var delta;
        var result = null;

        if (this._scene instanceof GPage) {
            var page = this._scene;
            var handlePage = true;

            if (this._exclusions && this._exclusions.length) {
                for (var i = 0; i < this._exclusions.length; ++i) {
                    if (this._exclusions[i] == page) {
                        handlePage = false;
                        break;
                    }
                }
            }

            if (handlePage) {
                var pageBBox = page.getGeometryBBox();
                if (pageBBox && !pageBBox.isEmpty()) {
                    var tl = pageBBox.getSide(GRect.Side.TOP_LEFT);
                    var br = pageBBox.getSide(GRect.Side.BOTTOM_RIGHT);
                    var cntr = pageBBox.getSide(GRect.Side.CENTER);
                    var pivots = [tl, br, cntr];
                    var sides = [GRect.Side.TOP_LEFT, GRect.Side.BOTTOM_RIGHT, GRect.Side.CENTER];
                    for (var i = 0; i < sides.length; ++i) {
                        var pivot = pivots[i];
                        delta = Math.abs(x - pivot.getX());
                        if (resX === null && delta <= snapDistance) {
                            resX = pivot.getX();
                            deltaX = delta;
                            if (sides[i] == GRect.Side.CENTER) {
                                guideX = [new GPoint(resX, tl.getY()), new GPoint(resX, br.getY())];
                            }
                        }
                        delta = Math.abs(y - pivot.getY());
                        if (resY === null && delta <= snapDistance) {
                            resY = pivot.getY();
                            deltaY = delta;
                            if (sides[i] == GRect.Side.CENTER) {
                                guideY = [new GPoint(tl.getX(), resY), new GPoint(br.getX(), resY)];
                            }
                        }
                    }
                }
            }
        }

        if (resX !== null || resY !== null) {
            result = {
                x: resX !== null ? {value: resX, guide: guideX, delta: deltaX} : null,
                y: resY !== null ? {value: resY, guide: guideY, delta: deltaY} : null};
        }

        return result;
    };

    /** @override */
    GPageGuide.prototype.isMappingAllowed = function (detail) {
        return GGuide.Map.prototype.isMappingAllowed.call(this, detail) && !ifPlatform.modifiers.metaKey;
    };

    GPageGuide.prototype.useExclusions = function (exclusions) {
        var node;
        this._exclusions = [];
        for (var i = 0; i < exclusions.length; ++i) {
            node = exclusions[i];
            if (node instanceof GPage) {
                this._exclusions.push(node);
            }
        }
    };

    /** @override */
    GPageGuide.prototype.toString = function () {
        return "[Object GPageGuide]";
    };

    _.GPageGuide = GPageGuide;
})(this);
