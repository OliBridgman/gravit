(function (_) {

    /**
     * Complementary Color Matcher
     * @class GComplementaryMatcher
     * @extends GColorMatcher
     * @constructor
     */
    function GComplementaryMatcher() {
    };
    IFObject.inherit(GComplementaryMatcher, GColorMatcher);

    GComplementaryMatcher.TITLE = new IFLocale.Key(GComplementaryMatcher, "title");

    /** @override */
    GComplementaryMatcher.prototype.getTitle = function () {
        return GComplementaryMatcher.TITLE;
    };

    /** @override */
    GComplementaryMatcher.prototype.getCategory = function () {
        return GColorMatcher.CATEGORY_HARMONY;
    };

    /** @override */
    GComplementaryMatcher.prototype.init = function (htmlElement) {
    };

    /** @override */
    GComplementaryMatcher.prototype.isReferenceColorBased = function () {
        return true;
    };

    /** @override */
    GComplementaryMatcher.prototype.match = function (referenceColor) {
        var hsl = referenceColor.asHSL();
        hsl[0] = ifMath.normalizeAngleDegrees(hsl[0] + 180);
        return [new IFColor(IFColor.Type.HSL, hsl)];
    };

    /** @override */
    GComplementaryMatcher.prototype.toString = function () {
        return "[Object GComplementaryMatcher]";
    };

    _.GComplementaryMatcher = GComplementaryMatcher;
})(this);