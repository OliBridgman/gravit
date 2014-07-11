(function (_) {
    /**
     * A scene covers all graphical resources
     * @class IFScene
     * @extends IFElement
     * @mixes IFNode.Container
     * @mixes IFNode.Properties
     * @mixes IFNode.Store
     * @mixes GEventTarget
     * @constructor
     */
    function IFScene() {
        IFElement.call(this);
        this._scene = this;
        this._references = {};
        this._links = {};
        this._setDefaultProperties(IFScene.MetaProperties);
    }

    IFNode.inheritAndMix("scene", IFScene, IFElement, [IFNode.Container, IFNode.Properties, IFNode.Store, GEventTarget]);

    /**
     * The padding between pages
     * @type {number}
     */
    IFScene.PAGE_SPACING = 10;

    /**
     * The current version of scenes
     * @type {Number}
     */
    IFScene.VERSION = 1;

    /**
     * The meta properties of a scene and their defaults
     */
    IFScene.MetaProperties = {
        /** Version of the scene */
        version: IFScene.VERSION,
        /** The unit used externally */
        unit: IFLength.Unit.PT,
        /** The snap distance */
        snapDist: 3,
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
    // IFScene.InvalidationRequestEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for an invalidation request event
     * @param {GRect} [area] a repaint area, defaults to null means to repaint all
     * @class IFScene.InvalidationRequestEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    IFScene.InvalidationRequestEvent = function (area) {
        this.area = area ? area : null;
    };
    IFObject.inherit(IFScene.InvalidationRequestEvent, GEvent);

    /** @type GRect */
    IFScene.InvalidationRequestEvent.prototype.area = null;

    /** @override */
    IFScene.InvalidationRequestEvent.prototype.toString = function () {
        return "[Event IFScene.InvalidationRequestEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFScene.StyleCollection Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class IFScene.StyleCollection
     * @extends IFNode
     * @mixes IFNode.Container
     * @mixes IFNode.Store
     * @private
     */
    IFScene.StyleCollection = function () {
        IFNode.call(this);
    }

    IFNode.inheritAndMix("styleCollection", IFScene.StyleCollection, IFNode, [IFNode.Container, IFNode.Store]);

    /** @override */
    IFScene.StyleCollection.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFScene;
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFScene.SwatchCollection Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class IFScene.SwatchCollection
     * @extends IFNode
     * @mixes IFNode.Container
     * @mixes IFNode.Store
     * @private
     */
    IFScene.SwatchCollection = function () {
        IFNode.call(this);
    }

    IFNode.inheritAndMix("swatchCollection", IFScene.SwatchCollection, IFNode, [IFNode.Container, IFNode.Store]);

    /** @override */
    IFScene.SwatchCollection.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFScene;
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFScene Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @type {{}}
     * @private
     */
    IFScene.prototype._references = null;

    /**
     * @type {{}}
     * @private
     */
    IFScene.prototype._links = null;

    /**
     * @type {IFScene.StyleCollection}
     * @private
     */
    IFScene._styleCollection = null;

    /**
     * @type {IFScene.SwatchCollection}
     * @private
     */
    IFScene._swatchCollection = null;

    /**
     * Returns the style-collection of this scene
     * @returns {IFScene.StyleCollection}
     */
    IFScene.prototype.getStyleCollection = function () {
        // If we have a _styleCollection reference and it not
        // has ourself as a parent, then clear it, first
        if (this._styleCollection && this._styleCollection.getParent() !== this) {
            this._styleCollection = null;
        }

        if (!this._styleCollection) {
            // Find our style-collection and save reference for faster access
            for (var child = this.getFirstChild(true); child !== null; child = child.getNext(true)) {
                if (child instanceof IFScene.StyleCollection) {
                    this._styleCollection = child;
                    break;
                }
            }
        }

        if (!this._styleCollection) {
            this._styleCollection = new IFScene.StyleCollection();
            this.appendChild(this._styleCollection);
        }

        return this._styleCollection;
    };

    /**
     * Returns the swatch-collection of this scene
     * @returns {IFScene.SwatchCollection}
     */
    IFScene.prototype.getSwatchCollection = function () {
        // If we have a _swatchCollection reference and it not
        // has ourself as a parent, then clear it, first
        if (this._swatchCollection && this._swatchCollection.getParent() !== this) {
            this._swatchCollection = null;
        }

        if (!this._swatchCollection) {
            // Find our swatch-collection and save reference for faster access
            for (var child = this.getFirstChild(true); child !== null; child = child.getNext(true)) {
                if (child instanceof IFScene.SwatchCollection) {
                    this._swatchCollection = child;
                    break;
                }
            }
        }

        if (!this._swatchCollection) {
            this._swatchCollection = new IFScene.SwatchCollection();
            this.appendChild(this._swatchCollection);
        }

        return this._swatchCollection;
    };

    /** @override */
    IFScene.prototype.store = function (blob) {
        if (IFNode.Store.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFScene.MetaProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFScene.prototype.restore = function (blob) {
        if (IFNode.Store.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFScene.MetaProperties);
            return true;
        }
        return false;
    };

    /**
     * Converts a string into a length with the document's unit.
     * @param {string} string a number, a length or an equation
     * @returns {IFLength} a length in document units or null
     * if string couldn't be parsed
     */
    IFScene.prototype.stringToLength = function (string) {
        return IFLength.parseEquation(string, this.$unit);
    };

    /**
     * Converts a string into a point value with the document's unit.
     * @param {string} string a number, a length or an equation
     * @returns {Number} a length in points or null
     * if string couldn't be parsed
     */
    IFScene.prototype.stringToPoint = function (string) {
        var length = this.stringToLength(string);
        if (length) {
            return length.toPoint();
        }
        return null;
    };

    /**
     * Converts a length into a string with the document's unit.
     * @param {IFLength} length the length to convert
     * @returns {string} the resulting string without unit postfix
     */
    IFScene.prototype.lengthToString = function (length) {
        return ifUtil.formatNumber(length.toUnit(this.$unit));
    };

    /**
     * Converts a point value into a string with the document's unit.
     * @param {Number} value the value in points to convert
     * @returns {string} the resulting string without unit postfix
     */
    IFScene.prototype.pointToString = function (value) {
        return this.lengthToString(new IFLength(value));
    };

    /**
     * This will return all elements that are either intersecting
     * with a given rectangle or are perfectly inside it. For testing,
     * the element's paint bbox will be used.
     * @param {GRect} rect the rect to test against
     * @param {Boolean} inside if true, matches need to be fully
     * enclosed by the rect to be returned, otherwise it is enough
     * when they're intersecting with rect. Defaults to false.
     * @return {Array<IFElement>} an array of elements that are part
     * of a given rectangle in their natural order. May return an empty array.
     */
    IFScene.prototype.getElementsByBBox = function (rect, inside) {
        // TODO: Optimize this by using spatial map
        var result = [];
        this.acceptChildren(function (node) {
                if (node instanceof IFElement) {
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
     * Returns a point for a new page to be inserted
     * @returns {GPoint}
     */
    IFScene.prototype.getPageInsertPosition = function () {
        // TODO : Figure better way to avoid any potential intersection of the page with others
        for (var child = this.getLastChild(); child !== null; child = child.getPrevious()) {
            if (child instanceof IFPage) {
                return new GPoint(
                    child.getProperty('x') + child.getProperty('w') + IFScene.PAGE_SPACING,
                    child.getProperty('y')
                );
            }
        }
        return new GPoint(0, 0);
    };

    /**
     * Checks and returns wether a given page will intersect with
     * any other page(s) with a given pageRect
     * @param {IFPage} page the page to test for intersection w/ others
     * @param {GRect} pageRect the new page rect to test for intersection w/ others
     */
    IFScene.prototype.willPageIntersectWithOthers = function (page, pageRect) {
        pageRect = pageRect.expanded(IFScene.PAGE_SPACING, IFScene.PAGE_SPACING, IFScene.PAGE_SPACING, IFScene.PAGE_SPACING);
        for (var child = this.getLastChild(); child !== null; child = child.getPrevious()) {
            if (child instanceof IFPage && child !== page) {
                var currentPageRect = child.getGeometryBBox();
                if (currentPageRect && currentPageRect.intersectsRect(pageRect)) {
                    return true;
                }
            }
        }
        return false;
    };

    /**
     * Links a referenceable target to a linked node
     * @param {IFNode.Reference} target referenceable target to be linked against
     * @param {IFNode} link linked node to be linked from
     */
    IFScene.prototype.link = function (target, link) {
        var referenceId = target.getReferenceId();
        if (!this._links.hasOwnProperty(referenceId)) {
            this._links[referenceId] = [];
        }
        this._links[referenceId].push(link);
    };

    /**
     * Unlinks a referenceable target from a linked node
     * @param {IFNode.Reference} target referenceable target to be unlinked to
     * @param {IFNode} link linked node to be unlinked from
     */
    IFScene.prototype.unlink = function (target, link) {
        var referenceId = target.getReferenceId();
        if (this._links.hasOwnProperty(referenceId)) {
            var links = this._links[referenceId];
            var index = links.indexOf(link);
            if (index >= 0) {
                links.splice(index, 1);
                if (links.length === 0) {
                    delete this._links[referenceId];
                }
            }
        }
    };

    /**
     * Visits all links linking to a specific target node
     * @param {IFNode.Reference} target the target node to visit links for
     * @param {Function} visitor the visitor function called for each
     * link with the link being the only argument
     */
    IFScene.prototype.visitLinks = function (target, visitor) {
        var links = this._links[target.getReferenceId()];
        if (links) {
            for (var i = 0; i < links.length; ++i) {
                visitor(links[i]);
            }
        }
    };

    /**
     * Returns whether a given reference node has links or not
     * @param {IFNode.Reference} reference
     * @returns {boolean}
     */
    IFScene.prototype.hasLinks = function (reference) {
        return this._links.hasOwnProperty(reference.getReferenceId());
    };

    /**
     * Register a referenceable node
     * @param {IFNode.Reference} reference
     */
    IFScene.prototype.addReference = function (reference) {
        var referenceId = reference.getReferenceId();
        if (this._references.hasOwnProperty(referenceId)) {
            throw new Error('Reference allready added.');
        }
        this._references[referenceId] = reference;
    };

    /**
     * Unregister a referenceable node
     * @param {IFNode.Reference} reference
     */
    IFScene.prototype.removeReference = function (reference) {
        var referenceId = reference.getReferenceId();
        if (!this._references.hasOwnProperty(referenceId)) {
            throw new Error('Reference not yet added.');
        }
        delete this._references[referenceId];
    };

    /**
     * Returns a reference node by it's id if any
     * @param {String} referenceId
     * @return {IFNode.Reference}
     */
    IFScene.prototype.getReference = function (referenceId) {
        if (this._references.hasOwnProperty(referenceId)) {
            return this._references[referenceId];
        }
        return null;
    };

    /**
     * Invalidate something
     * @param {GRect} [area] optional dirty area, if null marks the whole scene as being dirty
     * @private
     */
    IFScene.prototype._invalidateArea = function (area) {
        if (this.hasEventListeners(IFScene.InvalidationRequestEvent)) {
            this.trigger(new IFScene.InvalidationRequestEvent(area));
        }
    };

    /** @override */
    IFScene.prototype._handleChange = function (change, args) {
        // Handle some properties that require an invalidation of the scene
        if (change == IFNode._Change.AfterPropertiesChange) {
            if (args.properties.indexOf('unit') >= 0) {
                this._invalidateArea();
            }
        }

        IFElement.prototype._handleChange.call(this, change, args);
    };

    _.IFScene = IFScene;
})(this);