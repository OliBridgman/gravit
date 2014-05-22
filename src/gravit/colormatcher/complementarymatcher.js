(function (_) {

    /**
     * Complementary Color Matcher
     * @class EXComplementaryMatcher
     * @extends EXColorMatcher
     * @constructor
     */
    function EXComplementaryMatcher() {
    };
    IFObject.inherit(EXComplementaryMatcher, EXColorMatcher);

    EXComplementaryMatcher.TITLE = new IFLocale.Key(EXComplementaryMatcher, "title");

    /** @override */
    EXComplementaryMatcher.prototype.getTitle = function () {
        return EXComplementaryMatcher.TITLE;
    };

    /** @override */
    EXComplementaryMatcher.prototype.getCategory = function () {
        return EXColorMatcher.CATEGORY_HARMONY;
    };

    /** @override */
    EXComplementaryMatcher.prototype.init = function (htmlElement) {
    };

    /** @override */
    EXComplementaryMatcher.prototype.isReferenceColorBased = function () {
        return true;
    };

    /** @override */
    EXComplementaryMatcher.prototype.match = function (referenceColor) {
        var hsl = referenceColor.asHSL();
        hsl[0] = ifMath.normalizeAngleDegrees(hsl[0] + 180);
        return [new IFColor(IFColor.Type.HSL, hsl)];
    };

    /** @override */
    EXComplementaryMatcher.prototype.toString = function () {
        return "[Object EXComplementaryMatcher]";
    };

    _.EXComplementaryMatcher = EXComplementaryMatcher;
})(this);