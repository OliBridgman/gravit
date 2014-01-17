(function (_) {

    /**
     * Base class for a color matcher
     * @class EXColorMatcher
     * @extends GEventTarget
     * @constructor
     */
    function EXColorMatcher() {
    };
    GObject.inherit(EXColorMatcher, GEventTarget);

    EXColorMatcher.CATEGORY_HARMONY = new GLocale.Key(EXColorMatcher, "category.harmony");
    EXColorMatcher.CATEGORY_PALETTE = new GLocale.Key(EXColorMatcher, "category.palette");

    // -----------------------------------------------------------------------------------------------------------------
    // EXColorMatcher.MatchUpdateEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event whenever the matches are updated
     * @class EXColorMatcher.MatchUpdateEvent
     * @extends GEvent
     * @constructor
     */
    EXColorMatcher.MatchUpdateEvent = function () {
    };
    GObject.inherit(EXColorMatcher.MatchUpdateEvent, GEvent);

    /** @override */
    EXColorMatcher.MatchUpdateEvent.prototype.toString = function () {
        return "[Object EXColorMatcher.MatchUpdateEvent]";
    };

    EXColorMatcher.MATCH_UPDATE_EVENT = new EXColorMatcher.MatchUpdateEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // EXColorMatcher Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * Get the title of the matcher
     * @return {String|GLocale.Key}
     */
    EXColorMatcher.prototype.getTitle = function () {
        throw new Error("Not Supported");
    };

    /**
     * Get the category of the matcher
     * @return {String|GLocale.Key}
     */
    EXColorMatcher.prototype.getCategory = function () {
        return null;
    };

    /**
     * Whether the matcher works on a given reference color or not
     * @return {Boolean}
     */
    EXColorMatcher.prototype.isReferenceColorBased = function () {
        return false;
    };

    /**
     * Called to let the matcher initialize on a given panel
     * @param {HTMLDivElement} htmlElement the panel
     */
    EXColorMatcher.prototype.init = function (htmlElement) {
        // NO-OP
    };

    /**
     * Called to match and return an array of matching
     * colors. Note that more than eight colors will be cut off.
     * Returning null or empty array will ignore the call.
     * @param {GXColor} referenceColor a reference color
     * used for matching. This is null if the matcher is not
     * reference color based.
     * @return {Array<GXColor>}
     */
    EXColorMatcher.prototype.match = function (referenceColor) {
        throw new Error("Not Supported");
    };

    /** @override */
    EXColorMatcher.prototype.toString = function () {
        return "[Object EXColorMatcher]";
    };

    _.EXColorMatcher = EXColorMatcher;
})(this);