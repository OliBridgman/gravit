(function (_) {
    /**
     * A scene covers multiple elements
     * @class GScene
     * @extends GElement
     * @mixes GNode.Container
     * @mixes GNode.Properties
     * @mixes GNode.Store
     * @mixes GEventTarget
     * @constructor
     */
    function GScene(workspace) {
        GElement.call(this);
        this._scene = this;
        this._workspace = workspace;
        this._setDefaultProperties(GScene.MetaProperties);
    }

    GObject.inheritAndMix(GScene, GElement, [GNode.Container, GNode.Properties, GNode.Store, GEventTarget]);

    /**
     * The padding between pages
     * @type {number}
     */
    GScene.PAGE_SPACING = 10;

    /**
     * The current version of scenes
     * @type {Number}
     */
    GScene.VERSION = 1;

    /**
     * The meta properties of a scene and their defaults
     */
    GScene.MetaProperties = {
        /** Version of the scene */
        version: GScene.VERSION,
        /** The unit used externally */
        unit: GLength.Unit.PT,
        /** Whether to snap to units or not */
        snapDist: 5,
        /** The pick distance */
        pickDist: 3,
        /** The cursor distance (small and big) */
        crDistSmall: 1,
        crDistBig: 10,
        /** The cursor constraint in radians */
        crConstraint: 0,
        /** The horizontal grid size */
        gridSizeX: 10,
        /** The vertical grid size */
        gridSizeY: 10,
        /** Whether the grid is active or not */
        gridActive: false
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GScene.InvalidationRequestEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for an invalidation request event
     * @param {GRect} [area] a repaint area, defaults to null means to repaint all
     * @class GScene.InvalidationRequestEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GScene.InvalidationRequestEvent = function (area) {
        this.area = area ? area : null;
    };
    GObject.inherit(GScene.InvalidationRequestEvent, GEvent);

    /** @type GRect */
    GScene.InvalidationRequestEvent.prototype.area = null;

    /** @override */
    GScene.InvalidationRequestEvent.prototype.toString = function () {
        return "[Event GScene.InvalidationRequestEvent]";
    };

    /**
     * Converts a string into a length with the document's unit.
     * @param {string} string a number, a length or an equation
     * @returns {GLength} a length in document units or null
     * if string couldn't be parsed
     */
    GScene.prototype.stringToLength = function (string) {
        return GLength.parseEquation(string, this.$unit);
    };

    /**
     * Converts a string into a point value with the document's unit.
     * @param {string} string a number, a length or an equation
     * @returns {Number} a length in points or null
     * if string couldn't be parsed
     */
    GScene.prototype.stringToPoint = function (string) {
        var length = this.stringToLength(string);
        if (length) {
            return length.toPoint();
        }
        return null;
    };

    /**
     * Converts a length into a string with the document's unit.
     * @param {GLength} length the length to convert
     * @returns {string} the resulting string without unit postfix
     */
    GScene.prototype.lengthToString = function (length) {
        return GUtil.formatNumber(length.toUnit(this.$unit));
    };

    /**
     * Converts a point value into a string with the document's unit.
     * @param {Number} value the value in points to convert
     * @returns {string} the resulting string without unit postfix
     */
    GScene.prototype.pointToString = function (value) {
        return this.lengthToString(new GLength(value));
    };

    /**
     * This will return all elements that are either intersecting
     * with a given rectangle or are perfectly inside it. For testing,
     * the element's paint bbox will be used.
     * @param {GRect} rect the rect to test against
     * @param {Boolean} inside if true, matches need to be fully
     * enclosed by the rect to be returned, otherwise it is enough
     * when they're intersecting with rect. Defaults to false.
     * @return {Array<GElement>} an array of elements that are part
     * of a given rectangle in their natural order. May return an empty array.
     */
    GScene.prototype.getElementsByBBox = function (rect, inside) {
        // TODO: Optimize this by using spatial map
        var result = [];
        this.acceptChildren(function (node) {
                if (node instanceof GElement) {
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
     * Returns the currently active layer if any or null
     * @return {GLayer}
     */
    GScene.prototype.getActiveLayer = function () {
        // TODO : Cache result
        return this.querySingle('layer:active');
    };

    /**
     * Assigns a currently active layer, this may also switch
     * the currently active page
     * @param {GLayer} layer the layer made active
     */
    GScene.prototype.setActiveLayer = function (layer) {
        // Now activate the layer
        this.acceptChildren(function (node) {
            if (node instanceof GLayer && node !== layer) {
                node.removeFlag(GNode.Flag.Active);
            }
        });

        layer.setFlag(GNode.Flag.Active);
    };

    /**
     * Invalidate something
     * @param {GRect} [area] optional dirty area, if null marks the whole scene as being dirty
     * @private
     */
    GScene.prototype._invalidateArea = function (area) {
        if (this.hasEventListeners(GScene.InvalidationRequestEvent)) {
            this.trigger(new GScene.InvalidationRequestEvent(area));
        }
    };

    /** @override */
    GScene.prototype._paintChildren = function (context) {
        if (context.configuration.clipArea) {
            var r = context.configuration.clipArea;
            context.canvas.clipRect(r.getX(), r.getY(), r.getWidth(), r.getHeight());
        }

        for (var node = this.getFirstChild(); node != null; node = node.getNext()) {
            if (node instanceof GElement) {
                node.paint(context);
            }
        }

        if (context.configuration.clipArea) {
            context.canvas.resetClip();
        }
    };

    /** @override */
    GScene.prototype._handleChange = function (change, args) {
        if (change === GNode._Change.Store) {
            this.storeProperties(args, GScene.MetaProperties);
        } else if (change === GNode._Change.Restore) {
            this.restoreProperties(args, GScene.MetaProperties);
        }

        GElement.prototype._handleChange.call(this, change, args);
    };

    _.GScene = GScene;
})(this);