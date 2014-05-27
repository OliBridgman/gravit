(function (_) {

    /**
     * Base class for a color matcher
     * @class GColorMatcher
     * @extends GEventTarget
     * @constructor
     */
    function GColorMatcher() {
    };
    IFObject.inherit(GColorMatcher, GEventTarget);

    GColorMatcher.CATEGORY_HARMONY = new IFLocale.Key(GColorMatcher, "category.harmony");
    GColorMatcher.CATEGORY_PALETTE = new IFLocale.Key(GColorMatcher, "category.palette");

    // -----------------------------------------------------------------------------------------------------------------
    // GColorMatcher.MatchUpdateEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event whenever the matches are updated
     * @class GColorMatcher.MatchUpdateEvent
     * @extends GEvent
     * @constructor
     */
    GColorMatcher.MatchUpdateEvent = function () {
    };
    IFObject.inherit(GColorMatcher.MatchUpdateEvent, GEvent);

    /** @override */
    GColorMatcher.MatchUpdateEvent.prototype.toString = function () {
        return "[Object GColorMatcher.MatchUpdateEvent]";
    };

    GColorMatcher.MATCH_UPDATE_EVENT = new GColorMatcher.MatchUpdateEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // GColorMatcher Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * Get the title of the matcher
     * @return {String|IFLocale.Key}
     */
    GColorMatcher.prototype.getTitle = function () {
        throw new Error("Not Supported");
    };

    /**
     * Get the category of the matcher
     * @return {String|IFLocale.Key}
     */
    GColorMatcher.prototype.getCategory = function () {
        return null;
    };

    /**
     * Whether the matcher works on a given reference color or not
     * @return {Boolean}
     */
    GColorMatcher.prototype.isReferenceColorBased = function () {
        return false;
    };

    /**
     * Called to let the matcher initialize on a given panel
     * @param {HTMLDivElement} htmlElement the panel
     */
    GColorMatcher.prototype.init = function (htmlElement) {
        // NO-OP
    };

    /**
     * Called to match and return an array of matching
     * colors. Note that more than eight colors will be cut off.
     * Returning null or empty array will ignore the call.
     * @param {IFColor} referenceColor a reference color
     * used for matching. This is null if the matcher is not
     * reference color based.
     * @return {Array<IFColor>}
     */
    GColorMatcher.prototype.match = function (referenceColor) {
        throw new Error("Not Supported");
    };

    /** @override */
    GColorMatcher.prototype.toString = function () {
        return "[Object GColorMatcher]";
    };

    _.GColorMatcher = GColorMatcher;
})(this);