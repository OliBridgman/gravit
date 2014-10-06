(function (_) {

    /**
     * Analogous Color Matcher
     * @class GAnalogousMatcher
     * @extends GColorMatcher
     * @constructor
     */
    function GAnalogousMatcher() {
    };
    IFObject.inherit(GAnalogousMatcher, GColorMatcher);

    GAnalogousMatcher.TITLE = new IFLocale.Key(GAnalogousMatcher, "title");

    /** @override */
    GAnalogousMatcher.prototype.getTitle = function () {
        return GAnalogousMatcher.TITLE;
    };

    /** @override */
    GAnalogousMatcher.prototype.getCategory = function () {
        return GColorMatcher.CATEGORY_HARMONY;
    };

    /** @override */
    GAnalogousMatcher.prototype.match = function (referenceColor) {
        var result = [];
        var hslLeft = referenceColor.asHSL();
        var hslRight = hslLeft.slice();
        var step = 180.0 / 8;
        for (var i = 3; i >= 0; --i) {
            hslRight[0] = IFMath.normalizeAngleDegrees(hslRight[0] + step);
            result[i] = (new IFColor(IFColor.Type.HSL, hslRight));
        }
        for (var i = 0; i < 4; ++i) {
            hslLeft[0] = IFMath.normalizeAngleDegrees(hslLeft[0] - step);
            result.push(new IFColor(IFColor.Type.HSL, hslLeft));
        }
        return result;
    };

    /** @override */
    GAnalogousMatcher.prototype.toString = function () {
        return "[Object GAnalogousMatcher]";
    };

    _.GAnalogousMatcher = GAnalogousMatcher;
})(this);