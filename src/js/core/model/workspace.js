(function (_) {
    /**
     * A workspace covers all graphical resources
     * @class GWorkspace
     * @extends GEventTarget
     * @constructor
     */
    function GWorkspace() {
        this._references = {};
        this._links = {};
        this._swatches = new GSwatches(this);
        this._styles = new GStyles(this);
        this._version = GWorkspace.VERSION;
        this._unit = GLength.Unit.PT;
        this._guides = null;
        this._snapDistance = 5;
        this._pickDistance = 3;
        this._cursorDistanceSmall = 1;
        this._cursorDistanceBig = 10;
        this._cursorConstraint = 0;
    }

    GObject.inherit(GWorkspace, GEventTarget);

    /**
     * The current version of the workspace
     * @type {Number}
     */
    GWorkspace.VERSION = 1;

    // -----------------------------------------------------------------------------------------------------------------
    // GWorkspace.ReferenceEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event whenever a reference has been either linked or unlinked
     * @param {GNode.Reference} reference the affected reference
     * @param {GNode} target the target that was linked/unlinked against reference
     * @param {Boolean} linked if true, reference was linked, otherwise unlinked
     * @class GWorkspace.ReferenceEvent
     * @extends GEvent
     * @constructor
     */
    GWorkspace.ReferenceEvent = function (reference, target, linked) {
        this.reference = reference;
        this.target = target;
        this.linked = linked;
    };
    GObject.inherit(GWorkspace.ReferenceEvent, GEvent);

    /** @type {GNode.Reference} */
    GWorkspace.ReferenceEvent.prototype.reference = null;

    /** @type {GNode} */
    GWorkspace.ReferenceEvent.prototype.target = null;

    /** @type {Boolean} */
    GWorkspace.ReferenceEvent.prototype.linked = null;

    /** @override */
    GWorkspace.ReferenceEvent.prototype.toString = function () {
        return "[Event GWorkspace.ReferenceEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GWorkspace.ResolveUrlEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for resolving a given url. If one handles this event,
     * it should call the resolved callback with the resolved url
     * @param {String} url
     * @param {Function} resolved
     * @class GWorkspace.ResolveUrlEvent
     * @extends GEvent
     * @constructor
     */
    GWorkspace.ResolveUrlEvent = function (url, resolved) {
        this.url = url;
        this.resolved = resolved;
    };
    GObject.inherit(GWorkspace.ResolveUrlEvent, GEvent);

    /** @type String */
    GWorkspace.ResolveUrlEvent.prototype.url = null;

    /** @type Function */
    GWorkspace.ResolveUrlEvent.prototype.resolved = null;

    /** @override */
    GWorkspace.ResolveUrlEvent.prototype.toString = function () {
        return "[Event GWorkspace.ResolveUrlEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GWorkspace Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @type {{}}
     * @private
     */
    GWorkspace.prototype._references = null;

    /**
     * @type {{}}
     * @private
     */
    GWorkspace.prototype._links = null;

    /**
     * @type {GSwatches}
     * @private
     */
    GWorkspace.prototype._swatches = null;

    /**
     * @type {GStyles}
     * @private
     */
    GWorkspace.prototype._styles = null;

    /**
     * Version of the workspace
     * @type {Number}
     * @private
     */
    GWorkspace.prototype._version = null;

    /**
     * The unit used externally
     * @type {Number}
     * @private
     */
    GWorkspace.prototype._unit = null;

    /**
     * The guides in use
     * @type {Array<String>}
     * @private
     */
    GWorkspace.prototype._guides = null;

    /**
     * The snap distance
     * @type {Number}
     * @private
     */
    GWorkspace.prototype._snapDistance = null;

    /**
     * The pick distance
     * @type {Number}
     * @private
     */
    GWorkspace.prototype._pickDistance = null;

    /**
     * The cursor small distance
     * @type {Number}
     * @private
     */
    GWorkspace.prototype._cursorDistanceSmall = null;

    /**
     * The cursor big distance
     * @type {Number}
     * @private
     */
    GWorkspace.prototype._cursorDistanceBig = null;

    /**
     * The cursor constraint in radians
     * @type {Number}
     * @private
     */
    GWorkspace.prototype._cursorConstraint = null;

    /**
     * @returns {Array<String>}
     */
    GWorkspace.prototype.getGuides = function () {
        return this._guides;
    };

    /**
     * @param {Array<String>} guides
     */
    GWorkspace.prototype.setGuides = function (guides) {
        this._guides = guides ? guides.slice() : null;
    };

    /**
     * @returns {Number}
     */
    GWorkspace.prototype.getSnapDistance = function () {
        return this._snapDistance;
    };

    /**
     * @returns {GSwatches}
     */
    GWorkspace.prototype.getSwatches = function () {
        return this._swatches;
    };

    /**
     * @returns {GStyles}
     */
    GWorkspace.prototype.getStyles = function () {
        return this._styles;
    };

    GWorkspace.prototype.getPages = function () {
        return [];
    };

    GWorkspace.prototype.getPageName = function (pageId) {
        return null;
    };

    /**
     * Converts a string into a length with the document's unit.
     * @param {string} string a number, a length or an equation
     * @returns {GLength} a length in document units or null
     * if string couldn't be parsed
     */
    GWorkspace.prototype.stringToLength = function (string) {
        return GLength.parseEquation(string, this.$unit);
    };

    /**
     * Converts a string into a point value with the document's unit.
     * @param {string} string a number, a length or an equation
     * @returns {Number} a length in points or null
     * if string couldn't be parsed
     */
    GWorkspace.prototype.stringToPoint = function (string) {
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
    GWorkspace.prototype.lengthToString = function (length) {
        return GUtil.formatNumber(length.toUnit(this.$unit));
    };

    /**
     * Converts a point value into a string with the document's unit.
     * @param {Number} value the value in points to convert
     * @returns {string} the resulting string without unit postfix
     */
    GWorkspace.prototype.pointToString = function (value) {
        return this.lengthToString(new GLength(value));
    };

    /**
     * Links a referenceable target to a linked node
     * @param {GNode.Reference} target referenceable target to be linked against
     * @param {GNode} link linked node to be linked from
     */
    GWorkspace.prototype.link = function (target, link) {
        var referenceId = target.getReferenceId();
        if (!this._links.hasOwnProperty(referenceId)) {
            this._links[referenceId] = [];
        }
        this._links[referenceId].push(link);

        if (this.hasEventListeners(GWorkspace.ReferenceEvent)) {
            this.trigger(new GWorkspace.ReferenceEvent(target, link, true));
        }
    };

    /**
     * Unlinks a referenceable target from a linked node
     * @param {GNode.Reference} target referenceable target to be unlinked to
     * @param {GNode} link linked node to be unlinked from
     */
    GWorkspace.prototype.unlink = function (target, link) {
        var referenceId = target.getReferenceId();
        if (this._links.hasOwnProperty(referenceId)) {
            var links = this._links[referenceId];
            var index = links.indexOf(link);
            if (index >= 0) {
                links.splice(index, 1);
                if (links.length === 0) {
                    delete this._links[referenceId];
                }

                if (this.hasEventListeners(GWorkspace.ReferenceEvent)) {
                    this.trigger(new GWorkspace.ReferenceEvent(target, link, false));
                }
            }
        }
    };

    /**
     * Visits all links linking to a specific target node
     * @param {GNode.Reference} target the target node to visit links for
     * @param {Function} visitor the visitor function called for each
     * link with the link being the only argument
     */
    GWorkspace.prototype.visitLinks = function (target, visitor) {
        var links = this._links[target.getReferenceId()];
        if (links) {
            links = links.slice();
            for (var i = 0; i < links.length; ++i) {
                visitor(links[i]);
            }
        }
    };

    /**
     * Returns whether a given reference node has links or not
     * @param {GNode.Reference} reference
     * @returns {boolean}
     */
    GWorkspace.prototype.hasLinks = function (reference) {
        return this._links.hasOwnProperty(reference.getReferenceId());
    };

    /**
     * Returns the number of links a given reference has
     * @param {GNode.Reference} reference
     * @returns {Number}
     */
    GWorkspace.prototype.linkCount = function (reference) {
        var links = this._links[reference.getReferenceId()];
        if (links) {
            return links.length;
        }
        return 0;
    };

    /**
     * Register a referenceable node
     * @param {GNode.Reference} reference
     */
    GWorkspace.prototype.addReference = function (reference) {
        var referenceId = reference.getReferenceId();
        if (this._references.hasOwnProperty(referenceId)) {
            throw new Error('Reference already added.');
        }
        this._references[referenceId] = reference;
    };

    /**
     * Unregister a referenceable node
     * @param {GNode.Reference} reference
     */
    GWorkspace.prototype.removeReference = function (reference) {
        var referenceId = reference.getReferenceId();
        if (!this._references.hasOwnProperty(referenceId)) {
            throw new Error('Reference not yet added.');
        }
        delete this._references[referenceId];
    };

    /**
     * Returns a reference node by it's id if any
     * @param {String} referenceId
     * @return {GNode.Reference}
     */
    GWorkspace.prototype.getReference = function (referenceId) {
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
    GWorkspace.prototype.resolveUrl = function (url, resolved) {
        if (!url || url.indexOf('data:') === 0) {
            resolved(url);
        } else if (this.hasEventListeners(GWorkspace.ResolveUrlEvent)) {
            this.trigger(new GWorkspace.ResolveUrlEvent(url, resolved));
        }
    };

    /** @override */
    GWorkspace.prototype._handleChange = function (change, args) {
        if (change === GNode._Change.Store) {
            this.storeProperties(args, GWorkspace.MetaProperties);
        } else if (change === GNode._Change.Restore) {
            this.restoreProperties(args, GWorkspace.MetaProperties);
        }

        GNode.prototype._handleChange.call(this, change, args);
    };

    _.GWorkspace = GWorkspace;
})(this);