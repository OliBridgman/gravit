(function (_) {

    /**
     * Analogous Color Matcher
     * @class EXAnalogousMatcher
     * @extends EXColorMatcher
     * @constructor
     */
    function EXAnalogousMatcher() {
    };
    GObject.inherit(EXAnalogousMatcher, EXColorMatcher);

    EXAnalogousMatcher.TITLE = new GLocale.Key(EXAnalogousMatcher, "title");

    /** @override */
    EXAnalogousMatcher.prototype.getTitle = function () {
        return EXAnalogousMatcher.TITLE;
    };

    /** @override */
    EXAnalogousMatcher.prototype.getCategory = function () {
        return EXColorMatcher.CATEGORY_HARMONY;
    };

    /** @override */
    EXAnalogousMatcher.prototype.init = function (htmlElement) {
    };

    /** @override */
    EXAnalogousMatcher.prototype.isReferenceColorBased = function () {
        return true;
    };

    /** @override */
    EXAnalogousMatcher.prototype.match = function (referenceColor) {
        var result = [];
        var hslLeft = referenceColor.asHSL();
        var hslRight = hslLeft.slice();
        var step = 180.0 / 8;
        for (var i = 3; i >= 0; --i) {
            hslRight[0] = gMath.normalizeAngleDegrees(hslRight[0] + step);
            result[i] = (new GXColor(GXColor.Type.HSL, hslRight));
        }
        for (var i = 0; i < 4; ++i) {
            hslLeft[0] = gMath.normalizeAngleDegrees(hslLeft[0] - step);
            result.push(new GXColor(GXColor.Type.HSL, hslLeft));
        }
        return result;
    };

    /** @override */
    EXAnalogousMatcher.prototype.toString = function () {
        return "[Object EXAnalogousMatcher]";
    };

    _.EXAnalogousMatcher = EXAnalogousMatcher;
})(this);