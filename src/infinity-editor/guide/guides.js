(function (_) {
    /**
     * The guide manager
     * @param {IFScene} scene
     * @class IFGuides
     * @extend GEventTarget
     * @constructor
     */
    function IFGuides(scene) {
        this._scene = scene;
        this._guides = [];
        this._counter = 0;
        this._visuals = [];

        this._shapeBoxGuide = new IFShapeBoxGuide(this);

        this._addGuide(this._shapeBoxGuide);
        this._addGuide(new IFPageGuide(this));
        this._addGuide(new IFGridGuide(this));
        this._addGuide(new IFUnitGuide(this));
    }

    IFObject.inherit(IFGuides, GEventTarget);

    /**
     * The length of snap zone lines in pixels
     * @type {Number}
     */
    IFGuides.VISUALS_LENGTH = 20;

    // -----------------------------------------------------------------------------------------------------------------
    // IFGuides.InvalidationRequestEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for an invalidation request event
     * @param {IFRect} [area] the area to invalidate
     * @class IFGuides.InvalidationRequestEvent
     * @extends GEvent
     * @constructor
     */
    IFGuides.InvalidationRequestEvent = function (area) {
        this.area = area;
    };
    IFObject.inherit(IFGuides.InvalidationRequestEvent, GEvent);

    /** @type {IFRect} */
    IFGuides.InvalidationRequestEvent.prototype.area = null;

    /** @override */
    IFGuides.InvalidationRequestEvent.prototype.toString = function () {
        return "[Event IFGuides.InvalidationRequestEvent]";
    };

    /**
     * @type {IFScene}
     * @private
     */
    IFGuides.prototype._scene = null;

    /**
     * @type {Array<IFGuide>}
     * @private
     */
    IFGuides.prototype._guides = null;

    /**
     * @type {IFShapeBoxGuide}
     * @private
     */
    IFGuides.prototype._shapeBoxGuide = null;

    /**
     * Internal counter of begin/endMap calls
     * @type {number}
     * @private
     */
    IFGuides.prototype._counter = 0;

    /**
     * An array of vusial guides' lines ends in scene coordinates
     * @type {Array<Array<IFPoint>>}
     * @private
     */
    IFGuides.prototype._visuals = null;

    /**
     * Stores the area in scene coordinates, where painting of visual guides occurs
     * @type {IFRect}
     * @private
     */
    IFGuides.prototype._area = null;

    /**
     * Call this if you want to start mapping. This needs
     * to be followed by a closing call to finishMap. If
     * you just want to map without any visual guides,
     * you don't need to call this.
     */
    IFGuides.prototype.beginMap = function () {
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
    IFGuides.prototype.finishMap = function () {
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

                this._area = new IFRect(minx, miny, maxx - minx, maxy - miny);
                this.invalidate(this._area);

                this._shapeBoxGuide.cleanExclusions();
            }
        }
    };

    /**
     * Map a point to the current snapping options
     * @param {IFPoint} point the point to map
     * @returns {IFPoint} a mapped point
     */
    IFGuides.prototype.mapPoint = function (point) {
        var resX = null;
        var resY = null;

        var guide;
        var res = null;
        var targPts = [];
        for (var i = 0; i < this._guides.length && (resX === null || resY === null); ++i) {
            guide = this._guides[i];
            if (guide.isMappingAllowed()) {
                res = guide.map(point.getX(), point.getY());
                if (res) {
                    if (res.x && resX === null) {
                        resX = res.x.value;
                        if (this._visuals && res.x.guide) {
                            if (res.x.guide instanceof IFPoint) {
                                targPts.push(res.x.guide);
                            } else {
                                this._visuals.push(res.x.guide);
                            }
                        }
                    }
                    if (res.y && resY === null) {
                        resY = res.y.value;
                        if (this._visuals && res.y.guide) {
                            if (res.y.guide instanceof IFPoint) {
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
        var resPt = new IFPoint(resX, resY);

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
     * Called whenever the guides should paint itself
     * @param {IFTransform} transform the transformation of the scene
     * @param {IFPaintContext} context
     */
    IFGuides.prototype.paint = function (transform, context) {
        var guide;
        for (var i = 0; i < this._guides.length; ++i) {
            guide = this._guides[i];
            if (guide.hasMixin(IFGuide.Visual)) {
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
     * @param {IFRect} area - an area to invalidate; if empty, last stored area painted with visuals is used
     */
    IFGuides.prototype.invalidate = function (area) {
        if (this.hasEventListeners(IFGuides.InvalidationRequestEvent)) {
            if (area && !area.isEmpty()) {
                this.trigger(new IFGuides.InvalidationRequestEvent(area));
            } else if (this._area && !this._area.isEmpty()) {
                this.trigger(new IFGuides.InvalidationRequestEvent(this._area));
                this._area = null;
            }
        }
    };

    /**
     * Returns ShapeBoxGuide
     * @returns {IFShapeBoxGuide}
     */
    IFGuides.prototype.getShapeBoxGuide = function () {
        return this._shapeBoxGuide;
    };

    /**
     * Calculates and return snap zone lines for a bbox and a location against the bbox.
     * Everything is in scene coordinates
     * @param {IFRect} bBox
     * @param {IFPoint} location
     * @return {Array<Array<IFPoint>>}
     */
    IFGuides.prototype.getBBoxSnapZones = function (bBox, location) {
        var visLines = null;
        var snapZonesAllowed = false;
        for (var i = 0; i < this._guides.length && !snapZonesAllowed; ++i) {
            var guide = this._guides[i];
            if (guide.isMappingAllowed() && !(guide instanceof IFUnitGuide)) {
                snapZonesAllowed = true;
            }
        }
        var pDst = this._scene.getProperty('pickDist');
        if (snapZonesAllowed && bBox && !bBox.isEmpty() && bBox.expanded(pDst, pDst, pDst, pDst).containsPoint(location)) {
            visLines = [];
            var side = bBox.getClosestSideName(location);
            var sidePos = bBox.getSide(side);
            var tl = bBox.getSide(IFRect.Side.TOP_LEFT);
            var br = bBox.getSide(IFRect.Side.BOTTOM_RIGHT);
            var shapeWidth = Math.abs(br.getX() - tl.getX());
            var shapeHeight = Math.abs(br.getY() - tl.getY());
            var vis1 = null;
            var vis2 = null;

            var horV;
            if (shapeWidth > IFGuides.VISUALS_LENGTH * 2) {
                horV = IFGuides.VISUALS_LENGTH;
            } else if (shapeWidth > IFGuides.VISUALS_LENGTH) {
                horV = shapeWidth / 2;
            } else {
                horV = shapeWidth;
            }
            var y1 = sidePos.getY();
            var y2 = y1;
            var x1 = tl.getX();
            switch (side) {
                case IFRect.Side.TOP_CENTER:
                case IFRect.Side.CENTER:
                case IFRect.Side.BOTTOM_CENTER:
                    x1 = sidePos.getX() - horV / 2;
                    break;
                case IFRect.Side.TOP_RIGHT:
                case IFRect.Side.RIGHT_CENTER:
                case IFRect.Side.BOTTOM_RIGHT:
                    x1 = sidePos.getX() - horV;
                    break;
            }
            var x2 = x1 + horV;
            visLines.push([new IFPoint(x1, y1), new IFPoint(x2, y2)]);

            var vertV;
            if (shapeHeight > IFGuides.VISUALS_LENGTH * 2) {
                vertV = IFGuides.VISUALS_LENGTH;
            } else if (shapeHeight > IFGuides.VISUALS_LENGTH) {
                vertV = shapeHeight / 2;
            } else {
                vertV = shapeHeight;
            }
            x1 = sidePos.getX();
            x2 = x1;
            y1 = tl.getY();
            switch (side) {
                case IFRect.Side.LEFT_CENTER:
                case IFRect.Side.CENTER:
                case IFRect.Side.RIGHT_CENTER:
                    y1 = sidePos.getY() - vertV / 2;
                    break;
                case IFRect.Side.BOTTOM_LEFT:
                case IFRect.Side.BOTTOM_CENTER:
                case IFRect.Side.BOTTOM_RIGHT:
                    y1 = sidePos.getY() - vertV;
                    break;
            }
            y2 = y1 + vertV;
            visLines.push([new IFPoint(x1, y1), new IFPoint(x2, y2)]);
        }

        return visLines;
    };

    /**
     * Add a guide to this manager
     * @param {IFGuide} guide
     */
    IFGuides.prototype._addGuide = function (guide) {
        this._guides.push(guide);
    };

    /** @override */
    IFGuides.prototype.toString = function () {
        return "[Object IFGuides]";
    };

    _.IFGuides = IFGuides;
})(this);