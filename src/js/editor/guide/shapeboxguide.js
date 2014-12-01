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

    /** @override */
    GShapeBoxGuide.prototype.map = function (x, y, useMargin) {
        var resX = null;
        var resY = null;
        var guideX = null;
        var guideY = null;
        var deltaX = null;
        var deltaY = null;
        var result = null;
        var delta;
        var snapDistance = this._scene.getWorkspace().getSnapDistance();
        var margin = useMargin ? GShapeBoxGuide.GUIDE_MARGIN : 0;

        var _snap = function (shape) {
            if (this._exclusions && this._exclusions.length) {
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
                    delta = Math.abs(x - pivot.getX());
                    if (resX === null && delta <= snapDistance ||
                        resX !== null && delta < Math.abs(x - resX)) {

                        resX = pivot.getX();
                        deltaX = delta;
                        if (y <= tl.getY()) {
                            guideX = [new GPoint(resX, y - margin),
                                new GPoint(resX, br.getY() + margin)];
                        } else if (tl.getY() < y && y < br.getY()) {
                            guideX = [new GPoint(resX, tl.getY() - margin),
                                new GPoint(resX, br.getY() + margin)];
                        } else {
                            guideX = [new GPoint(resX, tl.getY() - margin),
                                new GPoint(resX, y + margin)];
                        }
                    } else if (resX !== null && delta === Math.abs(x - resX)) {
                        resX = pivot.getX();
                        deltaX = delta;
                        if (y <= tl.getY()) {
                            if (guideX[1].getY() < br.getY() + margin) {
                                guideX[1] = new GPoint(resX, br.getY() + margin);
                            }
                        } else if (tl.getY() < y && y < br.getY()) {
                            if (guideX[1].getY() < br.getY() + margin) {
                                guideX[1] = new GPoint(resX, br.getY() + margin);
                            }
                            if (guideX[0].getY() > tl.getY() - margin) {
                                guideX[0] = new GPoint(resX, tl.getY() - margin);
                            }
                        } else { // y >= br.getY()
                            if (guideX[0].getY() > tl.getY() - margin) {
                                guideX[0] = new GPoint(resX, tl.getY() - margin);
                            }
                        }
                    }

                    delta = Math.abs(y - pivot.getY());
                    if (resY === null && delta <= snapDistance ||
                        resY !== null && delta < Math.abs(y - resY)) {

                        resY = pivot.getY();
                        deltaY = delta;
                        if (x <= tl.getX()) {
                            guideY = [new GPoint(x - margin, resY),
                                new GPoint(br.getX() + margin, resY)];
                        } else if (tl.getX() < x && x < br.getX()) {
                            guideY = [new GPoint(tl.getX() - margin, resY),
                                new GPoint(br.getX() + margin, resY)];
                        } else {
                            guideY = [new GPoint(tl.getX() - margin, resY),
                                new GPoint(x + margin, resY)];
                        }
                    } else if (resY !== null && delta === Math.abs(y - resY)) {
                        resY = pivot.getY();
                        deltaY = delta;
                        if (y <= tl.getX()) {
                            if (guideY[1].getX() < br.getX() + margin) {
                                guideY[1] = new GPoint(br.getX() + margin, resY);
                            }
                        } else if (tl.getX() < y && y < br.getX()) {
                            if (guideY[1].getX() < br.getX() + margin) {
                                guideY[1] = new GPoint(br.getX() + margin, resY);
                            }
                            if (guideY[0].getX() > tl.getX() - margin) {
                                guideY[0] = new GPoint(tl.getX() - margin, resY);
                            }
                        } else { // y >= br.getX()
                            if (guideY[0].getX() > tl.getX() - margin) {
                                guideY[0] = new GPoint(tl.getX() - margin, resY);
                            }
                        }
                    }
                }
            }
        }.bind(this);

        var layer = this._scene.getActiveLayer();

        layer.accept(function (node) {
            if (node instanceof GShape && node.getParent() instanceof GLayer) {
                _snap(node);
            }
        });

        if (resX !== null || resY !== null) {
            result = {
                x: resX !== null ? {value: resX, guide: guideX, delta: deltaX} : null,
                y: resY !== null ? {value: resY, guide: guideY, delta: deltaY} : null
            };
        }

        return result;
    };

    /** @override */
    GShapeBoxGuide.prototype.isMappingAllowed = function (detail) {
        return GGuide.Map.prototype.isMappingAllowed.call(this, detail) && !ifPlatform.modifiers.metaKey;
    };

    GShapeBoxGuide.prototype.useExclusions = function (exclusions) {
        var node;
        this._exclusions = [];
        for (var i = 0; i < exclusions.length; ++i) {
            node = exclusions[i];
            if (node instanceof GShape) {
                this._exclusions.push(node);
            }
        }
    };

    /** @override */
    GShapeBoxGuide.prototype.toString = function () {
        return "[Object GShapeBoxGuide]";
    };

    _.GShapeBoxGuide = GShapeBoxGuide;
})(this);

