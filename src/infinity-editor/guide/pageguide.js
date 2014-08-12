(function (_) {
    /**
     * The grid guide
     * @param {IFGuides} guides
     * @class IFPageGuide
     * @extends IFGuide
     * @mixes IFGuide.Visual
     * @mixes IFGuide.Map
     * @constructor
     */
    function IFPageGuide(guides) {
        IFGuide.call(this, guides);
    }

    IFObject.inheritAndMix(IFPageGuide, IFGuide, [IFGuide.Map]);

    /** @override */
    IFPageGuide.prototype.map = function (x, y) {
        var snapDistance = this._scene.getProperty('snapDist');
        var resX = null;
        var resY = null;
        var guideX = null;
        var guideY = null;
        var result = null;

        var _snap = function (page) {
            var pageBBox = page.getGeometryBBox();
            if (pageBBox && !pageBBox.isEmpty()) {
                var tl = pageBBox.getSide(IFRect.Side.TOP_LEFT);
                var br = pageBBox.getSide(IFRect.Side.BOTTOM_RIGHT);
                var cntr = pageBBox.getSide(IFRect.Side.CENTER);
                var pivots = [tl, br, cntr];
                var sides = [IFRect.Side.TOP_LEFT, IFRect.Side.BOTTOM_RIGHT, IFRect.Side.CENTER];
                for (var i = 0; i < sides.length; ++i) {
                    var pivot = pivots[i];
                    if (resX === null && Math.abs(x - pivot.getX()) <= snapDistance) {
                        resX = pivot.getX();
                        if (sides[i] == IFRect.Side.CENTER) {
                            guideX = [new IFPoint(resX, tl.getY()), new IFPoint(resX, br.getY())];
                        }
                    }
                    if (resY === null && Math.abs(y - pivot.getY()) <= snapDistance) {
                        resY = pivot.getY();
                        if (sides[i] == IFRect.Side.CENTER) {
                            guideY = [new IFPoint(tl.getX(), resY), new IFPoint(br.getX(), resY)];
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
                if (child instanceof IFPage && !child.hasFlag(IFElement.Flag.Hidden)) {
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
    IFPageGuide.prototype.isMappingAllowed = function () {
        return !ifPlatform.modifiers.metaKey;
    };

    /** @override */
    IFPageGuide.prototype.toString = function () {
        return "[Object IFPageGuide]";
    };

    _.IFPageGuide = IFPageGuide;
})(this);
