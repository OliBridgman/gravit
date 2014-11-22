(function (_) {
    /**
     * The guide manager
     * @param {GScene} scene
     * @class GGuides
     * @extend GEventTarget
     * @constructor
     */
    function GGuides(scene) {
        this._scene = scene;
        this._guides = [];
        this._counter = 0;
        this._visuals = [];

        this._shapeBoxGuide = new GShapeBoxGuide(this);

        this._addGuide(this._shapeBoxGuide);
        this._addGuide(new GPageGuide(this));
        this._addGuide(new GGridGuide(this));
        this._addGuide(new GUnitGuide(this));
    }

    GObject.inherit(GGuides, GEventTarget);

    /**
     * The length of snap zone lines in pixels
     * @type {Number}
     */
    GGuides.VISUALS_LENGTH = 10;

    // -----------------------------------------------------------------------------------------------------------------
    // GGuides.InvalidationRequestEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for an invalidation request event
     * @param {GRect} [area] the area to invalidate
     * @class GGuides.InvalidationRequestEvent
     * @extends GEvent
     * @constructor
     */
    GGuides.InvalidationRequestEvent = function (area) {
        this.area = area;
    };
    GObject.inherit(GGuides.InvalidationRequestEvent, GEvent);

    /** @type {GRect} */
    GGuides.InvalidationRequestEvent.prototype.area = null;

    /** @override */
    GGuides.InvalidationRequestEvent.prototype.toString = function () {
        return "[Event GGuides.InvalidationRequestEvent]";
    };

    /**
     * @type {GScene}
     * @private
     */
    GGuides.prototype._scene = null;

    /**
     * @type {Array<GGuide>}
     * @private
     */
    GGuides.prototype._guides = null;

    /**
     * @type {GShapeBoxGuide}
     * @private
     */
    GGuides.prototype._shapeBoxGuide = null;

    /**
     * Internal counter of begin/endMap calls
     * @type {number}
     * @private
     */
    GGuides.prototype._counter = 0;

    /**
     * An array of vusial guides' lines ends in scene coordinates
     * @type {Array<Array<GPoint>>}
     * @private
     */
    GGuides.prototype._visuals = null;

    /**
     * Stores the area in scene coordinates, where painting of visual guides occurs
     * @type {GRect}
     * @private
     */
    GGuides.prototype._area = null;

    /**
     * Call this if you want to start mapping. This needs
     * to be followed by a closing call to finishMap. If
     * you just want to map without any visual guides,
     * you don't need to call this.
     */
    GGuides.prototype.beginMap = function () {
        if (this._counter == 0) {
            this._visuals = [];
            if (this._area && !this._area.isEmpty()) {
                this.invalidate(this._area);
            }
            this._area = null;
        }
        ++this._counter;
    };

    /**
     * Finish mapping. See beginMap description.
     */
    GGuides.prototype.finishMap = function () {
        if (this._counter > 0) {
            --this._counter;
            if (this._counter == 0 && this._visuals.length) {
                var minx = null;
                var miny = null;
                var maxx = null;
                var maxy = null;
                var visLine;
                for (var i = 0; i < this._visuals.length; ++i) {
                    visLine = this._visuals[i];
                    for (var j = 0; j < 2; ++j) {
                        if (minx === null || minx > visLine[j].getX()) {
                            minx = visLine[j].getX();
                        }
                        if (miny === null || miny > visLine[j].getY()) {
                            miny = visLine[j].getY();
                        }
                        if (maxx === null || maxx < visLine[j].getX()) {
                            maxx = visLine[j].getX();
                        }
                        if (maxy === null || maxy < visLine[j].getY()) {
                            maxy = visLine[j].getY();
                        }
                    }
                }
                minx -= 1;
                miny -= 1;
                maxx += 1;
                maxy += 1;

                this._area = new GRect(minx, miny, maxx - minx, maxy - miny);
                this.invalidate(this._area);

                this._shapeBoxGuide.cleanExclusions();
            }
        }
    };

    /**
     * Map a point to the current snapping options
     * @param {GPoint} point the point to map
     * @param {Boolean} detail - use only guides with DetailMap mixin
     * @returns {GPoint} a mapped point
     */
    GGuides.prototype.mapPoint = function (point, detail) {
        var resX = null;
        var resY = null;

        var guide;
        var res = null;
        var targPts = [];
        for (var i = 0; i < this._guides.length && (resX === null || resY === null); ++i) {
            guide = this._guides[i];
            if (guide.isMappingAllowed(detail)) {
                res = guide.map(point.getX(), point.getY(), true);
                if (res) {
                    if (res.x && resX === null) {
                        resX = res.x.value;
                        if (this._visuals && res.x.guide) {
                            if (res.x.guide instanceof GPoint) {
                                targPts.push(res.x.guide);
                            } else {
                                this._visuals.push(res.x.guide);
                            }
                        }
                    }
                    if (res.y && resY === null) {
                        resY = res.y.value;
                        if (this._visuals && res.y.guide) {
                            if (res.y.guide instanceof GPoint) {
                                targPts.push(res.y.guide);
                            } else {
                                this._visuals.push(res.y.guide);
                            }
                        }
                    }
                }
                res = null;
            }
        }

        if (resX === null) {
            resX = point.getX();
        }

        if (resY === null) {
            resY = point.getY();
        }
        var resPt = new GPoint(resX, resY);

        var pt;
        for (var i = 0; i < targPts.length; ++i) {
            pt = targPts[i];
            if (Math.abs(resX - pt.getX()) >= 2 || Math.abs(resY - pt.getY()) >= 2) {
                this._visuals.push([resPt, pt]);
            }
        }

        return resPt;
    };

    /**
     * Map a rectangle to the current snapping options
     * @param {GRect} rectangle the rectangle to map
     * @returns {GRect} a mapped rectangle
     */
    GGuides.prototype.mapRect = function (rect) {
        /*
            The algorithm is the following:
            1) For the guide with the first priority try to snap top left, top right, bottom right, bottom left, center:
              - if more than 1 snaps, then select the closest snap point and return
              - if 1 snap - snap and return
              - if no snaps, try to snap horizontally: top, bottom, center; vertically: left, right, center
            2) If on the step 1 no snaps or just horizontal of vertical,
             try to find the same way missed snap with the guides with next priorities
         */

        var resRect = rect;
        var tl = rect.getSide(GRect.Side.TOP_LEFT);
        var br = rect.getSide(GRect.Side.BOTTOM_RIGHT);
        var cntr = rect.getSide(GRect.Side.CENTER);
        var pivots = [tl, br, cntr];
        var sides = [GRect.Side.TOP_LEFT, GRect.Side.BOTTOM_RIGHT, GRect.Side.CENTER];

        var resX = [];
        var resY = [];

        var guide;
        var res = null;
        var targPts = [];
        var visuals = [];
        for (var i = 0; i < this._guides.length && (!resX.length || !resY.length); ++i) {
            guide = this._guides[i];
            if (guide.isMappingAllowed()) {
                for (var j = 0; j < sides.length; ++j) {
                    var pivot = pivots[j];
                    res = guide.map(pivot.getX(), pivot.getY());
                    if (res) {
                        if (res.x) {
                            if (!resX.length) {

                                resX.push({x: res.x, idx: i, pivotIdx: j});
                            } else if (resX[0].idx === i && resX[0].x.delta !== null && res.x.delta !== null &&
                                res.x.delta < resX[0].x.delta) {

                                resX[0] = {x: res.x, idx: i, pivotIdx: j};
                            }
                        }
                        if (res.y) {
                            if (!resY.length) {

                                resY.push({y: res.y, idx: i, pivotIdx: j});
                            } else if (resY[0].idx === i && resY[0].y.delta !== null && res.y.delta !== null &&
                                res.y.delta < resY[0].y.delta) {

                                resY[0] = {y: res.y, idx: i, pivotIdx: j};
                            }
                        }
                    }
                    res = null;
                }
            }
        }

        var deltaX = 0;
        var deltaY = 0;
        if (resX.length) {
            deltaX = resX[0].x.value - pivots[resX[0].pivotIdx].getX();
        }

        if (resY.length) {
            deltaY = resY[0].y.value - pivots[resY[0].pivotIdx].getY();
        }

        // There is a mapping to apply. Check visuals to draw
        if (deltaX || deltaY) {
            resRect = rect.translated(deltaX, deltaY);
            var deltaPt = new GPoint(deltaX, deltaY);
            tl = tl.add(deltaPt);
            br = br.add(deltaPt);
            cntr = cntr.add(deltaPt);
            pivots = [tl, br, cntr];

            resX = [];
            resY = [];
            res = null;
            var xMin = tl.getX();
            var xMax = br.getX();
            var yMin = tl.getY();
            var yMax = br.getY();
            for (var i = 0; i < this._guides.length && (!resX.length || !resY.length); ++i) {
                guide = this._guides[i];
                if (guide.isMappingAllowed()) {
                    for (var j = 0; j < sides.length; ++j) {
                        var pivot = pivots[j];
                        res = guide.map(pivot.getX(), pivot.getY());
                        if (res) {
                            if (res.x) {
                                if (res.x.delta === 0 && (!resX.length || resX[0].idx === i)) {
                                    if (res.x.guide) {
                                        if (yMin < res.x.guide[0].getY()) {
                                            res.x.guide[0] = new GPoint(res.x.guide[0].getX(), yMin);
                                        }
                                        if (yMax > res.x.guide[1].getY()) {
                                            res.x.guide[1] = new GPoint(res.x.guide[1].getX(), yMax);
                                        }
                                    }
                                    resX.push({x: res.x, idx: i, pivotIdx: j});
                                }
                            }
                            if (res.y) {
                                if (res.y.delta === 0 && (!resY.length || resY[0].idx === i)) {
                                    if (res.y.guide) {
                                        if (xMin < res.y.guide[0].getX()) {
                                            res.y.guide[0] = new GPoint(xMin, res.y.guide[0].getY());
                                        }
                                        if (xMax > res.y.guide[1].getX()) {
                                            res.y.guide[1] = new GPoint(xMax, res.y.guide[1].getY());
                                        }
                                    }
                                    resY.push({y: res.y, idx: i, pivotIdx: j});
                                }
                            }
                        }
                        res = null;
                    }
                }
            }

            if (this._visuals) {
                for (var i = 0; i < resX.length; ++i) {
                    if (this._visuals && resX[i].x.guide) {
                        if (resX[i].x.guide instanceof GPoint) {
                            if (Math.abs(resX[i].x.value - resX[i].x.guide.getX()) >= 2 ||
                                Math.abs(pivots[resX[i].pivotIdx].getY() - resX[i].x.guide.getY()) >= 2) {

                                this._visuals.push([new GPoint(resX[i].x.value, pivots[resX[i].pivotIdx].getY()), resX[i].x.guide]);
                            }
                        } else {
                            this._visuals.push(resX[i].x.guide);
                        }
                    }
                }

                for (var i = 0; i < resY.length; ++i) {
                    if (this._visuals && resY[i].y.guide) {
                        if (resY[i].y.guide instanceof GPoint) {
                            if (Math.abs(resY[i].y.value - resY[i].y.guide.getY()) >= 2 ||
                                Math.abs(pivots[resY[i].pivotIdx].getX() - resY[i].y.guide.getX()) >= 2) {

                                this._visuals.push([new GPoint(pivots[resY[i].pivotIdx].getX(), resY[i].y.value), resY[i].y.guide]);
                            }
                        } else {
                            this._visuals.push(resY[i].y.guide);
                        }
                    }
                }
            }
        }

        return resRect;
    };

    /**
     * Called whenever the guides should paint itself
     * @param {GTransform} transform the transformation of the scene
     * @param {GPaintContext} context
     */
    GGuides.prototype.paint = function (transform, context) {
        var guide;
        for (var i = 0; i < this._guides.length; ++i) {
            guide = this._guides[i];
            if (guide.hasMixin(GGuide.Visual)) {
                guide.paint(transform, context);
            }
        }

        var visLine;
        for (var i = 0; i < this._visuals.length; ++i) {
            visLine = this._visuals[i];
            var pt0 = transform.mapPoint(visLine[0]);
            var pt1 = transform.mapPoint(visLine[1]);
            context.canvas.strokeLine(Math.floor(pt0.getX()) + 0.5, Math.floor(pt0.getY()) + 0.5,
                Math.floor(pt1.getX()) + 0.5, Math.floor(pt1.getY()) + 0.5, 1, context.guideOutlineColor);
        }

        this._visuals = [];
    };

    /**
     * Triggers invalidation request of passed area
     * @param {GRect} area - an area to invalidate; if empty, last stored area painted with visuals is used
     */
    GGuides.prototype.invalidate = function (area) {
        if (this.hasEventListeners(GGuides.InvalidationRequestEvent)) {
            if (area && !area.isEmpty()) {
                this.trigger(new GGuides.InvalidationRequestEvent(area));
            } else if (this._area && !this._area.isEmpty()) {
                this.trigger(new GGuides.InvalidationRequestEvent(this._area));
                this._area = null;
            }
        }
    };

    /**
     * Returns ShapeBoxGuide
     * @returns {GShapeBoxGuide}
     */
    GGuides.prototype.getShapeBoxGuide = function () {
        return this._shapeBoxGuide;
    };

    /**
     * Calculates and return snap zone lines for a bbox and a location against the bbox.
     * Everything is in scene coordinates
     * @param {GRect} bBox
     * @param {GPoint} location
     * @return {Array<Array<GPoint>>}
     */
    GGuides.prototype.getBBoxSnapZones = function (bBox, location) {
        var visLines = null;
        var snapZonesAllowed = false;
        for (var i = 0; i < this._guides.length && !snapZonesAllowed; ++i) {
            var guide = this._guides[i];
            if (guide.isMappingAllowed() && !(guide instanceof GUnitGuide)) {
                snapZonesAllowed = true;
            }
        }
        var pDst = this._scene.getProperty('pickDist');
        if (snapZonesAllowed && bBox && !bBox.isEmpty() && bBox.expanded(pDst, pDst, pDst, pDst).containsPoint(location)) {
            visLines = [];
            var side = bBox.getClosestSideName(location);
            var sidePos = bBox.getSide(side);
            var tl = bBox.getSide(GRect.Side.TOP_LEFT);
            var br = bBox.getSide(GRect.Side.BOTTOM_RIGHT);
            var shapeWidth = Math.abs(br.getX() - tl.getX());
            var shapeHeight = Math.abs(br.getY() - tl.getY());
            var vis1 = null;
            var vis2 = null;

            var horV;
            if (shapeWidth > GGuides.VISUALS_LENGTH * 2) {
                horV = GGuides.VISUALS_LENGTH;
            } else if (shapeWidth > GGuides.VISUALS_LENGTH) {
                horV = shapeWidth / 2;
            } else {
                horV = shapeWidth;
            }
            var y1 = sidePos.getY();
            var y2 = y1;
            var x1 = tl.getX();
            switch (side) {
                case GRect.Side.TOP_CENTER:
                case GRect.Side.CENTER:
                case GRect.Side.BOTTOM_CENTER:
                    x1 = sidePos.getX() - horV / 2;
                    break;
                case GRect.Side.TOP_RIGHT:
                case GRect.Side.RIGHT_CENTER:
                case GRect.Side.BOTTOM_RIGHT:
                    x1 = sidePos.getX() - horV;
                    break;
            }
            var x2 = x1 + horV;
            visLines.push([new GPoint(x1, y1), new GPoint(x2, y2)]);

            var vertV;
            if (shapeHeight > GGuides.VISUALS_LENGTH * 2) {
                vertV = GGuides.VISUALS_LENGTH;
            } else if (shapeHeight > GGuides.VISUALS_LENGTH) {
                vertV = shapeHeight / 2;
            } else {
                vertV = shapeHeight;
            }
            x1 = sidePos.getX();
            x2 = x1;
            y1 = tl.getY();
            switch (side) {
                case GRect.Side.LEFT_CENTER:
                case GRect.Side.CENTER:
                case GRect.Side.RIGHT_CENTER:
                    y1 = sidePos.getY() - vertV / 2;
                    break;
                case GRect.Side.BOTTOM_LEFT:
                case GRect.Side.BOTTOM_CENTER:
                case GRect.Side.BOTTOM_RIGHT:
                    y1 = sidePos.getY() - vertV;
                    break;
            }
            y2 = y1 + vertV;
            visLines.push([new GPoint(x1, y1), new GPoint(x2, y2)]);
        }

        return visLines;
    };

    /**
     * Add a guide to this manager
     * @param {GGuide} guide
     */
    GGuides.prototype._addGuide = function (guide) {
        this._guides.push(guide);
    };

    /** @override */
    GGuides.prototype.toString = function () {
        return "[Object GGuides]";
    };

    _.GGuides = GGuides;
})(this);