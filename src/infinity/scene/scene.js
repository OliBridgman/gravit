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
     * @version 1.0
     */
    function GXScene() {
        this._scene = this;
        this._setDefaultProperties(GXScene.MetaProperties);

        // Append our page and layer sets
        this.appendChild(new GXPageSet(), true);
        this.appendChild(new GXLayerSet(), true);

        // Append our default layers which are, from top to bottom:
        // - Foreground layer (marked as active by default)
        // - Guide layer
        // - Background layer
        var backgroundLayer = new GXLayer();
        backgroundLayer.setProperties(['title', 'type'], ['Background', GXLayer.Type.Draft]);
        this.getLayerSet().appendChild(backgroundLayer, true);

        var guideLayer = new GXLayer();
        guideLayer.setProperties(['title', 'type'], ['Guides', GXLayer.Type.Guide]);
        this.getLayerSet().appendChild(guideLayer, true);

        var foregroundLayer = new GXLayer();
        foregroundLayer.setProperties(['title', 'type'], ['Foreground', GXLayer.Type.Vector]);
        this.getLayerSet().appendChild(foregroundLayer, true);
    }

    GXNode.inheritAndMix("scene", GXScene, GXElement, [GXNode.Container, GXNode.Properties, GXNode.Store, GEventTarget]);

    /**
     * The current version of scenes
     * @type {Number}
     * @version 1.0
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
    /**
     * @type {GXPageSet}
     * @private
     */
    GXScene.prototype._pageSet = null;

    /**
     * @type {GXLayerSet}
     * @private
     */
    GXScene.prototype._layerSet = null;

    /**
     * @returns {GXPageSet}
     */
    GXScene.prototype.getPageSet = function () {
        if (!this._pageSet) {
            this._pageSet = this.querySingle("pageSet");
        }
        return this._pageSet;
    };

    /**
     * @returns {GXLayerSet}
     */
    GXScene.prototype.getLayerSet = function () {
        if (!this._layerSet) {
            this._layerSet = this.querySingle("layerSet");
        }
        return this._layerSet;
    };

    /** @override */
    GXScene.prototype.store = function (blob) {
        if (GXNode.Store.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXScene.MetaProperties);
            blob.version = this.$version;
            return true;
        }
        return false;
    };

    /** @override */
    GXScene.prototype.restore = function (blob) {
        // Make sure to extract pageSet and layerSet
        // from our blob's children first and remove them
        // from the blob to avoid restoring them
        if (blob.hasOwnProperty('$')) {
            var index = 0;
            while (index < blob.$.length) {
                var child = blob.$[index];
                var type = child['@'];

                if (type === 'pageSet' || type === 'layerSet') {
                    if ((type === 'pageSet' && !this.getPageSet().restore(child)) ||
                        (type === 'layerSet' && !this.getLayerSet().restore(child))) {
                        return false;
                    }

                    blob.$.splice(index, 1);
                } else {
                    ++index;
                }
            }
        }

        // Now call default implementation and do further work
        if (GXNode.Store.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXScene.MetaProperties, true);
            return true;
        }
        return false;
    };

    /** @override */
    GXScene.prototype.paint = function (context, clipToPage) {
        if (!this._preparePaint(context)) {
            return;
        }

        // If we're either in output mode or in single page mode we'll
        // be clipping to the corresponding page(s) if their areas
        // are falling within the dirty area
        var cfg = context.configuration;
        var hasClipped = false;
        if (cfg.paintMode === GXScenePaintConfiguration.PaintMode.Output || clipToPage) {
            // Reset canvas transform and save it
            var canvasTransform = context.canvas.resetTransform();

            // Clip by pages now if any
            for (var page = this._pageSet.getFirstChild(); page !== null; page = page.getNext()) {
                if (!clipToPage || page === clipToPage) {
                    var pageBBox = page.getGeometryBBox();
                    if (!context.dirtyMatcher || (context.dirtyMatcher && context.dirtyMatcher.isDirty(pageBBox))) {
                        pageBBox = canvasTransform.mapRect(pageBBox).toAlignedRect();
                        context.canvas.clipRect(pageBBox.getX(), pageBBox.getY(), pageBBox.getWidth(), pageBBox.getHeight());
                        hasClipped = true;
                    }
                }
            }

            // Assign original transform again
            context.canvas.setTransform(canvasTransform);
        }

        // Paint layers now eventually clipped by pages
        this._layerSet.paint(context);

        // Reset clipping if we had have any
        if (hasClipped) {
            context.canvas.resetClip();
        }

        // Finishing painting
        this._finishPaint(context);
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
     * Invalidate something
     * @param {GRect} [area] optional dirty area, if null marks the whole scene as being dirty
     * @private
     */
    GXScene.prototype._invalidateArea = function (area) {
        if (this.hasEventListeners(GXScene.InvalidationRequestEvent)) {
            this.trigger(new GXScene.InvalidationRequestEvent(area));
        }
    };

    /**
     * Apply imported ICC Profile
     * @param {GXICCProfileData} iccProfileData
     */
    GXScene.prototype.applyICCProfile = function (iccProfileData) {
        // TODO
    };

    _.GXScene = GXScene;
})(this);