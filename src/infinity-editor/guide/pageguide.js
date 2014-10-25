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
        var snapDistance = this._scene.getProperty('snapDist');
        var resX = null;
        var resY = null;
        var guideX = null;
        var guideY = null;
        var result = null;

        var _snap = function (page) {
            var pageBBox = page.getGeometryBBox();
            if (pageBBox && !pageBBox.isEmpty()) {
                var tl = pageBBox.getSide(GRect.Side.TOP_LEFT);
                var br = pageBBox.getSide(GRect.Side.BOTTOM_RIGHT);
                var cntr = pageBBox.getSide(GRect.Side.CENTER);
                var pivots = [tl, br, cntr];
                var sides = [GRect.Side.TOP_LEFT, GRect.Side.BOTTOM_RIGHT, GRect.Side.CENTER];
                for (var i = 0; i < sides.length; ++i) {
                    var pivot = pivots[i];
                    if (resX === null && Math.abs(x - pivot.getX()) <= snapDistance) {
                        resX = pivot.getX();
                        if (sides[i] == GRect.Side.CENTER) {
                            guideX = [new GPoint(resX, tl.getY()), new GPoint(resX, br.getY())];
                        }
                    }
                    if (resY === null && Math.abs(y - pivot.getY()) <= snapDistance) {
                        resY = pivot.getY();
                        if (sides[i] == GRect.Side.CENTER) {
                            guideY = [new GPoint(tl.getX(), resY), new GPoint(br.getX(), resY)];
                        }
                    }
                }
            }
        };

        var page;
        if (this._scene.getProperty('singlePage')) {
            _snap(this._scene.getActivePage());
        } else {
            for (var child = this._scene.getFirstChild(); child !== null && (resX === null || resY === null);
                    child = child.getNext()) {

                // Snap to pages
                if (child instanceof GPage && !child.hasFlag(GElement.Flag.Hidden)) {
                    _snap(child);
                }
            }
        }

        if (resX !== null || resY !== null) {
            result = {
                x: resX !== null ? {value: resX, guide: guideX} : null,
                y: resY !== null ? {value: resY, guide: guideY} : null};
        }

        return result;
    };

    /** @override */
    GPageGuide.prototype.isMappingAllowed = function () {
        return !ifPlatform.modifiers.metaKey;
    };

    /** @override */
    GPageGuide.prototype.toString = function () {
        return "[Object GPageGuide]";
    };

    _.GPageGuide = GPageGuide;
})(this);
