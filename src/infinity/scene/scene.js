(function (_) {
    /**
     * A scene covers all graphical resources
     * @class GXScene
     * @extends GXElement
     * @mixes GXNode.Container
     * @mixes GXNode.Properties
     * @mixes GXNode.Store
     * @mixes GEventTarget
     * @constructor
     */
    function GXScene() {
        this._scene = this;
        this._setDefaultProperties(GXScene.MetaProperties);
    }

    GXNode.inheritAndMix("scene", GXScene, GXElement, [GXNode.Container, GXNode.Properties, GXNode.Store, GEventTarget]);

    /**
     * The padding between pages
     * @type {number}
     */
    GXScene.PAGE_SPACING = 10;

    /**
     * The current version of scenes
     * @type {Number}
     */
    GXScene.VERSION = 1;

    /**
     * The meta properties of a scene and their defaults
     */
    GXScene.MetaProperties = {
        /** Version of the scene */
        version: GXScene.VERSION,
        /** The unit used externally */
        unit: GXLength.Unit.PT,
        /** The snap distance */
        snapDist: 3,
        /** The pick distance */
        pickDist: 3,
        /** The cursor distance (small and big) */
        crDistSmall: 1,
        crDistBig: 10,
        /** The cursor constraint in radians */
        crConstraint: 0,
        /** The grid size */
        gridSize: 5,
        /** Whether to snap to the grid or not */
        gridSnap: false,
        /** Whether to snap to pages or not */
        pageSnap: true,
        /** Whether to snap to page margins or not */
        pageMarginSnap: true,
        /** Whether to snap to page grid or not */
        pageGridSnap: true,
        /** Whether to snap to other bboxes or not */
        bboxSnap: true,
        /** Whether to snap to guides or not */
        guideSnap: true
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXScene.InvalidationRequestEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for an invalidation request event
     * @param {GRect} [area] a repaint area, defaults to null means to repaint all
     * @class GXScene.InvalidationRequestEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GXScene.InvalidationRequestEvent = function (area) {
        this.area = area ? area : null;
    };
    GObject.inherit(GXScene.InvalidationRequestEvent, GEvent);

    /** @type GRect */
    GXScene.InvalidationRequestEvent.prototype.area = null;

    /** @override */
    GXScene.InvalidationRequestEvent.prototype.toString = function () {
        return "[Event GXScene.InvalidationRequestEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXScene Class
    // -----------------------------------------------------------------------------------------------------------------
    /** @override */
    GXScene.prototype.store = function (blob) {
        if (GXNode.Store.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXScene.MetaProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXScene.prototype.restore = function (blob) {
        if (GXNode.Store.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXScene.MetaProperties);
            return true;
        }
        return false;
    };

    /**
     * Converts a string into a length with the document's unit.
     * @param {string} string a number, a length or an equation
     * @returns {GXLength} a length in document units or null
     * if string couldn't be parsed
     */
    GXScene.prototype.stringToLength = function (string) {
        string = gUtil.replaceAll(string, ',', '.');
        return GXLength.parseEquation(string, this.$unit);
    };

    /**
     * Converts a string into a point value with the document's unit.
     * @param {string} string a number, a length or an equation
     * @returns {Number} a length in points or null
     * if string couldn't be parsed
     */
    GXScene.prototype.stringToPoint = function (string) {
        var length = this.stringToLength(string);
        if (length) {
            return length.toPoint();
        }
        return null;
    };

    /**
     * Converts a length into a string with the document's unit.
     * @param {GXLength} length the length to convert
     * @returns {string} the resulting string without unit postfix
     */
    GXScene.prototype.lengthToString = function (length) {
        var value = length.toUnit(this.$unit);
        var string = gMath.round(value, 3).toString();
        return gUtil.replaceAll(string, '.', ',');
    };

    /**
     * Converts a point value into a string with the document's unit.
     * @param {Number} value the value in points to convert
     * @returns {string} the resulting string without unit postfix
     */
    GXScene.prototype.pointToString = function (value) {
        return this.lengthToString(new GXLength(value));
    };

    /**
     * This will return all elements that are either intersecting
     * with a given rectangle or are perfectly inside it. For testing,
     * the element's paint bbox will be used.
     * @param {GRect} rect the rect to test against
     * @param {Boolean} inside if true, matches need to be fully
     * enclosed by the rect to be returned, otherwise it is enough
     * when they're intersecting with rect. Defaults to false.
     * @return {Array<GXElement>} an array of elements that are part
     * of a given rectangle in their natural order. May return an empty array.
     */
    GXScene.prototype.getElementsByBBox = function (rect, inside) {
        // TODO: Optimize this by using spatial map
        var result = [];
        this.acceptChildren(function (node) {
                if (node instanceof GXElement) {
                    var paintBBox = node.getPaintBBox();

                    if (paintBBox && !paintBBox.isEmpty()) {
                        if ((inside && rect.intersectsRect(paintBBox)) ||
                            (!inside && rect.containsRect(paintBBox))) {
                            result.push(node);
                        }
                    }
                }
            }
        );
        return result;
    };

    /**
     * Returns the number of pages in this scene
     * @returns {Number} the number of pages in this scene
     */
    GXScene.prototype.getPageCount = function () {
        var count = 0;
        for (var child = this.getFirstChild(); child !== null; child = child.getNext()) {
            if (child instanceof GXPage) {
                count++;
            }
        }
        return count;
    };

    /**
     * Returns a point for a new page to be inserted
     * @returns {GPoint}
     */
    GXScene.prototype.getPageInsertPosition = function () {
        // TODO : Figure better way to avoid any potential intersection of the page with others
        for (var child = this.getLastChild(); child !== null; child = child.getPrevious()) {
            if (child instanceof GXPage) {
                return new GPoint(
                    child.getProperty('x') + child.getProperty('w') + GXScene.PAGE_SPACING,
                    child.getProperty('y')
                );
            }
        }
        return new GPoint(0, 0);
    };

    /**
     * Checks and returns wether a given page will intersect with
     * any other page(s) with a given pageRect
     * @param {GXPage} page the page to test for intersection w/ others
     * @param {GRect} pageRect the new page rect to test for intersection w/ others
     */
    GXScene.prototype.willPageIntersectWithOthers = function (page, pageRect) {
        pageRect = pageRect.expanded(GXScene.PAGE_SPACING, GXScene.PAGE_SPACING, GXScene.PAGE_SPACING, GXScene.PAGE_SPACING);
        for (var child = this.getLastChild(); child !== null; child = child.getPrevious()) {
            if (child instanceof GXPage && child !== page) {
                var currentPageRect = child.getGeometryBBox();
                if (currentPageRect && currentPageRect.intersectsRect(pageRect)) {
                    return true;
                }
            }
        }
        return false;
    };

    /**
     * Invalidate something
     * @param {GRect} [area] optional dirty area, if null marks the whole scene as being dirty
     * @private
     */
    GXScene.prototype._invalidateArea = function (area) {
        if (this.hasEventListeners(GXScene.InvalidationRequestEvent)) {
            this.trigger(new GXScene.InvalidationRequestEvent(area));
        }
    };

    _.GXScene = GXScene;
})(this);