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

        // guides go from last to first
        this.addGuide(new IFUnitGuide(this));
        this.addGuide(new IFGridGuide(this));
        this.addGuide(new IFPageGuide(this));
    }

    IFObject.inherit(IFGuides, GEventTarget);

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
     * Call this if you want to start mapping. This needs
     * to be followed by a closing call to finishMap. If
     * you just want to map without any visual guides,
     * you don't need to call this.
     */
    IFGuides.prototype.beginMap = function () {
        // TODO
    };

    /**
     * Finish mapping. See beginMap description.
     */
    IFGuides.prototype.finishMap = function () {
        // TODO
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
        for (var i = 0; i < this._guides.length && (resX === null || resY === null); ++i) {
            guide = this._guides[i];
            res = guide.map(point.getX(), point.getY());
            if (res) {
                if (res.x && resX === null) {
                    resX = res.x.value;
                    // TODO: if visual is true and beginMap has been called, then paint
                }
                if (res.y && resY === null) {
                    resY = res.y.value;
                    // TODO: if visual is true and beginMap has been called, then paint
                }
            }
            res = null;
        }

        if (resX === null) {
            resX = point.getX();
        }

        if (resY === null) {
            resY = point.getY();
        }

        return new IFPoint(resX, resY);
    };

    /**
     * Called whenever the guides should paint itself
     * @param {IFTransform} transform the transformation of the scene
     * @param {IFPaintContext} context
     */
    IFGuides.prototype.paint = function (transform, context) {
        var fillRect = context.canvas.getTransform(false).inverted().mapRect(new IFRect(0, 150.5, context.canvas.getWidth(), context.canvas.getHeight()));
        context.canvas.strokeLine(fillRect.getX(), fillRect.getY(), fillRect.getX() + fillRect.getWidth(), fillRect.getY(), 1, context.guideOutlineColor);

        var guide;
        for (var i = 0; i < this._guides.length; ++i) {
            guide = this._guides[i];
            if (guide.hasMixin(IFGuide.Visual)) {
                guide.paint(transform, context);
            }
        }
    };

    IFGuides.prototype.invalidate = function (area) {
        if (area && !area.isEmpty()) {
            this.trigger(new IFGuides.InvalidationRequestEvent(area));
        }
    };

    /**
     * Add a guide to this manager
     * @param {IFGuide} guide
     */
    IFGuides.prototype.addGuide = function (guide) {
        this._guides.push(guide);
    };

    /** @override */
    IFGuides.prototype.toString = function () {
        return "[Object IFGuides]";
    };

    _.IFGuides = IFGuides;
})(this);