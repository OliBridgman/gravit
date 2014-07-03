(function (_) {

    /**
     * Base class for a color matcher
     * @class GColorMatcher
     * @constructor
     */
    function GColorMatcher() {
    };

    GColorMatcher.CATEGORY_HARMONY = new IFLocale.Key(GColorMatcher, "category.harmony");
    GColorMatcher.CATEGORY_PALETTE = new IFLocale.Key(GColorMatcher, "category.palette");

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
     * Called to match and return an array of matching
     * colors. Note that more than eight colors will be cut off.
     * Returning null or empty array will ignore the call.
     * @param {IFColor} referenceColor a reference color
     * used for matching
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