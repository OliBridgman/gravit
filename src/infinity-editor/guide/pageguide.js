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

    IFObject.inheritAndMix(IFPageGuide, IFGuide, [IFGuide.Visual, IFGuide.Map]);

    /** @override */
    IFPageGuide.prototype.paint = function (transform, context) {

    };

    /** @override */
    IFPageGuide.prototype.map = function (x, y) {
        var snapDistance = this._scene.getProperty('snapDist');
        var resX = null;
        var resY = null;
        var visualX = false;
        var visualY = false;
        var result = null;

        var _snap = function (page) {
            var pageBBox = page.getGeometryBBox();
            if (pageBBox && !pageBBox.isEmpty()) {
                var sides = [IFRect.Side.TOP_LEFT, IFRect.Side.BOTTOM_RIGHT, IFRect.Side.CENTER];
                for (var i = 0; i < sides.length; ++i) {
                    var pivot = pageBBox.getSide(sides[i]);
                    if (resX === null && Math.abs(x - pivot.getX()) <= snapDistance) {
                        resX = pageBBox.getX();
                        if (sides[i] == IFRect.Side.CENTER) {
                            visualX = true;
                        }
                    }
                    if (resY === null && Math.abs(y - pivot.getY()) <= snapDistance) {
                        resY = pageBBox.getY();
                        if (sides[i] == IFRect.Side.CENTER) {
                            visualY = true;
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
                x: resX !== null ? {value: resX, visual: visualX} : null,
                y: resY !== null ? {value: resY, visual: visualY} : null};
        }

        return result;
    };

    /** @override */
    IFPageGuide.prototype.toString = function () {
        return "[Object IFPageGuide]";
    };

    _.IFPageGuide = IFPageGuide;
})(this);
