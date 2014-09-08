(function (_) {
    /**
     * A scene covers all graphical resources
     * @class IFScene
     * @extends IFElement
     * @mixes IFNode.Container
     * @mixes IFNode.Properties
     * @mixes IFNode.Store
     * @mixes IFEventTarget
     * @constructor
     */
    function IFScene() {
        IFElement.call(this);
        this._scene = this;
        this._references = {};
        this._links = {};
        this._setDefaultProperties(IFScene.MetaProperties);
    }

    IFNode.inheritAndMix("scene", IFScene, IFElement, [IFNode.Container, IFNode.Properties, IFNode.Store, IFEventTarget]);

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
        /** The default color space */
        clspace: IFColorSpace.RGB,
        /** The unit used externally */
        unit: IFLength.Unit.PT,
        /** Whether to snap to units or not */
        unitSnap: true,
        /** The snap distance */
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
        gridActive: false,
        /** Whether to use single or multi page mode */
        singlePage: true,
        /** Relative path to image assets */
        pathImage: 'images',
        /** Relative path to font assets */
        pathFont: 'fonts',
        /** Relative path to export assets */
        pathExport: 'export'
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFScene.InvalidationRequestEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for an invalidation request event
     * @param {IFRect} [area] a repaint area, defaults to null means to repaint all
     * @class IFScene.InvalidationRequestEvent
     * @extends IFEvent
     * @constructor
     * @version 1.0
     */
    IFScene.InvalidationRequestEvent = function (area) {
        this.area = area ? area : null;
    };
    IFObject.inherit(IFScene.InvalidationRequestEvent, IFEvent);

    /** @type IFRect */
    IFScene.InvalidationRequestEvent.prototype.area = null;

    /** @override */
    IFScene.InvalidationRequestEvent.prototype.toString = function () {
        return "[Event IFScene.InvalidationRequestEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFScene.ReferenceEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event whenever a reference has been either linked or unlinked
     * @param {IFNode.Reference} reference the affected reference
     * @param {IFNode} target the target that was linked/unlinked against reference
     * @param {Boolean} linked if true, reference was linked, otherwise unlinked
     * @class IFScene.ReferenceEvent
     * @extends IFEvent
     * @constructor
     */
    IFScene.ReferenceEvent = function (reference, target, linked) {
        this.reference = reference;
        this.target = target;
        this.linked = linked;
    };
    IFObject.inherit(IFScene.ReferenceEvent, IFEvent);

    /** @type {IFNode.Reference} */
    IFScene.ReferenceEvent.prototype.reference = null;

    /** @type {IFNode} */
    IFScene.ReferenceEvent.prototype.target = null;

    /** @type {Boolean} */
    IFScene.ReferenceEvent.prototype.linked = null;

    /** @override */
    IFScene.ReferenceEvent.prototype.toString = function () {
        return "[Event IFScene.ReferenceEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFScene.ResolveUrlEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for resolving a given url. If one handles this event,
     * it should call the resolved callback with the resolved url
     * @param {String} url
     * @param {Function} resolved
     * @class IFScene.ResolveUrlEvent
     * @extends IFEvent
     * @constructor
     */
    IFScene.ResolveUrlEvent = function (url, resolved) {
        this.url = url;
        this.resolved = resolved;
    };
    IFObject.inherit(IFScene.ResolveUrlEvent, IFEvent);

    /** @type String */
    IFScene.ResolveUrlEvent.prototype.url = null;

    /** @type Function */
    IFScene.ResolveUrlEvent.prototype.resolved = null;

    /** @override */
    IFScene.ResolveUrlEvent.prototype.toString = function () {
        return "[Event IFScene.ResolveUrlEvent]";
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
    IFScene.prototype._styleCollection = null;

    /**
     * @type {IFScene.SwatchCollection}
     * @private
     */
    IFScene.prototype._swatchCollection = null;

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
     * @param {IFRect} rect the rect to test against
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
     * Returns the currently active page if any or null
     * @return {IFPage}
     */
    IFScene.prototype.getActivePage = function () {
        // TODO : Cache result
        return this.querySingle('page:active');
    };

    /**
     * Assigns a currently active page
     * @param {IFPage} page the page made active
     */
    IFScene.prototype.setActivePage = function (page) {
        if (!page.isAttached()) {
            throw new Error('Page needs to be attached to be made active.');
        }

        for (var child = this.getFirstChild(); child !== null; child = child.getNext()) {
            if (child instanceof IFPage && child !== page) {
                child.removeFlag(IFNode.Flag.Active);
            }
        }

        page.setFlag(IFNode.Flag.Active);
    };

    /**
     * Returns the currently active layer if any or null
     * @return {IFLayer}
     */
    IFScene.prototype.getActiveLayer = function () {
        // TODO : Cache result
        return this.querySingle('page:active layer:active');
    };

    /**
     * Assigns a currently active layer, this may also switch
     * the currently active page
     * @param {IFLayer} layer the layer made active
     */
    IFScene.prototype.setActiveLayer = function (layer) {
        if (!layer.isAttached()) {
            throw new Error('Layer needs to be attached to be made active.');
        }

        // Make sure to activate parent page of layer, first
        var layerPage = layer.getPage();
        this.setActivePage(layerPage);

        // Now activate the layer
        layerPage.acceptChildren(function (node) {
            if (node instanceof IFLayer && node !== layer) {
                node.removeFlag(IFNode.Flag.Active);
            }
        });

        layer.setFlag(IFNode.Flag.Active);
    };

    /**
     * Returns a point for a new page to be inserted
     * @returns {IFPoint}
     */
    IFScene.prototype.getPageInsertPosition = function () {
        // TODO : Figure better way to avoid any potential intersection of the page with others
        for (var child = this.getLastChild(); child !== null; child = child.getPrevious()) {
            if (child instanceof IFPage) {
                return new IFPoint(
                    child.getProperty('x') + child.getProperty('w') + IFScene.PAGE_SPACING,
                    child.getProperty('y')
                );
            }
        }
        return new IFPoint(0, 0);
    };

    /**
     * Checks and returns wether a given page will intersect with
     * any other page(s) with a given pageRect
     * @param {IFPage} page the page to test for intersection w/ others
     * @param {IFRect} pageRect the new page rect to test for intersection w/ others
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

        if (this.hasEventListeners(IFScene.ReferenceEvent)) {
            this.trigger(new IFScene.ReferenceEvent(target, link, true));
        }
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

                if (this.hasEventListeners(IFScene.ReferenceEvent)) {
                    this.trigger(new IFScene.ReferenceEvent(target, link, false));
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
     * Returns the number of links a given reference has
     * @param {IFNode.Reference} reference
     * @returns {Number}
     */
    IFScene.prototype.linkCount = function (reference) {
        var links = this._links[reference.getReferenceId()];
        if (links) {
            return links.length;
        }
        return 0;
    };

    /**
     * Register a referenceable node
     * @param {IFNode.Reference} reference
     */
    IFScene.prototype.addReference = function (reference) {
        var referenceId = reference.getReferenceId();
        if (this._references.hasOwnProperty(referenceId)) {
            throw new Error('Reference already added.');
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
     * Try to resolve a given url. This is asynchron.
     * If the url is null or empty or a data url, it
     * is returned as is. Otherwise, if it was resolved,
     * the given resolved function containing the resolved
     * url as parameter will be called.
     * @param {String} url
     * @param {Function} resolved
     * @return {String}
     */
    IFScene.prototype.resolveUrl = function (url, resolved) {
        if (!url || url.indexOf('data:') === 0) {
            resolved(url);
        } else if (this.hasEventListeners(IFScene.ResolveUrlEvent)) {
            this.trigger(new IFScene.ResolveUrlEvent(url, resolved));
        }
    };

    /** @override */
    IFScene.prototype.hitTest = function (location, transform, acceptor, stacked, level, tolerance, force) {
        // In single page mode go straight to active page
        if (this.$singlePage) {
            var activePage = this.getActivePage();
            if (activePage) {
                return activePage.hitTest(location, transform, acceptor, stacked, level, tolerance, force);
            }
        }

        return IFElement.prototype.hitTest.call(this, location, transform, acceptor, stacked, level, tolerance, force);
    };

    /**
     * Invalidate something
     * @param {IFRect} [area] optional dirty area, if null marks the whole scene as being dirty
     * @private
     */
    IFScene.prototype._invalidateArea = function (area) {
        if (this.hasEventListeners(IFScene.InvalidationRequestEvent)) {
            this.trigger(new IFScene.InvalidationRequestEvent(area));
        }
    };

    /** @override */
    IFScene.prototype._renderChildren = function (context) {
        if (context.configuration.clipArea) {
            var r = context.configuration.clipArea;
            context.canvas.clipRect(r.getX(), r.getY(), r.getWidth(), r.getHeight());
        }

        for (var node = this.getFirstChild(); node != null; node = node.getNext()) {
            if (node instanceof IFPage) {
                // Handle single-page mode if set
                if (!this.$singlePage || node.hasFlag(IFNode.Flag.Active)) {
                    node.render(context);
                }
            } else if (node instanceof IFElement) {
                node.render(context);
            }
        }

        if (context.configuration.clipArea) {
            context.canvas.resetClip();
        }
    };

    IFScene.prototype._calculatePaintBBox = function () {
        var bbox = IFElement.prototype._calculatePaintBBox.call(this);
        if (this.__editor__ && this.__editor__.isTransformBoxActive()) {
            var transBBox = this.__editor__.getTransformBox()._calculatePaintBBox();
            if (transBBox && !transBBox.isEmpty()) {
                bbox = bbox ? bbox.united(transBBox) : transBBox;
            }
        }
        return bbox;
    };

    IFScene.prototype._calculateGeometryBBox = function () {
        var bbox = IFElement.prototype._calculateGeometryBBox.call(this);
        if (this.__editor__ && this.__editor__.isTransformBoxActive()) {
            var transBBox = this.__editor__.getTransformBox()._calculatePaintBBox();
            if (transBBox && !transBBox.isEmpty()) {
                bbox = bbox ? bbox.united(transBBox) : transBBox;
            }
        }
        return bbox;
    };

    /** @override */
    IFScene.prototype._handleChange = function (change, args) {
        IFElement.prototype._handleChange.call(this, change, args);
    };

    _.IFScene = IFScene;
})(this);